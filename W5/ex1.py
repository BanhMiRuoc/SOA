from fastapi import FastAPI

app = FastAPI()

@app.get("/users")
def get_users(skip: int = 0, limit: int = 10):
    return {"message": f"Fetching users from {skip} to {skip + limit}"}