from fastapi import APIRouter

router = APIRouter()


@router.get("/multiply/{num1}/{num2}")
def multiply(num1: int, num2: int):
    return num1 * num2