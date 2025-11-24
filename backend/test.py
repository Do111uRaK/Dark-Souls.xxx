import models
import schemas
from database import engine, get_db
from sqlalchemy.orm import Session

# Создание таблиц
models.Base.metadata.create_all(bind=engine)


db: Session = next(get_db())

def add_user(login: str, password: str):
    db_user = db.query(models.User).filter(models.User.login == login).first()
    if db_user:
        return
    db_user = models.User(login=login, password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

def get_users(skip: int = 0, limit: int = 100) -> list[models.User]:
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

def main() -> None:
    add_user("ivan", "password")
    users = get_users()
    for user in users:
        print(user.is_banned)

if __name__ == "__main__":
    main()