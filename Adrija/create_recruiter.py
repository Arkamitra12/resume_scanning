
from getpass import getpass

from app.database import SessionLocal
from app.models import User
from app.utils.security import hash_password

db = SessionLocal()

try:
    email = "adri#897@gmail.com"

    recruiter = db.query(User).filter(
        User.email == email
    ).first()

    if recruiter:
        new_password = getpass("Enter new recruiter password: ")

        if len(new_password) < 8:
            print("Password must contain at least 8 characters.")
        else:
            recruiter.password_hash = hash_password(new_password)
            db.commit()
            print("Recruiter password updated successfully!")
    else:
        print("Recruiter account not found.")

except Exception as e:
    db.rollback()
    print("Error:", e)

finally:
    db.close()

