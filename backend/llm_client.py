# backend/llm_client.py

import os
from groq import Groq

# 自动读取环境变量 GROQ_API_KEY
client = Groq()

def rewrite_note_with_llm(original_note: str, analysis_summary: str) -> str:
    """
    调用 Groq 大模型重写临床文档
    """

    prompt = f"""
You are a clinical documentation improvement specialist.

Rewrite the following physician note in a structured,
concise, payer-focused way emphasizing:

- Severity of illness
- Risk of deterioration
- Medical necessity for inpatient admission
- Why discharge may be unsafe

Original Note:
{original_note}

Supporting Analysis:
{analysis_summary}

Return ONLY the rewritten clinical note.
Do not explain your reasoning.
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_completion_tokens=800
    )

    return completion.choices[0].message.content.strip()
