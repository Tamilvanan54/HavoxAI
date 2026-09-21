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


def get_all_users():

    db = SessionLocal()

    try:

        users = db.query(User).all()

        result = []

        for user in users:

            result.append(
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
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