import os

def delete_pdf(filename: str):
    deleted_any = False

    # 1. Delete record from database
    try:
        from database.connection import SessionLocal
        from database.models import PDFDocument
        db = SessionLocal()
        docs = db.query(PDFDocument).filter(
            (PDFDocument.filename == filename) | (PDFDocument.original_name == filename)
        ).all()
        for doc in docs:
            db.delete(doc)
            deleted_any = True
        db.commit()
        db.close()
    except Exception as db_err:
        print(f"⚠️ DB PDF delete note: {db_err}")

    # 2. Delete file from all upload & data directories
    backend_dir = os.path.abspath(os.path.dirname(__file__))
    search_dirs = [
        os.path.join(backend_dir, "..", "uploads"),
        os.path.join(backend_dir, "..", "..", "uploads"),
        os.path.join(backend_dir, "..", "..", "RAG PROCESS", "data"),
        "uploads",
        "/root/HALLOW.AI/uploads",
        "/root/HALLOW.AI/BACKEND PROCESS/uploads",
        "/root/HALLOW.AI/RAG PROCESS/data"
    ]

    for d in search_dirs:
        if os.path.exists(d):
            try:
                for f in os.listdir(d):
                    if f == filename or f.endswith(filename) or filename.endswith(f):
                        target_path = os.path.join(d, f)
                        if os.path.exists(target_path):
                            try:
                                os.remove(target_path)
                                deleted_any = True
                                print(f"✓ Removed file '{target_path}'")
                            except Exception as e:
                                print(f"⚠️ Failed to remove '{target_path}': {e}")
            except Exception:
                pass

    if not deleted_any:
        return {
            "status": False,
            "message": "File Not Found"
        }

    return {
        "status": True,
        "message": "PDF Deleted Successfully"
    }