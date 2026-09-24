from fastapi import FastAPI
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from fastapi.responses import FileResponse

from monitoring.monitoring_controller import monitoring_dashboard
from data_governance.governance_controller import get_policies

from auth.signup import create_user
from auth.login import login_user

from auth.forgot_password import forgot_password
from auth.reset_password import reset_password

from chat.update_pin import update_pin

from chat.save_chat import save_chat
from chat.get_chats import get_chats
from chat.delete_chat import delete_chat

from rag.rag_client import ask_rag

from chat.save_message import save_message
from chat.get_messages import get_messages

from feedback.get_feedback import get_feedback
from feedback.save_feedback import save_feedback
from feedback.get_feedbacks import get_all_feedbacks
from feedback.update_feedback import update_feedback_status

from feedback.correction import get_corrected_answer

from users.profile import get_profile
from users.user import (
    get_all_users,
    get_user_by_id,
    delete_user
)


from logs.log_stats import get_login_stats


from pdf.delete_pdf import delete_pdf


import os
import requests
import re





from create_tables import run_migrations

app = FastAPI()

# Auto-migrate database tables & columns on startup
run_migrations()






# ==========================
# FEEDBACK UPDATE MODEL
# ==========================


class FeedbackUpdate(BaseModel):

    modified_answer: str | None = None

    status: str | None = None


class ChatRequest(BaseModel):

    question: str







# ==========================
# CORS
# ==========================


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)







# ==========================
# HOME
# ==========================


@app.get("/")
def home():


    return {


        "message":

        "College AI Backend Running"


    }







# ==========================
# SIGNUP
# ==========================


@app.post("/signup")
def signup(

    name: str,

    email: str,

    password: str,

    role: str,

    college: str | None = None,

    department: str | None = None,

    year: str | None = None

):


    return create_user(

        name,

        email,

        password,

        role,

        college,

        department,

        year

    )







# ==========================
# LOGIN
# ==========================


@app.post("/login")
def login(

    email: str,

    password: str

):


    return login_user(

        email,

        password

    )








# ==========================
# FORGOT PASSWORD
# ==========================


@app.post("/forgot-password")
def forgot(

    email: str

):


    return forgot_password(

        email

    )








# ==========================
# RESET PASSWORD
# ==========================


@app.post("/reset-password")
def reset(

    token: str,

    new_password: str

):


    return reset_password(

        token,

        new_password

    )








# ==========================
# PROFILE
# ==========================


@app.get("/profile")
def profile(

    email: str

):


    return get_profile(

        email

    )





# ==========================
# USERS
# ==========================


@app.get("/users")
def users(college: str | None = None):

    return get_all_users(college=college)





# ==========================
# USER PROFILE BY ID (Admin)
# ==========================


@app.get("/user-profile/{user_id}")
def user_profile_by_id(user_id: int):

    return get_user_by_id(user_id)







# ==========================
# DELETE USER
# ==========================


@app.delete("/delete-user/{user_id}")
def remove_user(

    user_id:int

):


    return delete_user(

        user_id

    )







# ==========================
# LOGS
# ==========================


@app.get("/logs")
def logs():


    return get_login_stats()


# ==========================
# MONITORING
# ==========================

@app.get("/monitoring")
def monitoring():

    return monitoring_dashboard()


# ==========================
# DATA GOVERNANCE
# ==========================

@app.get("/governance")
def governance():

    return get_policies()

# ==========================
# SAVE FEEDBACK
# ==========================


@app.post("/feedback")
def feedback(

    question:str,

    answer:str,

    feedback:str,

    reported_by:str

):


    return save_feedback(

        question,

        answer,

        feedback,

        reported_by

    )







# ==========================
# GET ALL FEEDBACKS
# ==========================


@app.get("/feedbacks")
def feedbacks():


    return get_all_feedbacks()







# ==========================
# GET SINGLE FEEDBACK
# ==========================


@app.get("/feedbacks/{feedback_id}")
def single_feedback(

    feedback_id:int

):


    return get_feedback(

        feedback_id

    )








# ==========================
# UPDATE FEEDBACK
# ==========================


@app.put("/feedbacks/{feedback_id}")
def update_feedback(

    feedback_id:int,

    data:FeedbackUpdate

):


    return update_feedback_status(

        feedback_id,

        data.modified_answer

    )









from fastapi import Form

@app.post("/upload-pdf")
async def upload_pdf(
    pdf: UploadFile = File(...),
    college: str = Form("ALL"),
    department: str = Form("ALL"),
    year: str = Form("ALL"),
    uploaded_by: str = Form(None)
):
    import fitz  # PyMuPDF
    import re

    page_count = 0
    safe_filename = "document.pdf"

    try:
        # 1. File extension validation
        if not pdf.filename or not pdf.filename.lower().endswith(".pdf"):
            return {
                "status": False,
                "message": "Invalid file type. Only PDF documents (.pdf) are allowed.",
                "filename": pdf.filename
            }

        # 2. Filename sanitization
        clean_base = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(pdf.filename))
        college_clean = re.sub(r'[^a-zA-Z0-9]', '', college or "ALL")
        dept_clean = re.sub(r'[^a-zA-Z0-9]', '', department or "ALL")
        year_clean = re.sub(r'[^a-zA-Z0-9]', '', year or "ALL")

        if college_clean != "ALL" and dept_clean != "ALL" and year_clean != "ALL":
            safe_filename = f"{college_clean}_{dept_clean}_{year_clean}_{clean_base}"
        elif dept_clean != "ALL" and year_clean != "ALL":
            safe_filename = f"{dept_clean}_{year_clean}_{clean_base}"
        else:
            safe_filename = clean_base

        content = await pdf.read()

        # 3. File size validation (Max 50MB)
        if len(content) == 0:
            return {
                "status": False,
                "message": "The uploaded PDF file is empty (0 bytes).",
                "filename": safe_filename
            }
        if len(content) > 50 * 1024 * 1024:
            return {
                "status": False,
                "message": "File size exceeds the 50MB limit.",
                "filename": safe_filename
            }

        # 4. Scanned & digital PDF check - accept all readable PDF documents
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            page_count = len(doc)
            doc.close()
            print(f"ℹ️ PDF accepted: {safe_filename} ({page_count} pages)")
        except Exception as e:
            print(f"⚠️ PDF inspection note: {e}")

        if not os.path.exists("uploads"):
            os.makedirs("uploads")

        file_path = f"uploads/{safe_filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        print(f"✅ Saved to backend uploads: {os.path.abspath(file_path)}")

        # Save directly to RAG PROCESS data folder
        backend_dir = os.path.abspath(os.path.dirname(__file__))
        rag_data_dir = os.path.abspath(os.path.join(backend_dir, "..", "RAG PROCESS", "data"))

        if not os.path.exists(rag_data_dir):
            os.makedirs(rag_data_dir)

        rag_file_path = os.path.join(rag_data_dir, safe_filename)
        try:
            with open(rag_file_path, "wb") as rag_buffer:
                rag_buffer.write(content)
            print(f"✅ Saved to RAG data: {rag_file_path}")
        except Exception as e:
            print(f"❌ Failed to save to RAG data: {e}")

        # Save record to database if available
        try:
            from database.connection import SessionLocal
            from database.models import PDFDocument, User
            db = SessionLocal()

            # If college is ALL or not set, look up uploader's college
            if (not college or college == "ALL") and uploaded_by:
                u = db.query(User).filter(User.email == uploaded_by).first()
                if u and u.college:
                    college = u.college

            existing = db.query(PDFDocument).filter(PDFDocument.filename == safe_filename).first()
            if existing:
                existing.original_name = pdf.filename
                existing.college = college or "ALL"
                existing.department = department or "ALL"
                existing.year = year or "ALL"
                existing.uploaded_by = uploaded_by
            else:
                pdf_doc = PDFDocument(
                    filename=safe_filename,
                    original_name=pdf.filename,
                    college=college or "ALL",
                    department=department or "ALL",
                    year=year or "ALL",
                    uploaded_by=uploaded_by
                )
                db.add(pdf_doc)
            db.commit()
            db.close()
        except Exception as db_err:
            print(f"⚠️ DB PDF Record note: {db_err}")


        # Trigger ingest on RAG service synchronously so RAG indexing completes before return
        try:
            print(f"⏳ Calling RAG ingest for {safe_filename}...")
            resp = requests.post(
                "http://127.0.0.1:8001/api/ingest",
                json={"filename": safe_filename, "college": college, "department": department, "year": year},
                timeout=120
            )
            if resp.status_code == 200:
                print(f"✅ RAG ingest success for {safe_filename}: {resp.json()}")
            else:
                print(f"⚠️ RAG ingest response: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"⚠️ RAG ingest error for {safe_filename}: {e}")

        return {
            "status": True,
            "message": f"PDF Uploaded successfully for {college} - {department} - {year}!",
            "filename": safe_filename,
            "college": college,
            "department": department,
            "year": year,
            "pages": page_count,
            "ingested": True
        }

    except Exception as exc:
        print(f"❌ upload_pdf exception: {exc}")
        return {
            "status": False,
            "message": f"Upload processing error: {str(exc)}",
            "filename": safe_filename
        }


def _norm_college(c: str | None) -> str:
    if not c:
        return "ALL"
    s = re.sub(r'[^a-zA-Z0-9]', '', str(c)).upper()
    return s if s else "ALL"

def _norm_dept(d: str | None) -> str:
    if not d:
        return "ALL"
    s = str(d).strip().upper()
    match = re.search(r'^[A-Z0-9]+', s)
    if match and match.group(0) in ["CSE", "ECE", "EEE", "MECH", "IT", "CIVIL", "AIDS", "AIML", "CSBS", "MCT", "CHEM", "BIO", "AERO", "AUTO", "MARINE", "PROD", "TEXTILE", "ENV", "FOOD", "INSTRU", "INDUSTRIAL", "PETRO", "MINING", "METALLURGY", "ROBOTICS"]:
        return match.group(0)
    if "AIML" in s or "MACHINE" in s:
        return "AIML"
    if "AIDS" in s or "DATA SCIENCE" in s:
        return "AIDS"
    return re.sub(r'[^a-zA-Z0-9]', '', s)

def _norm_year(y: str | None) -> str:
    if not y:
        return "ALL"
    s = str(y).lower()
    if "1" in s:
        return "1ST YEAR"
    if "2" in s:
        return "2ND YEAR"
    if "3" in s:
        return "3RD YEAR"
    if "4" in s:
        return "4TH YEAR"
    return s.upper().strip()

def _colleges_match(c1: str | None, c2: str | None) -> bool:
    if not c1 or not c2:
        return True
    s1 = (c1 or "").strip().lower()
    s2 = (c2 or "").strip().lower()
    if s1 == "all" or s2 == "all" or not s1 or not s2:
        return True
    
    norm1 = re.sub(r'[^a-zA-Z0-9]', '', s1)
    norm2 = re.sub(r'[^a-zA-Z0-9]', '', s2)
    if norm1 == norm2 or norm1 in norm2 or norm2 in norm1:
        return True

    common_words = {"college", "engineering", "of", "technology", "institute", "science", "and", "autonomous", "erode", "coimbatore", "chennai", "madurai", "trichy", "salem"}
    w1 = set(re.findall(r'[a-z0-9]+', s1)) - common_words
    w2 = set(re.findall(r'[a-z0-9]+', s2)) - common_words

    if w1 and w2 and (w1 == w2 or w1.issubset(w2) or w2.issubset(w1) or len(w1.intersection(w2)) >= 1):
        return True

    return False

def _depts_match(d1: str | None, d2: str | None) -> bool:
    if not d1 or not d2:
        return True
    s1 = _norm_dept(d1)
    s2 = _norm_dept(d2)
    if s1 == "ALL" or s2 == "ALL" or not s1 or not s2:
        return True
    if s1 == s2 or s1 in s2 or s2 in s1:
        return True
    return False

def _years_match(y1: str | None, y2: str | None) -> bool:
    if not y1 or not y2:
        return True
    s1 = _norm_year(y1)
    s2 = _norm_year(y2)
    if s1 == "ALL" or s2 == "ALL" or not s1 or not s2:
        return True
    if s1 == s2:
        return True
    return False

# ==========================
# GET PDFS
# ==========================

@app.get("/pdfs")
def get_pdfs(
    college: str | None = None,
    department: str | None = None,
    year: str | None = None,
    role: str | None = None
):
    try:
        backend_dir = os.path.abspath(os.path.dirname(__file__))
        search_dirs = [
            os.path.join(backend_dir, "uploads"),
            os.path.join(backend_dir, "..", "uploads"),
            os.path.join(backend_dir, "..", "RAG PROCESS", "data"),
            "uploads",
            "/root/HALLOW.AI/uploads",
            "/root/HALLOW.AI/BACKEND PROCESS/uploads",
            "/root/HALLOW.AI/RAG PROCESS/data"
        ]

        all_files_set = set()
        for d in search_dirs:
            if os.path.exists(d):
                try:
                    for f in os.listdir(d):
                        if f.endswith(".pdf"):
                            all_files_set.add(f)
                except Exception:
                    pass

        all_files = list(all_files_set)

        # Query database for college, department & year metadata if available
        db_metadata = {}
        try:
            from database.connection import SessionLocal
            from database.models import PDFDocument
            db = SessionLocal()
            docs = db.query(PDFDocument).all()
            for doc in docs:
                db_metadata[doc.filename] = {
                    "college": getattr(doc, "college", "ALL") or "ALL",
                    "department": doc.department or "ALL",
                    "year": doc.year or "ALL",
                    "original_name": doc.original_name
                }
            db.close()
        except Exception as db_err:
            print(f"⚠️ DB PDF metadata fetch note: {db_err}")

        structured_files = []
        for fname in all_files:
            info = db_metadata.get(fname, {})
            doc_college = info.get("college") or "ALL"
            doc_dept = info.get("department") or "ALL"
            doc_year = info.get("year") or "ALL"

            if doc_college == "ALL" or doc_dept == "ALL" or doc_year == "ALL":
                try:
                    import sys
                    rag_path = os.path.abspath(os.path.join(backend_dir, "..", "RAG PROCESS"))
                    if rag_path not in sys.path:
                        sys.path.insert(0, rag_path)
                    from main import parse_pdf_college_dept_year
                    pc, pd, py = parse_pdf_college_dept_year(fname)
                    if doc_college == "ALL": doc_college = pc
                    if doc_dept == "ALL": doc_dept = pd
                    if doc_year == "ALL": doc_year = py
                except Exception:
                    pass

            # 1. Filtering by College for ALL users
            if college and college.strip() and college.upper() != "ALL":
                if not _colleges_match(college, doc_college):
                    continue

            # 2. Filtering for Students (Department & Year)
            if role == "student":
                if department and not _depts_match(department, doc_dept):
                    continue
                if year and not _years_match(year, doc_year):
                    continue

            structured_files.append({
                "filename": fname,
                "college": doc_college,
                "department": doc_dept,
                "year": doc_year
            })

        file_names = [item["filename"] for item in structured_files]

        return {
            "status": True,
            "files": file_names,
            "details": structured_files
        }
    except Exception as exc:
        print(f"❌ Error in get_pdfs: {exc}")
        return {
            "status": True,
            "files": [],
            "details": []
        }





# ==========================
# FEEDBACK CORRECTION API
# ==========================

@app.get("/feedback-correction")
def feedback_correction(

    question: str

):

    return get_corrected_answer(

        question

    )





# ==========================
# DELETE PDF
# ==========================


@app.delete("/delete-pdf")
def remove_pdf(
    filename: str
):
    res = delete_pdf(filename)
    try:
        requests.post(
            "http://127.0.0.1:8001/api/delete-doc",
            json={"filename": filename},
            timeout=10
        )
    except Exception as e:
        print(f"Failed to trigger RAG doc deletion: {e}")
    return res
# ==========================
# VIEW PDF
# ==========================

@app.get("/view-pdf/{filename}")
def view_pdf(filename: str):
    backend_dir = os.path.abspath(os.path.dirname(__file__))
    search_dirs = [
        os.path.join(backend_dir, "uploads"),
        os.path.join(backend_dir, "..", "uploads"),
        os.path.join(backend_dir, "..", "RAG PROCESS", "data"),
        "uploads",
        "/root/HALLOW.AI/uploads",
        "/root/HALLOW.AI/BACKEND PROCESS/uploads",
        "/root/HALLOW.AI/RAG PROCESS/data"
    ]
    for d in search_dirs:
        fp = os.path.join(d, filename)
        if os.path.exists(fp):
            return FileResponse(path=fp, media_type="application/pdf", filename=filename)

    raise HTTPException(status_code=404, detail="File not found")





# ===== CHAT ENDPOINTS =====

@app.post("/save-chat")
def create_chat(
    email: str,
    title: str
):

    return save_chat(
        email,
        title
    )


@app.get("/get-chats")
def load_chats(
    email: str
):

    return get_chats(
        email
    )


@app.delete("/delete-chat")
def remove_chat(
    chat_id: int
):

    return delete_chat(
        chat_id
    )


@app.post("/save-message")
def create_message(

    session_id: int,

    sender: str,

    message: str

):

    return save_message(

        session_id,

        sender,

        message

    )


@app.get("/get-messages")
def load_messages(
    session_id: int
):

    return get_messages(
        session_id
    )

@app.put("/pin-chat")
def pin_chat(
    chat_id:int
):

    return update_pin(
        chat_id
    )

# ==========================
# RAG CHAT
# ==========================

class ChatRequest(BaseModel):

    question: str


@app.post("/chat")
def chat(data: ChatRequest):

    return ask_rag(
        data.question
    )