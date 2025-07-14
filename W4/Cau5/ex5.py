from fastapi import APIRouter

router = APIRouter()

@router.get("/hello")
@router.get("/hello/{name}")
def hello(name: str = "World"):
    return {"message": f"Hello {name}!"}