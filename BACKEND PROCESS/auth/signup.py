from passlib.context import CryptContext

from database.connection import SessionLocal
from database.models import User

from logs.audit_log import write_log


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def create_user(
    name,
    email,
    password,
    role,
    college=None,
    department=None,
    year=None
):

    db = SessionLocal()

    try:
        if (email or "").strip().lower() == "superadmin2024@gmail.com":
            return {
                "status": False,
                "message": "Super Admin accounts cannot be created via public signup!"
            }

        existing_user = db.query(User).filter(
            User.email == email
        ).first()

        if existing_user:
            return {
                "status": False,
                "message": "User already exists with this email address!"
            }

        # Role normalize
        role = role.lower()

        # Allow only student, staff, and admin
        if role not in ["student", "staff", "admin"]:
            return {
                "status": False,
                "message": "Invalid role selected"
            }

        # 1. ONE ADMIN PER COLLEGE ENFORCEMENT
        if role == "admin" and college:
            import re
            common_words = {"college", "engineering", "of", "technology", "institute", "science", "and", "autonomous", "erode", "coimbatore", "chennai", "madurai", "trichy", "salem"}
            norm_new = re.sub(r'[^a-zA-Z0-9]', '', college.lower())
            w_new = set(re.findall(r'[a-z0-9]+', college.lower())) - common_words

            existing_admins = db.query(User).filter(User.role == "admin").all()
            for ex in existing_admins:
                ex_clg = (getattr(ex, "college", "") or "").strip()
                if ex_clg:
                    norm_ex = re.sub(r'[^a-zA-Z0-9]', '', ex_clg.lower())
                    w_ex = set(re.findall(r'[a-z0-9]+', ex_clg.lower())) - common_words
                    is_match = (norm_new == norm_ex or norm_new in norm_ex or norm_ex in norm_new) or \
                               (w_new and w_ex and (w_new == w_ex or w_new.issubset(w_ex) or w_ex.issubset(w_new) or len(w_new.intersection(w_ex)) >= 1))
                    if is_match:
                        return {
                            "status": False,
                            "message": f"An Admin account already exists for '{ex_clg}'. Only one Admin account is allowed per college."
                        }

        hashed_password = pwd_context.hash(
            password
        )

        new_user = User(
            name=name,
            email=email,
            password=hashed_password,
            role=role,
            college=college,
            department=department,
            year=year
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Audit Log Entry
        try:
            write_log(
                "SIGNUP",
                email,
                role
            )
        except Exception:
            pass

        return {
            "status": True,
            "message": "User Created Successfully"
        }

    except Exception as e:
        db.rollback()
        print(f"❌ SIGNUP ERROR: {e}")
        return {
            "status": False,
            "message": f"Signup error: {str(e)}"
        }
    finally:
        db.close()