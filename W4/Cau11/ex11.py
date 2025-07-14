from fastapi import APIRouter
router = APIRouter()
@router.get("/hello/{language_code}/{name}")
def hello(language_code: str, name: str):
    greetings = {
        "en": f"Hello, {name}!",
        "es": f"¡Hola, {name}!",
        "fr": f"Bonjour, {name}!",
        "vi": f"Xin chào, {name}!"
    }
    return {"message": greetings.get(language_code)}