from fastapi import APIRouter

router = APIRouter()

@router.get("/age/{age}")
def check_age(age: int):
    if age >= 18:
        return {"message": "Congratulations, you are an adult!"}
    else:
        return {"message": "Sorry, you are not an adult."}