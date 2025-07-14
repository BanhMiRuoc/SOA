from fastapi import FastAPI, Path, Query, HTTPException
from pydantic import BaseModel, Field, conlist, confloat
from typing import Annotated, List, Optional
from uuid import UUID
import uvicorn

app = FastAPI()

# Define the models (Product, CartRequest, OrderItem, etc.)

class ItemRequest(BaseModel):
    price: Annotated[float, Field(gt=0, description='Price must be greater than zero')]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get('/items/{item_id}')
def get_item(
        item_id: Annotated[int, Path(gt=0, description='Item ID must be a positive integer')],
        category: Annotated[Optional[str], Query(description='Optional category')] = None,
        item: ItemRequest = None
):
    if not item:
        raise HTTPException(status_code=400, detail='Item details (price) are required.')

    response = {
        'item_id': item_id,
        'category': category if category else 'Not specified',
        'price': item.price
    }
    return response

# CartRequest Model
class CartRequest(BaseModel):
    user_id: Annotated[int, Field(gt=0, description='User ID must be a positive integer')]
    items: Annotated[List[str], Field(min_items=1, description='Must have at least one item')]

@app.post('/cart/')
def create_cart(cart: CartRequest):
    return {
        'user_id': cart.user_id,
        'items': cart.items
    }

# OrderItem and OrderRequest Models
class OrderItem(BaseModel):
    product_id: Annotated[int, Field(gt=0, description='Product ID must be a positive integer')]
    quantity: Annotated[int, Field(gt=0, description='Quantity must be at least 1')]
    price: Annotated[float, Field(gt=0, description='Price must be greater than zero')]

class OrderRequest(BaseModel):
    customer_id: Annotated[int, Field(gt=0, description='Customer ID must be a positive integer')]
    order_items: Annotated[List[OrderItem], Field(min_items=1, description='Must have at least one order item')]

@app.post('/order/')
def create_order(order: OrderRequest):
    return {
        'customer_id': order.customer_id,
        'order_items': order.order_items
    }

# CustomerDetails and Product Models
class CustomerDetails(BaseModel):
    name: Annotated[str, Field(min_length=1, description='Customer name')]
    email: Annotated[str, Field(min_length=5, description='Customer email')]



class Product(BaseModel):
    product_id: Annotated[int, Field(gt=0, description='Product ID must be positive')]
    name: Annotated[str, Field(min_length=3, description='Product name')]
    price: Annotated[float, Field(gt=0, description='Price must be greater than zero')]
    discount: Optional[float] = Field(default=None, ge=0, le=0.5, description="Discount từ 0 đến 0.5")
    tags: Optional[List[str]] = None

# InvoiceRequest Model
class InvoiceRequest(BaseModel):
    invoice_id: UUID
    customer_details: CustomerDetails
    products: Annotated[List[Product], Field(min_items=1, description='Must have at least one product')]

@app.post('/invoice/')
def create_invoice(invoice: InvoiceRequest):
    return {
        'invoice_id': invoice.invoice_id,
        'customer_details': invoice.customer_details,
        'products': invoice.products
    }

# New 'create_product' endpoint
@app.post('/product/')
def create_product(product: Product):
    return {
        'product_id': product.product_id,
        'name': product.name,
        'price': product.price,
        'discount': product.discount if product.discount else 'No discount',
        'tags': product.tags if product.tags else 'No tags'
    }

if __name__ == "__main__":
    uvicorn.run("App:app", host="127.0.0.1", port=8000, reload=True)
