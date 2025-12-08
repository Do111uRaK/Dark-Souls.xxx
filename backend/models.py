import enum

from database import Base
from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship


class Roles(enum.Enum):
    AUTHORIZED_USER = 1
    MODERATOR = 2
    OWNER = 3


# Таблица для связи многие-ко-многим между пользователями и постами
user_post_likes = Table(
    "user_post_likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String(100), index=True, unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(Enum(Roles), default=Roles.AUTHORIZED_USER, nullable=False)
    is_banned = Column(Boolean(), default=False, nullable=False)
    liked_posts = relationship("Post", back_populates="liked_by")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    liked_by = relationship("User", secondary=user_post_likes, back_populates="liked_posts")
    author = relationship("User", backref="posts")
