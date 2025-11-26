from typing import List

from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import User
from schemas import UpdateUser, UserResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_login}", response_model=UserResponse)
async def get_user_by_login(user_login: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login == user_login).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.is_banned:
        raise HTTPException(status_code=401, detail="Пользователь забанен")
    return user


@router.patch("/ban")
async def ban_user(user_id: int, db: Session = Depends(get_db)):
    db.query(User).filter(User.id == user_id).update({"is_banned": True})
    db.commit()


@router.patch("/unban")
async def unban_user(user_id: int, db: Session = Depends(get_db)):
    db.query(User).filter(User.id == user_id).update({"is_banned": False})
    db.commit()


@router.put("/update/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, updated_user: UpdateUser, db: Session = Depends(get_db)
):
    # Находим пользователя
    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Обновляем поля
    for field, value in updated_user.model_dump(
        exclude_unset=True, exclude_none=True
    ).items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


# Удалить пользователя
@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    res = db.query(User).filter(User.id == user_id).delete()
    print(res)
    db.commit()
