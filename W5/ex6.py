from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/greet")
def greet_user(name: str, birth_year: int):
    age = datetime.now().year - birth_year
    return {"message": f"Hello, {name}, you are {age} years old."}
