from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib

# Закодируйте пароль если есть спецсимволы
#password = "password"  # Ваш пароль
#encoded_password = urllib.parse.quote_plus(password)

# Используйте postgresql:// без +psycopg2
#DATABASE_URL = f"postgresql://postgres:{urllib.parse.quote_plus("postgres")}@localhost:5432/darksouls"

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/darksouls"

#print(f"Ошибка при прямом подключении: {e}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

