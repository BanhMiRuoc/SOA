from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(tags=["Exercise 3"])

class User(BaseModel):
    username: str = Field(..., min_length=1)
    email: EmailStr = Field(..., min_length=1)
    age: int = Field(None, ge=0) # ge=0 means no negative value

@router.post("/users_ex3/")
def create_user(user: User):
    message = f"User {user.username} with email {user.email}"
    if user.age is not None:
        message += f" and age {user.age}"
    return {"message": message + " created successfully."}