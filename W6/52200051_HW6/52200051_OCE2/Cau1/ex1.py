from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Exercise 1"])

class User(BaseModel):
    username: str
    email: str

@router.post("/users/")
def create_user(user: User):
    return {
        "message": f"User {user.username} with email {user.email} created successfully."
    }