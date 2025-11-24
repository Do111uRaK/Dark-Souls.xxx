from sqlalchemy import Enum, Column, Integer, String, Text, Table, ForeignKey, ARRAY, Boolean
from database import Base
import enum

# # Ассоциативная таблица для связи многие-ко-многим между пользователями и постами
# user_post_likes = Table(
#     'user_post_likes',
#     Base.metadata,
#     Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
#     Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True)
# )

class Roles(enum.Enum):
    AUTHORIZED_USER = 1
    MODERATOR = 2
    OWNER = 3


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String(100), index=True, unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(Enum(Roles), default=Roles.AUTHORIZED_USER, nullable=False)
    is_banned = Column(Boolean(), default=False, nullable=False)
    liked_posts = Column(ARRAY(Integer), default=list(), nullable=False)
     
#     # Связь с постами, которые пользователю понравились
#     
    
#     # Посты, которые пользователь создал (как автор)
#     posts_created = relationship("Post", back_populates="author")

# class Post(Base):
#     __tablename__ = "posts"

#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(200), nullable=False)
#     content = Column(Text)
#     author_id = Column(Integer, ForeignKey('users.id'), nullable=False)

#     # Автор поста
#     author = relationship("User", back_populates="posts_created")
    
#     # Пользователи, которым понравился этот пост
#     liked_by_users = relationship(
#         "User", 
#         secondary=user_post_likes, 
#         back_populates="liked_posts"
#     )