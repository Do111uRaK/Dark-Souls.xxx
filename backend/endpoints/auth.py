from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import User
from schemas import UserLogin, UserResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login/", response_model=UserResponse)
async def authenticate_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.login == user.login).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Пароль или логин неправильны")
    if db_user.password != user.password:
        print("я упал здесьЦ")
        raise HTTPException(status_code=404, detail="Пароль или логин неправильны")
    if db_user.is_banned:
        raise HTTPException(status_code=401, detail="Пользователь забанен")
    return db_user


@router.post("/register", response_model=UserResponse)
async def register_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.login == user.login).first()
    if db_user is not None:
        raise HTTPException(
            status_code=401, detail="Пользователь с таким логином уже существует"
        )
    db_user = User(login=user.login, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
