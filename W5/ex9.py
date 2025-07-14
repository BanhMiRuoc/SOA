from fastapi import FastAPI
from typing import Optional
import json
from pydantic import BaseModel

app = FastAPI()

class FilterModel(BaseModel):
    type: Optional[str]
    published_after: Optional[str]

@app.get("/filters")
def get_filters(filters: str):
    try:
        parsed_filters = json.loads(filters)
        filter_model = FilterModel(**parsed_filters)
        return {"filters": filter_model.dict()}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format."}