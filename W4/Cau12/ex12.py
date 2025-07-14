from fastapi import APIRouter, HTTPException
router = APIRouter()
mock_posts = {
    "1": {
        "title": "First Post",
        "comments": {
            "1": "Great post!",
            "2": "Thanks for sharing!"
        }
    },
    "2": {
        "title": "Second Post",
        "comments": {
            "1": "Very informative.",
            "2": "I learned a lot!"
        }
    }
}

@router.get("/posts/{post_id}/comments/{comment_id}")
def get_comment(post_id: str, comment_id: str):
    post = mock_posts.get(post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    comment = post["comments"].get(comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found.")
    
    return {"post_id": post_id, "comment_id": comment_id, "comment": comment}