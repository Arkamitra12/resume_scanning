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

    password = getpass("Enter recruiter password: ")

    if len(password) < 8:
        print("Password must contain at least 8 characters.")

    elif recruiter:
        recruiter.password_hash = hash_password(password)
        db.commit()
        print("Recruiter password updated successfully!")

    else:
        recruiter = User(
            name="Admin Recruiter",
            email=email,
            password_hash=hash_password(password),
            role="recruiter"
        )

        db.add(recruiter)
        db.commit()

        print("Recruiter account created successfully!")

except Exception as e:
    db.rollback()
    print("Error:", e)

finally:
    db.close()



# #{
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InJlY3J1aXRlciIsImV4cCI6MTc5NTQyNTgwOH0.c4Aj2sE7WDsufpyE0T8DXmtKJThCHckywmVF8vvPQmI",
#   "token_type": "bearer",
#   "user": {
#     "user_id": 1,
#     "name": "Admin Recruiter",
#     "email": "adri#897@gmail.com",
#     "role": "recruiter"
#   }
# }

# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImNhbmRpZGF0ZSIsImV4cCI6MTc5NTQyNjM0NX0.jLVOxapIgyq1AAQ8alUUC-5kvyh093ub1zauZFxo6Ys",
#   "token_type": "bearer",
#   "user": {
#     "user_id": 2,
#     "name": "Test Candidate",
#     "email": "candidate.test@example.com",
#     "role": "candidate"
#   }
# }