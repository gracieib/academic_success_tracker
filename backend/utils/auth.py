import jwt
import datetime
import os

def create_token(student_data: dict):
    payload = {
        "student_id": str(student_data["_id"]),
        "email": student_data["email"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    }

    secret = os.getenv("JWT_SECRET", "defaultsecret")
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token
