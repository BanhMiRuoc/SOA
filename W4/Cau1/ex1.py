from fastapi import APIRouter

router = APIRouter()

@router.get("/greet/{name}")
def greet(name: str):
    return {"message": f"Hello, {name}!"}