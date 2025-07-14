from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
import re

router = APIRouter(tags=["Exercise 7"])

class User(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str

    @field_validator('password')
    def validate_password(cls, password):
        if len(password) < 6:
            raise ValueError("Password must be at least 8 characters long")
        
        # Check for at least one letter
        if not re.search(r'[a-zA-Z]', password):
            raise ValueError("Password must contain at least one letter")
        
        # Check for at least one number
        if not re.search(r'\d', password):
            raise ValueError("Password must contain at least one number")
        
        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValueError("Password must contain at least one special character")
        
        return password

    @field_validator('email')
    def validate_email(cls, email):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        return email

@router.post("/signup/")
def signup(user: User):
    return {
        "message": "User created successfully",
        "username": user.username,
        "email": user.email
    }