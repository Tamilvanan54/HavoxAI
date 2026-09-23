from sqlalchemy import text
from database.connection import engine, Base
from database.models import User, AuditLog, Feedback, ChatSession, ChatMessage, PDFDocument
from data_governance.governance_model import GovernancePolicy

def run_migrations():
    print("⏳ Running database schema migrations...")
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as create_err:
        print(f"⚠️ Base create_all note: {create_err}")

    queries = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS college VARCHAR(150);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(50);",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS modified_answer TEXT;",
        "ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS college VARCHAR(150) DEFAULT 'ALL';",
        "ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'ALL';",
        "ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS year VARCHAR(50) DEFAULT 'ALL';",
        "ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(150);"
    ]

    try:
        with engine.connect() as conn:
            for q in queries:
                try:
                    conn.execute(text(q))
                    print(f"  ✓ {q}")
                except Exception as q_err:
                    print(f"  ⚠️ Note on query '{q}': {q_err}")
            conn.commit()
        print("✅ DATABASE TABLES AND COLUMNS MIGRATED SUCCESSFULLY!")
    except Exception as e:
        print(f"⚠️ DB Migration warning: {e}")

    # Auto-fix existing PDF records where college is 'ALL' but uploader user has a specific college
    try:
        from database.connection import SessionLocal
        from database.models import PDFDocument, User
        db = SessionLocal()
        docs = db.query(PDFDocument).all()
        for doc in docs:
            if doc.uploaded_by:
                u = db.query(User).filter(User.email == doc.uploaded_by).first()
                if u and u.college and (not doc.college or doc.college == "ALL"):
                    doc.college = u.college
                    print(f"  ✓ Auto-fixed PDF {doc.filename} college to {u.college}")
        db.commit()
        db.close()
    except Exception as fix_err:
        print(f"  ⚠️ Auto-fix PDF college note: {fix_err}")


if __name__ == "__main__":
    run_migrations()