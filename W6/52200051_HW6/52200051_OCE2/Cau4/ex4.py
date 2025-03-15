from fastapi import APIRouter, Query, Path
from pydantic import BaseModel, Field
from typing import List
from enum import Enum

router = APIRouter(tags=["Exercise 4"])

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

class Book(BaseModel):
    title: str = Field(..., min_length=1)
    author: str = Field(..., min_length=1)
    year: int = Field(..., ge=0)

class Library(BaseModel):
    books: List[Book]

library_books: List[Book] = []

@router.post("/library/books/")
def add_books(library: Library):
    library_books.extend(library.books)
    return {
        "message": f"Added {len(library.books)} books to the library",
        "total_books": len(library_books)
    }

@router.get("/library/books/{sort_order}")
def get_sorted_books_by_path(sort_order: SortOrder = Path(...)):
    sorted_books = sorted(
        library_books,
        key=lambda x: x.author,
        reverse=(sort_order == SortOrder.DESC)
    )
    return {"books": sorted_books}

@router.get("/library/books/")
def get_sorted_books(
    sort_order: SortOrder = Query(SortOrder.ASC)
):
    sorted_books = sorted(
        library_books,
        key=lambda x: x.author,
        reverse=(sort_order == SortOrder.DESC)
    )
    return {"books": sorted_books}