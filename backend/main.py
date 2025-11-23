from enum import Enum
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

class Roles(Enum):
    REGULAR_USER = 1
    AUTHORIZED_USER = 2
    MODERATOR = 3
    OWNER = 4

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

# Модель данных для пользователя
class User(BaseModel):
    login: str
    password: str
    id: int = 0
    role: Roles = Roles.REGULAR_USER
    is_banned: bool = False
    liked_posts: list[int] = []

# "База данных" в памяти
users_db = []
next_id = 1

# Корневой эндпоинт
@app.get("/")
async def root():
    return {"message": "Добро пожаловать в мой API!", "status": "работает"}

# Получить всех пользователей
@app.get("/users", response_model=List[User])
async def get_users():
    return users_db

# Получить пользователя по логину
@app.get("/users/{user_login}", response_model=User)
async def get_user(user_login: str):
    user = next((u for u in users_db if u.login == user_login), None)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.is_banned:
        raise HTTPException(status_code=401, detail="Пользователь забанен")
    return {"user": user}

# Получить пользователя по логину
@app.get("/auth/{user_login}")
async def authenticate_user(user_login: str, user_password: str):
    user = next((u for u in users_db if (u.login == user_login and u.password == user_password)), None)
    if user is None:
        raise HTTPException(status_code=404, detail="Пароль или логин неправильны")
    if user.is_banned:
        raise HTTPException(status_code=401, detail="Пользователь забанен")
    return {"user": user}

# Создать нового пользователя
@app.post("/users", response_model=User)
async def create_user(user: User):
    res = next((u for u in users_db if u.login == user.login), None)
    if res is not None:
        raise HTTPException(status_code=401, detail="Пользователь с таким логином уже существует")
    global next_id
    user.id = next_id
    next_id += 1
    users_db.append(user)
    return {"user": user}

# Получить пользователя по ID
@app.post("/users/ban/{user_id}", response_model=User)
async def ban_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.is_banned = True

# Обновить пользователя
@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, updated_user: User):
    for i, user in enumerate(users_db):
        if user.id == user_id:
            updated_user.id = user_id
            users_db[i] = updated_user
            return updated_user
    raise HTTPException(status_code=404, detail="Пользователь не найден")

# Удалить пользователя
@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    for i, user in enumerate(users_db):
        if user.id == user_id:
            deleted_user = users_db.pop(i)
            return {"message": f"Пользователь {deleted_user.name} удален"}
    raise HTTPException(status_code=404, detail="Пользователь не найден")

# Эндпоинт для проверки здоровья
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T12:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)