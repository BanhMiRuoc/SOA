from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/validate_date")
def validate_date(date: str):
    try:
        datetime.strptime(date, "%Y-%m-%d")
        return {"message": f"The date is valid: {date}"}
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD."}