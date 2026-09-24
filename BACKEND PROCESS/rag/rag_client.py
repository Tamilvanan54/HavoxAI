import os
import requests
from dotenv import load_dotenv

load_dotenv()

RAG_URL = os.getenv(
    "RAG_SERVICE_URL",
    "http://127.0.0.1:8001/api/query"
)

print("RAG URL =", RAG_URL)

def ask_rag(
    question: str,
    model_name: str = "qwen2.5:1.5b",
    college: str = "",
    department: str = "",
    year: str = "",
    role: str = ""
):
    try:
        print("QUESTION =", question, "| MODEL =", model_name, "| COLLEGE =", college)

        response = requests.post(
            RAG_URL,
            json={
                "query": question,
                "model_name": model_name,
                "college": college,
                "department": department,
                "year": year,
                "role": role
            },
            timeout=30
        )

        return response.json()

    except Exception as e:
        print("RAG ERROR =", str(e))
        return {
            "answer": "I can answer only from the uploaded study materials. I could not find enough relevant information in the available documents for this question."
        }