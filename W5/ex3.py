from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: int, detail: bool = False):
    if detail:
        return {"item_id": item_id, "details": "Detailed information"}
    return {"item_id": item_id, "details": "Basic information"}