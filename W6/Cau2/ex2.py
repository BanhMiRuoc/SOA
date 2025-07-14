from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(tags=["Exercise 2"])

class User(BaseModel):
    username: str = Field(..., min_length=1)
    email: EmailStr = Field(..., min_length=1)

@router.post("/users_ex2/")
def create_user(user: User):
    return {
        "message": f"User {user.username} with email {user.email} created successfully."
    }