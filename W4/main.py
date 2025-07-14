from fastapi import FastAPI, HTTPException
from enum import Enum
from Cau1.ex1 import router as ex1_router
from Cau2.ex2 import router as ex2_router
from Cau3.ex3 import router as ex3_router
from Cau4.ex4 import router as ex4_router
from Cau5.ex5 import router as ex5_router
from Cau6.ex6 import router as ex6_router
from Cau7.ex7 import router as ex7_router
from Cau8.ex8 import router as ex8_router
from Cau9.ex9 import router as ex9_router
from Cau10.ex10 import router as ex10_router
from Cau11.ex11 import router as ex11_router
from Cau12.ex12 import router as ex12_router
from Cau13.ex13 import router as ex13_router

app = FastAPI()

app.include_router(ex1_router)
app.include_router(ex2_router)
app.include_router(ex3_router)
app.include_router(ex4_router)
app.include_router(ex5_router)
app.include_router(ex6_router)
app.include_router(ex7_router)
app.include_router(ex8_router)
app.include_router(ex9_router)
app.include_router(ex10_router)
app.include_router(ex11_router)
app.include_router(ex12_router)
app.include_router(ex13_router)

# @app.get("/greet/{name}")
# def greet(name: str):
#     return {"message": f"Hello, {name}!"}

# @app.get("/age/{age}")
# def check_age(age: int):
#     if age >= 18:
#         return {"message": "Congratulations, you are an adult!"}
#     else:
#         return {"message": "Sorry, you are not an adult."}

# @app.get("/multiply/{num1}/{num2}")
# def multiply(num1: int, num2: int):
#     return num1 * num2

# class Color(str, Enum):
#     red = "Red"
#     green = "Green"
#     blue = "Blue"

#     @classmethod
#     def _missing_(cls, value):
#         # Không case-sensitive
#         if value.lower() in cls._value2member_map_:
#             return cls._value2member_map_[value.lower()]
#         return super()._missing_(value)

# @app.get("/favorite_color/{color}")
# def favorite_color(color: Color):
#     return {"message": f"Your favorite color is {color.value}."}

# @app.get("/hello")
# @app.get("/hello/{name}")
# def hello(name: str = "World"):
#     return {"message": f"Hello {name}!"}

# from datetime import datetime

# @app.get("/validate/{year}")
# def validate_year(year: int):
#     current_year = datetime.now().year
#     if 1900 <= year <= current_year:
#         return {"message": f"The year {year} is valid."}
#     else:
#         return {"message": f"The year {year} is not valid."}

# import calendar

# @app.get("/day_status/{year}/{month}/{day}")
# def day_status(year: int, month: int, day: int):
#     try:
#         date = datetime(year, month, day)
#         day_of_week = calendar.day_name[date.weekday()]
#         if day_of_week in ["Saturday", "Sunday"]:
#             return {"message": f"The day {day}/{month}/{year} is a weekend. It is {day_of_week}."}
#         else:
#             return {"message": f"The day {day}/{month}/{year} is a weekday. It is {day_of_week}."}
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid date")
    
# import re    

# @app.get("/product/{product_id}")
# def validate_product_id(product_id: str):
#     pattern = r"^[A-Za-z]{3}-\d{3}$"
#     if re.match(pattern, product_id):
#         return {"message": f"The product ID {product_id} is valid."}
#     else:
#         raise HTTPException(status_code=400, detail="Invalid product ID format")

# from pydantic import BaseModel
# class User(BaseModel):
#     name: str
# mock_database = {"1": {"name": "John Doe"}}
# next_user_id = 2

# @app.post("/user")
# def create_user(user: User):
#     global next_user_id
#     user_id = str(next_user_id)  
#     mock_database[user_id] = {"name": user.name}
#     next_user_id += 1  
#     return {"message": "User created successfully.", "user_id": user_id}
# @app.get("/user/{user_id}")
# def read_user(user_id: str):
#     user = mock_database.get(user_id)
#     if user is None:
#         raise HTTPException(status_code=404, detail="User not found.")
#     return {"user_id": user_id, "name": user["name"]}

# @app.put("/user/{user_id}")
# def update_user(user_id: str, user: User):
#     if user_id not in mock_database:
#         raise HTTPException(status_code=404, detail="User not found.")
#     mock_database[user_id]["name"] = user.name
#     return {"message": "User updated successfully.", "user_id": user_id}

# @app.delete("/user/{user_id}")
# def delete_user(user_id: str):
#     if user_id not in mock_database:
#         raise HTTPException(status_code=404, detail="User not found.")
#     del mock_database[user_id]
#     return {"message": "User deleted successfully.", "user_id": user_id}


# @app.get("/v1/greet/{name}")
# def greet_v1(name: str):
#     return {"message": f"Hello, {name}!"}
# @app.get("/v2/greet/{name}")
# def greet_v2(name: str):
#     greetings = {
#         "en": f"Hello, {name}!",
#         "vi": f"Xin chào, {name}!",
#         "es": f"¡Hola, {name}!",
#         "fr": f"Bonjour, {name}!"
#     }
#     return {"messages": greetings}

# @app.get("/hello/{language_code}/{name}")
# def hello(language_code: str, name: str):
#     greetings = {
#         "en": f"Hello, {name}!",
#         "es": f"¡Hola, {name}!",
#         "fr": f"Bonjour, {name}!",
#         "vi": f"Xin chào, {name}!"
#     }
#     return {"message": greetings.get(language_code)}

# mock_posts = {
#     "1": {
#         "title": "First Post",
#         "comments": {
#             "1": "Great post!",
#             "2": "Thanks for sharing!"
#         }
#     },
#     "2": {
#         "title": "Second Post",
#         "comments": {
#             "1": "Very informative.",
#             "2": "I learned a lot!"
#         }
#     }
# }

# @app.get("/posts/{post_id}/comments/{comment_id}")
# def get_comment(post_id: str, comment_id: str):
#     post = mock_posts.get(post_id)
#     if post is None:
#         raise HTTPException(status_code=404, detail="Post not found.")
    
#     comment = post["comments"].get(comment_id)
#     if comment is None:
#         raise HTTPException(status_code=404, detail="Comment not found.")
    
#     return {"post_id": post_id, "comment_id": comment_id, "comment": comment}

# @app.get("/files/{file_path:path}")
# def get_file_path(file_path: str):
#     return {"message": f"Received file path: {file_path}"}