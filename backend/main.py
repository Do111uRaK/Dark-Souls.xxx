from database import Base, engine
from endpoints.auth import router as auth_router
from endpoints.posts import router as posts_router
from endpoints.users import router as users_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import locale

locale.setlocale(locale.LC_ALL, '')

# создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Simple API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T12:00:00Z"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
