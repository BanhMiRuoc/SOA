from fastapi import FastAPI, Query
from typing import List

app = FastAPI()

@app.get("/search")
def search_items(tags: List[str] = Query([])):
    return {"message": f"Searching for items with tags: {', '.join(tags)}"}
