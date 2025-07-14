from fastapi import FastAPI
from enum import Enum

app = FastAPI()

class StatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    canceled = "canceled"

@app.get("/status")
def get_status(status: StatusEnum):
    return {"message": f"Your request status is: {status}"}