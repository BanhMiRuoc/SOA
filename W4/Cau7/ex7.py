from fastapi import APIRouter, HTTPException
from datetime import datetime
import calendar
router = APIRouter()
@router.get("/day_status/{year}/{month}/{day}")
def day_status(year: int, month: int, day: int):
    try:
        date = datetime(year, month, day)
        day_of_week = calendar.day_name[date.weekday()]
        if day_of_week in ["Saturday", "Sunday"]:
            return {"message": f"The day {day}/{month}/{year} is a weekend. It is {day_of_week}."}
        else:
            return {"message": f"The day {day}/{month}/{year} is a weekday. It is {day_of_week}."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date")