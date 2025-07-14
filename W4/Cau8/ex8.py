from fastapi import APIRouter, HTTPException
import re    
router = APIRouter()
@router.get("/product/{product_id}")
def validate_product_id(product_id: str):
    pattern = r"^[A-Za-z]{3}-\d{3}$"
    if re.match(pattern, product_id):
        return {"message": f"The product ID {product_id} is valid."}
    else:
        raise HTTPException(status_code=400, detail="Invalid product ID format")