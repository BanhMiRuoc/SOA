from fastapi import APIRouter
router = APIRouter()
@router.get("/files/{file_path:path}")
def get_file_path(file_path: str):
    return {"message": f"Received file path: {file_path}"}