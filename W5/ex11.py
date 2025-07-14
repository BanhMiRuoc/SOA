from fastapi import FastAPI
from typing import Optional

app = FastAPI()

@app.get("/items/{item_id}/store")
def check_item_availability(item_id: int, store_id: Optional[int] = None):
    if store_id:
        return {"message": f"Checking availability of item {item_id} in store {store_id}"}
    return {"message": f"Checking availability of item {item_id} in general"}
