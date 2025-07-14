from fastapi import FastAPI
from typing import  Optional


app = FastAPI()

@app.get("/products/{category_id}")
def get_products(category_id: int, sort_by: Optional[str] = "name", order: Optional[str] = "asc"):
    return {"message": f"Fetching products in category {category_id}, sorted by {sort_by} in {order} order."}
