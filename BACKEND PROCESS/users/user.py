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

def get_all_users(college=None):

    db = SessionLocal()

    try:

        users = db.query(User).all()

        result = []

        user_clg_clean = re.sub(r'[^a-zA-Z0-9]', '', college).lower() if college and college.strip() and college.upper() != "ALL" else None

        for user in users:

            u_clg = getattr(user, "college", "") or ""

            if user_clg_clean:
                if not u_clg or re.sub(r'[^a-zA-Z0-9]', '', u_clg).lower() != user_clg_clean:
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