from fastapi import APIRouter
from enum import Enum

router = APIRouter()

class Color(str, Enum):
    red = "Red"
    green = "Green"
    blue = "Blue"

    @classmethod
    def _missing_(cls, value):
        # Không case-sensitive
        if value.lower() in cls._value2member_map_:
            return cls._value2member_map_[value.lower()]
        return super()._missing_(value)

@router.get("/favorite_color/{color}")
def favorite_color(color: Color):
    return {"message": f"Your favorite color is {color.value}."}