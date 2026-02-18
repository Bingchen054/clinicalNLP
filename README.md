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
├── backend
│   ├── __pycache__
│   │   ├── llm_client.cpython-311.pyc
│   │   └── main.cpython-311.pyc
│   ├── llm_client.py
│   └── main.py
├── backend.zip
├── clinicalNLP_System_Design_and_Lovable_Prompt.
pdf                                              ├── frontend
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NavLink.tsx
│   │   │   └── ui
│   │   ├── hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── index.css
│   │   ├── lib
│   │   │   └── utils.ts
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── Index.tsx
│   │   │   ├── InputPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── OutputPage.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   └── test
│   │       ├── example.test.ts
│   │       └── setup.ts
│   ├── tailwind.config.ts
│   ├── testData
│   │   ├── ER notes 31137171 B .pdf
│   │   ├── ER notes 31139309 A.pdf
│   │   ├── Inpatient H&P 31137171 B.pdf
│   │   ├── Inpatient H&P 31139309 A.pdf
│   │   ├── MCG Pneumonia.pdf
│   │   └── revised hpi 31139309.docx.pdf
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite-env.d.ts
│   ├── vite.config.ts
│   └── vitest.config.ts
├── frontend.zip
├── package-lock.json
├── package.json
└── README.md

14 directories, 49 files
```
---

## 🧪 Representative Test Cases

### Case 1 — ER notes 31139309 

Key characteristics:

- 82-year-old male  
- O2 saturation 88–90% on room air  
- Bilateral infiltrates on CXR  
- Acute respiratory failure  
- Elevated BUN (49), Creatinine (1.7)  

System behavior:

- Detects acute hypoxic respiratory failure  
- Flags organ dysfunction risk  
- Generates inpatient-level medical necessity reasoning  

---

### Case 2 — ER notes 31137171

Key characteristics:

- 82-year-old female  
- Right lower lobe pneumonia  
- Initially stable vitals  
- Later oxygen desaturation requiring 2L nasal cannula  
- WBC 12.4  

System behavior:

- Differentiates moderate vs critical instability  
- Identifies developing hypoxia  
- Generates structured admission rationale  

---

## 🚀 Tech Stack

### AI / NLP Layer
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Sentence-Transformers](https://img.shields.io/badge/Sentence--Transformers-Embeddings-FF6F00)
![Llama](https://img.shields.io/badge/Llama-3.3_70B_Versatile-purple)

### Backend / System
![FastAPI](https://img.shields.io/badge/FastAPI-REST_API-009688?logo=fastapi&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-Schema_Validation-005571)
![Pytest](https://img.shields.io/badge/Pytest-Testing-0A9EDC)
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
