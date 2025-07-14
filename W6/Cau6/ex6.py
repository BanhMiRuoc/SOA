from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List
import json
import imghdr

router = APIRouter(tags=["Exercise 6"])

class ImageMetadata(BaseModel):
    description: str
    tags: List[str]

ALLOWED_IMAGE_TYPES = {"jpeg", "png", "gif"}

@router.post("/upload/")
async def upload_image(
    file: UploadFile = File(...),
    metadata: str = Form('{"description": "A beautiful landscape", "tags": ["nature", "landscape"]}')
):
    # Validate file type
    contents = await file.read()
    file_type = imghdr.what(None, contents)
    if file_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_type} not allowed. Allowed types: {ALLOWED_IMAGE_TYPES}"
        )
    
    # Validate and parse metadata
    try:
        metadata_dict = json.loads(metadata)
        image_metadata = ImageMetadata(**metadata_dict)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON metadata format"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metadata structure: {str(e)}"
        )

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": len(contents),
        "metadata": image_metadata.dict()
    }