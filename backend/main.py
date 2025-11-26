from database import Base, engine
from endpoints.auth import router as auth_router
from endpoints.posts import router as posts_router
from endpoints.users import router as users_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Создаем экземпляр приложения
app = FastAPI(title="Simple API", version="1.0.0")

# Убедитесь, что CORS настроен правильно
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить все источники (небезопасно для продакшена)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)


# Корневой эндпоинт
@app.get("/")
async def root():
    return {"message": "Добро пожаловать в мой API!", "status": "работает"}


# Эндпоинт для проверки здоровья
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T12:00:00Z"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
