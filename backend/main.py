from llm_client import rewrite_note_with_llm
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re
from typing import List, Optional, Dict, Any
import pdfplumber

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    note: str

# -----------------------------
# Helper: Feature extractors
# -----------------------------
def extract_age(text: str) -> Optional[int]:
    m = re.search(r"(\d{2,3})[- ]?year[- ]?old", text, flags=re.IGNORECASE)
    if m:
        try:
            return int(m.group(1))
        except:
            return None
    # fallback: "Age: 82"
    m = re.search(r"Age[:\s]+(\d{1,3})", text, flags=re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None

def extract_o2_sat(text: str) -> Optional[int]:
    # patterns: "O2 sat 88%", "O2 saturation 88 %", "SpO2 88%"
    m = re.search(r"(?:O2|SpO2|Oxygen(?:\s*)sat(?:uration)?)[:\s]*?(\d{2})(?:\s*%)?", text, flags=re.IGNORECASE)
    if m:
        try:
            return int(m.group(1))
        except:
            return None
    return None

def extract_creatinine(text: str) -> Optional[float]:
    m = re.search(r"creatinine[:\s]*([\d\.]{1,4})", text, flags=re.IGNORECASE)
    if m:
        try:
            return float(m.group(1))
        except:
            return None
    return None

def extract_troponin(text: str) -> Optional[float]:
    # matches values like "<0.012", "0.012", "2.4"
    m = re.search(r"troponin(?:\s*[it])?\s*[:\-\s]*<?\s*([0-9]*\.[0-9]+|[0-9]+)", text, flags=re.IGNORECASE)
    if m:
        try:
            return float(m.group(1))
        except:
            return None
    # fallback capture any ng/ml numeric
    m2 = re.search(r"([0-9]*\.[0-9]+|[0-9]+)\s*(?:ng\/?ml)", text, flags=re.IGNORECASE)
    if m2:
        try:
            return float(m2.group(1))
        except:
            return None
    return None

def extract_sbp(text: str) -> Optional[int]:
    # 106/65 -> capture first
    m = re.search(r"\b(\d{2,3})\s*/\s*(\d{2,3})\b", text)
    if m:
        return int(m.group(1))
    # "BP 106" or "BP: 106/65"
    m = re.search(r"\bBP[:\s]*?(\d{2,3})\b", text, flags=re.IGNORECASE)
    if m:
        return int(m.group(1))
    # "SBP 120"
    m = re.search(r"\bSBP[:\s]*?(\d{2,3})\b", text, flags=re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None

def detect_pneumonia(text: str) -> bool:
    return bool(re.search(r"\b(pneumonia|infiltrate|infiltrates|lobar pneumonia)\b", text, flags=re.IGNORECASE))

def detect_iv_antibiotics(text: str) -> bool:
    return bool(re.search(r"\bIV antibiotics\b|\bintravenous antibiotics\b|\bceftriaxone\b|\bvancomycin\b|\bpiperacillin\b", text, flags=re.IGNORECASE))

def detect_hemodynamic_instability_phrase(text: str) -> bool:
    return bool(re.search(r"\bhypotens(?:ion|ive)|hemodynam(?:ic)? instab|systolic.*\<\s*90\b|\bsbp.*\<\s*90\b", text, flags=re.IGNORECASE))

# -----------------------------
# Guideline parser (simplified)
# -----------------------------
def parse_guideline_thresholds(guideline_text: str) -> Dict[str, Any]:
    """
    Very small heuristic parser:
    - find patterns like '< 90' or '<90' after 'O2' or 'saturation' -> o2_sat_threshold
    - find troponin thresholds -> troponin_threshold
    - creatinine threshold -> creatinine_threshold
    - sbp threshold -> sbp_threshold
    If no threshold found, use sensible defaults.
    """
    txt = guideline_text or ""
    lower = txt.lower()

    rules: Dict[str, Any] = {
        "o2_sat_threshold": 90,
        "troponin_threshold": 0.04,    # default from your existing logic
        "creatinine_threshold": 1.5,
        "sbp_threshold": 90
    }

    # o2 patterns
    m = re.search(r"(?:o2|spO2|saturation)[^\d<\n]{0,40}<?\s*(\d{2})", txt, flags=re.IGNORECASE)
    if m:
        try:
            rules["o2_sat_threshold"] = int(m.group(1))
        except:
            pass

    # troponin thresholds (e.g., ">0.04")
    m = re.search(r"troponin[^\d\.\n]{0,40}([<>]=?\s*[0-9]*\.[0-9]+|[<>]=?\s*[0-9]+)", txt, flags=re.IGNORECASE)
    if m:
        token = m.group(1)
        nums = re.search(r"([0-9]*\.[0-9]+|[0-9]+)", token)
        if nums:
            try:
                rules["troponin_threshold"] = float(nums.group(1))
            except:
                pass

    # creatinine thresholds
    m = re.search(r"creatinine[^\d\.\n]{0,40}([<>]=?\s*[0-9]*\.[0-9]+|[<>]=?\s*[0-9]+)", txt, flags=re.IGNORECASE)
    if m:
        nums = re.search(r"([0-9]*\.[0-9]+|[0-9]+)", m.group(1))
        if nums:
            try:
                rules["creatinine_threshold"] = float(nums.group(1))
            except:
                pass

    # SBP
    m = re.search(r"(?:systolic|sbp|blood pressure)[^\d<\n]{0,40}<?\s*(\d{2,3})", txt, flags=re.IGNORECASE)
    if m:
        try:
            rules["sbp_threshold"] = int(m.group(1))
        except:
            pass

    return rules

# -----------------------------
# Rule engine (simplified scoring)
# -----------------------------
def evaluate_rules(features: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
    """
    features: extracted clinical features
    rules: parsed guideline thresholds
    returns: dict with score, level, justifications and missing criteria
    """
    score = 0
    justifications: List[str] = []
    missing: List[Dict[str, Any]] = []

    # Hypoxia
    o2 = features.get("o2_sat")
    if o2 is not None:
        if o2 < rules["o2_sat_threshold"]:
            score += 3
            justifications.append(f"Hypoxia documented: O2 sat {o2}% (<{rules['o2_sat_threshold']}%).")
    else:
        missing.append({"criteria": "Oxygen saturation", "status": "Missing", "evidence": "No O2 saturation documented", "guideline": f"O2 < {rules['o2_sat_threshold']}%"})

    # Pneumonia
    if features.get("pneumonia"):
        score += 2
        justifications.append("Radiographic evidence consistent with pneumonia.")
    else:
        missing.append({"criteria": "Radiographic evidence of pneumonia", "status": "Missing", "evidence": "No pneumonia language found", "guideline": "CXR showing pneumonia"})

    # Creatinine / AKI
    cr = features.get("creatinine")
    if cr is not None:
        if cr > rules["creatinine_threshold"]:
            score += 2
            justifications.append(f"Elevated creatinine {cr} (> {rules['creatinine_threshold']}) suggesting AKI or renal impairment.")
    else:
        missing.append({"criteria": "Creatinine", "status": "Missing", "evidence": "No creatinine documented", "guideline": f"Cr > {rules['creatinine_threshold']}"})

    # Troponin
    tr = features.get("troponin")
    if tr is not None:
        if tr > rules["troponin_threshold"]:
            score += 3
            justifications.append(f"Elevated troponin {tr} (> {rules['troponin_threshold']}) indicating myocardial injury.")
    else:
        # troponin might be optional, add as missing with lower weight
        missing.append({"criteria": "Troponin documentation", "status": "Missing", "evidence": "No troponin documented", "guideline": f"Troponin > {rules['troponin_threshold']}"})

    # Hemodynamic instability
    sbp = features.get("sbp")
    if sbp is not None:
        if sbp < rules["sbp_threshold"] or features.get("hemodynamic_phrase"):
            score += 3
            justifications.append(f"Hemodynamic instability: SBP {sbp} (<{rules['sbp_threshold']}).")
    else:
        if features.get("hemodynamic_phrase"):
            score += 3
            justifications.append("Hemodynamic instability phrase found in notes.")
        else:
            missing.append({"criteria": "Blood pressure", "status": "Missing", "evidence": "No SBP documented", "guideline": f"SBP < {rules['sbp_threshold']}"})

    # Age factor
    age = features.get("age")
    if age is not None and age >= 75:
        score += 1
        justifications.append(f"Advanced age: {age} years (increases risk).")

    # Required IV antibiotics
    if features.get("iv_antibiotics"):
        justifications.append("IV antibiotics documented (supports inpatient-level therapy).")
    else:
        missing.append({"criteria": "IV antibiotics (if required by guideline)", "status": "Missing", "evidence": "No IV antibiotics documented", "guideline": "IV antibiotics order"})

    # Determine level
    if score >= 6:
        level = "Inpatient - strongly supported"
    elif score >= 3:
        level = "Inpatient - possibly supported / consider observation"
    else:
        level = "Observation / outpatient likely"

    return {
        "score": score,
        "level": level,
        "justifications": justifications,
        "missingCriteria": missing
    }

# -----------------------------
# Analyze (text-only) - keep for compatibility
# -----------------------------
@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    note = data.note or ""
    features = {
        "age": extract_age(note),
        "o2_sat": extract_o2_sat(note),
        "creatinine": extract_creatinine(note),
        "troponin": extract_troponin(note),
        "sbp": extract_sbp(note),
        "pneumonia": detect_pneumonia(note),
        "iv_antibiotics": detect_iv_antibiotics(note),
        "hemodynamic_phrase": detect_hemodynamic_instability_phrase(note)
    }

    # default rule set
    default_rules = {
        "o2_sat_threshold": 90,
        "troponin_threshold": 0.04,
        "creatinine_threshold": 1.5,
        "sbp_threshold": 90
    }

    results = evaluate_rules(features, default_rules)

    # produce revised note: append justifications to original note
    try:
        analysis_summary = "\n".join(results["justifications"])
        revised_note = rewrite_note_with_llm(note, analysis_summary)

    except Exception as e:
        revised_note = note + "\n\n" + "\n".join(results["justifications"])
        revised_note += f"\n\n[LLM rewrite failed: {str(e)}]"


    return {
        "revisedNote": revised_note,
        "missingCriteria": results["missingCriteria"],
        "score": results["score"],
        "level": results["level"]
    }

# -----------------------------
# Upload + Analyze Combined - uses guideline parsing
# -----------------------------
@app.post("/upload-and-analyze")
async def upload_and_analyze(file: UploadFile = File(...)):
    text = ""
    try:
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        # We'll just return extracted guideline text for now
        return {
            "filename": file.filename,
            "text": text
        }

    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# Analyze with Guideline (form: doctor_note + guideline PDF)
# -----------------------------
@app.post("/analyze-with-guideline")
async def analyze_with_guideline(
    doctor_note: str = Form(...),
    guideline: UploadFile = File(...)
):
    # 1) read guideline pdf
    guideline_text = ""
    try:
        with pdfplumber.open(guideline.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    guideline_text += page_text + "\n"
    except Exception as e:
        return {"error": f"Failed to read guideline: {str(e)}"}

    # 2) parse guideline heuristically into rules
    rules = parse_guideline_thresholds(guideline_text)

    # 3) extract features from doctor note
    features = {
        "age": extract_age(doctor_note),
        "o2_sat": extract_o2_sat(doctor_note),
        "creatinine": extract_creatinine(doctor_note),
        "troponin": extract_troponin(doctor_note),
        "sbp": extract_sbp(doctor_note),
        "pneumonia": detect_pneumonia(doctor_note),
        "iv_antibiotics": detect_iv_antibiotics(doctor_note),
        "hemodynamic_phrase": detect_hemodynamic_instability_phrase(doctor_note)
    }

    # 4) evaluate rules using parsed guideline
    results = evaluate_rules(features, rules)

    # 5) build revised note (append justifications)
    revised_note = doctor_note
    if results.get("justifications"):
        revised_note += "\n\n" + "\n".join(results["justifications"])

    return {
        "filename": guideline.filename,
        "guideline_excerpt": guideline_text[:200],
        "rules_used": rules,
        "features_extracted": features,
        "analysis": {
            "revisedNote": revised_note,
            "missingCriteria": results["missingCriteria"],
            "score": results["score"],
            "level": results["level"],
            "justifications": results["justifications"]
        }
    }
