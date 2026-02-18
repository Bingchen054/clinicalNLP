# 🏥 clinicalNLP  
### Clinical Documentation Intelligence & Utilization Review Platform  

A production-oriented clinical NLP system that transforms unstructured emergency department (ER) documentation into structured, severity-aware clinical intelligence.

This project simulates a real-world hospital AI workflow integrating clinical NLP pipelines, hybrid reasoning architecture, structured LLM orchestration, and API deployment.

---

## 🚀 Core Features

- PDF ingestion of ER documentation  
- Structured clinical section parsing (HPI, Vitals, Labs, Imaging)  
- Medical entity & abnormality extraction  
- Organ dysfunction & hypoxia detection  
- Severity stratification engine  
- LLM-powered structured clinical reasoning  
- Schema-validated JSON output  
- REST API integration (FastAPI-ready)  

---

## 🏗 System Flow

```
PDF Upload
   → Text Extraction
   → Section Parsing
   → Clinical Signal Extraction
   → Severity & Risk Engine
   → Llama-3.3-70B Reasoning
   → Schema Validation
   → Structured API Output
```

Designed with:

- Hybrid symbolic + neural architecture  
- Deterministic signal construction  
- Structured LLM orchestration  
- Schema enforcement  
- Production-oriented backend design  

---

## 📂 Project Structure

```
clinicalNLP/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   │   ├── pdf_parser.py
│   │   ├── section_splitter.py
│   │   ├── entity_extractor.py
│   │   ├── severity_engine.py
│   │   ├── llm_reasoner.py
│   │   └── compliance_checker.py
│
├── frontend/
│   └── testData/
│
├── prompts/
├── tests/
├── requirements.txt
└── docker-compose.yml
```

---

## 🧪 Representative Test Cases

### Case 1 — Severe Hypoxic Pneumonia

Key characteristics:

- 82-year-old male  
- O2 saturation 88–90% on room air  
- Bilateral infiltrates on CXR  
- Acute respiratory failure  
- Elevated BUN (49), Creatinine (1.7)  
- 31 minutes documented critical care time  

System behavior:

- Detects acute hypoxic respiratory failure  
- Flags organ dysfunction risk  
- Generates inpatient-level medical necessity reasoning  
- Amplifies severity signals appropriately  

---

### Case 2 — Right Lower Lobe Pneumonia (Moderate Severity)

Key characteristics:

- 82-year-old female  
- Right lower lobe pneumonia  
- Initially stable vitals  
- Later oxygen desaturation requiring 2L nasal cannula  
- WBC 12.4  
- Mild metabolic abnormalities  

System behavior:

- Differentiates moderate vs critical instability  
- Identifies developing hypoxia  
- Generates structured admission rationale  
- Avoids overstatement of organ failure  

---

## 🚀 Tech Stack

### AI / NLP Layer
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![spaCy](https://img.shields.io/badge/spaCy-Medical_NLP-09A3D5)
![NLTK](https://img.shields.io/badge/NLTK-Text_Processing-9C27B0)
![Sentence-Transformers](https://img.shields.io/badge/Sentence--Transformers-Embeddings-FF6F00)
![Llama](https://img.shields.io/badge/Llama-3.3_70B_Versatile-purple)

### Backend / System
![FastAPI](https://img.shields.io/badge/FastAPI-REST_API-009688?logo=fastapi&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-Schema_Validation-005571)
![Pytest](https://img.shields.io/badge/Pytest-Testing-0A9EDC)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)
![JSON](https://img.shields.io/badge/Structured-JSON-blue)

---

## ⚙️ Setup

```bash
git clone <repo-url>
cd clinicalNLP

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

uvicorn backend.main:app --reload
```

Test upload:

```bash
curl -F "file=@/path/to/ER_note.pdf" http://127.0.0.1:8000/upload-guideline
```

Run tests:

```bash
pytest
```

---

clinicalNLP implements structured reasoning over unstructured clinical documentation using a hybrid rule-based and large language model architecture.
