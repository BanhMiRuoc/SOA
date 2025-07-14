from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router = APIRouter()
class User(BaseModel):
    name: str
mock_database = {"1": {"name": "John Doe"}}
next_user_id = 2

@router.post("/user")
def create_user(user: User):
    global next_user_id
    user_id = str(next_user_id)  
    mock_database[user_id] = {"name": user.name}
    next_user_id += 1  
    return {"message": "User created successfully.", "user_id": user_id}
@router.get("/user/{user_id}")
def read_user(user_id: str):
    user = mock_database.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"user_id": user_id, "name": user["name"]}

@router.put("/user/{user_id}")
def update_user(user_id: str, user: User):
    if user_id not in mock_database:
        raise HTTPException(status_code=404, detail="User not found.")
    mock_database[user_id]["name"] = user.name
    return {"message": "User updated successfully.", "user_id": user_id}

@router.delete("/user/{user_id}")
def delete_user(user_id: str):
    if user_id not in mock_database:
        raise HTTPException(status_code=404, detail="User not found.")
    del mock_database[user_id]
    return {"message": "User deleted successfully.", "user_id": user_id}