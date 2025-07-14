from fastapi import APIRouter
router = APIRouter()
@router.get("/v1/greet/{name}")
def greet_v1(name: str):
    return {"message": f"Hello, {name}!"}
@router.get("/v2/greet/{name}")
def greet_v2(name: str):
    greetings = {
        "en": f"Hello, {name}!",
        "vi": f"Xin chào, {name}!",
        "es": f"¡Hola, {name}!",
        "fr": f"Bonjour, {name}!"
    }
    return {"messages": greetings}