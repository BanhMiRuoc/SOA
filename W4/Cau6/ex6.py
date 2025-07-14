from datetime import datetime

from fastapi import APIRouter

router = APIRouter()

@router.get("/validate/{year}")
def validate_year(year: int):
    current_year = datetime.now().year
    if 1900 <= year <= current_year:
        return {"message": f"The year {year} is valid."}
    else:
        return {"message": f"The year {year} is not valid."}