from enum import Enum
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from database import get_db, engine
import schemas
import models
from sqlalchemy.orm import Session

# Создание таблиц
models.Base.metadata.create_all(bind=engine)

# Создаем экземпляр приложения
app = FastAPI(title="Simple API", version="1.0.0")

# Убедитесь, что CORS настроен правильно
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить все источники (небезопасно для продакшена)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Корневой эндпоинт
@app.get("/")
async def root():
    return {"message": "Добро пожаловать в мой API!", "status": "работает"}

@app.get("/users", response_model=List[schemas.UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users    

@app.get("/users/{user_login}", response_model=schemas.UserResponse)
async def get_user(user_login: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.login == user_login).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if db_user.is_banned:
        raise HTTPException(status_code=401, detail="Пользователь забанен")
    return db_user

@app.get("/auth/{user_login}", response_model=schemas.UserResponse)
async def authenticate_user(user_login: str, user_password: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.login == user_login).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Пароль или логин неправильны")
    if db_user.password != user_password:
        raise HTTPException(status_code=404, detail="Пароль или логин неправильны")
    if db_user.is_banned:
        raise HTTPException(status_code=401, detail="Пользователь забанен")
    return db_user

@app.post("/users", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserBase, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.login == user.login).first()
    if db_user is not None:
        raise HTTPException(status_code=401, detail="Пользователь с таким логином уже существует")
    db_user = models.User(login=user.login, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Получить пользователя по ID
# @app.post("/users/ban/{user_id}", response_model=User)
# async def ban_user(user_id: int):
#     user = next((u for u in users_db if u.id == user_id), None)
#     if user is None:
#         raise HTTPException(status_code=404, detail="Пользователь не найден")
#     user.is_banned = True

# Обновить пользователя
# @app.put("/users/{user_id}", response_model=User)
# async def update_user(user_id: int, updated_user: User):
#     for i, user in enumerate(users_db):
#         if user.id == user_id:
#             updated_user.id = user_id
#             users_db[i] = updated_user
#             return updated_user
#    raise HTTPException(status_code=404, detail="Пользователь не найден")

# Удалить пользователя
# @app.delete("/users/{user_id}")
# async def delete_user(user_id: int):
#     for i, user in enumerate(users_db):
#         if user.id == user_id:
#             deleted_user = users_db.pop(i)
#             return {"message": f"Пользователь {deleted_user.name} удален"}
#     raise HTTPException(status_code=404, detail="Пользователь не найден")

# Эндпоинт для проверки здоровья
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T12:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)