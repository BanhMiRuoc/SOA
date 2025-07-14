from fastapi import APIRouter, Form, Body
from pydantic import BaseModel
from typing import Annotated

router = APIRouter(tags=["Exercise 5"])

class UserCreds(BaseModel):
    username: str
    password: str

@router.post("/register/form")
def register_form(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    return {
        "message": f"User {username} with password {password} registered successfully via form data"
    }

@router.post("/register/json")
def register_json(user: UserCreds):
    return {
        "message": f"User {user.username} with password {user.password} registered successfully via JSON"
    }