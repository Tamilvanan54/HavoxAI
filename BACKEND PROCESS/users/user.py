from database.connection import SessionLocal
from database.models import User


def get_user_by_id(user_id):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            return {
                "status": False,
                "message": "User Not Found"
            }

        return {
            "status": True,
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "college": getattr(user, "college", "") or "",
            "department": getattr(user, "department", "") or "",
            "year": getattr(user, "year", "") or "",
            "created_at": str(user.created_at) if user.created_at else None,
            "last_login": str(user.last_login) if user.last_login else None,
        }

    except Exception as e:
        return {
            "status": False,
            "message": str(e)
        }

    finally:
        db.close()


import re

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

def get_all_users(college=None):

    db = SessionLocal()

    try:

        users = db.query(User).all()

        result = []

        for user in users:

            u_clg = getattr(user, "college", "") or ""

            if college and college.strip() and college.upper() != "ALL":
                if not _colleges_match(college, u_clg):
                    continue

            result.append(
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "college": u_clg,
                    "department": getattr(user, "department", "") or "",
                    "year": getattr(user, "year", "") or ""
                }
            )

        return result

    finally:
        db.close()




def delete_user(user_id):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:

            return {
                "status": False,
                "message": "User Not Found"
            }

        db.delete(user)

        db.commit()

        return {
            "status": True,
            "message": "User Deleted Successfully"
        }

    finally:
        db.close()