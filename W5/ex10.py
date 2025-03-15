from fastapi import FastAPI
from typing import Optional

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int, details: Optional[str] = "basic"):
    if details == "full":
        return {"user_id": user_id, "details": "Full profile information"}
    return {"user_id": user_id, "details": "Basic information"}
