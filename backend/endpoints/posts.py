from typing import List

from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import Post, user_post_likes, User
from schemas import PostResponse, UserBase, PostCreate
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=List[PostResponse])
async def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = (
        db.query(
            Post.id,
            Post.title,
            Post.content,
            func.count(user_post_likes.c.user_id).label(
                "likes_count"
            ),  # Подсчет лайков
            User.login.label("author_login"),
        )
        .join(User, Post.author_id == User.id) 
        .outerjoin(
            user_post_likes, Post.id == user_post_likes.c.post_id
        ) 
        .group_by(
            Post.id, Post.title, Post.content, User.login
        ) 
        .offset(skip)
        .limit(limit)
        .all()
    )
    print(posts)
    return posts


@router.post("/create")
async def create_post(
    new_post: PostCreate, db: Session = Depends(get_db)
):
    new_db_post = Post(title=new_post.title, content=new_post.content, author_id=new_post.author_id)
    db.add(new_db_post)
    db.commit()


# Удалить усера
@router.delete("/{post_id}")
async def delete_post(post_id: int, db: Session = Depends(get_db)):
    res = db.query(Post).filter(Post.id == post_id).delete()
    db.commit()


@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: UserBase, 
    db: Session = Depends(get_db),
):
    # Проверяем, существует ли пост
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Пост не найден")

    # Проверяем, не лайкнул ли уже пользователь этот пост
    existing_like = db.execute(
        user_post_likes.select().where(
            (user_post_likes.c.user_id == current_user.id)
            & (user_post_likes.c.post_id == post_id)
        )
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="Пост уже лайкнули")

    # Добавляем лайк
    db.execute(
        user_post_likes.insert().values(user_id=current_user.id, post_id=post_id)
    )
    db.commit()

    return {"message": "Пост лайкнут"}


@router.delete("/{post_id}/like")
async def unlike_post(
    post_id: int,
    current_user: UserBase,
    db: Session = Depends(get_db),
):
    # Проверяем, существует ли лайк
    existing_like = db.execute(
        user_post_likes.select().where(
            (user_post_likes.c.user_id == current_user.id)
            & (user_post_likes.c.post_id == post_id)
        )
    ).first()

    if not existing_like:
        raise HTTPException(status_code=400, detail="Пост не был лайкнут до этого")

    # Удаляем лайк
    db.execute(
        user_post_likes.delete().where(
            (user_post_likes.c.user_id == current_user.id)
            & (user_post_likes.c.post_id == post_id)
        )
    )
    db.commit()

    return {"message": "Лайк успешно убран"}
