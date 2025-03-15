from fastapi import FastAPI
from typing import Optional


app = FastAPI()

@app.get("/search_query")
def search_query(search: Optional[str] = None):
    if search:
        return {"message": f"You searched for: {search}"}
    return {"message": "You searched for nothing"}