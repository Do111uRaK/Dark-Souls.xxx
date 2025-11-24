from pydantic import BaseModel, EmailStr
from typing import Optional, List
import enum

class UserBase(BaseModel):
    login: str
    password: str

class UserResponse(UserBase):
    id: int
    role: int
    is_banned: bool
    liked_posts: List[int]

    class Config:
        from_attributes = True

# Дополнительные модели для различных нужд
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    login: Optional[str] = None
    password: Optional[str] = None
    role: Optional[int] = None
    is_banned: Optional[bool] = None

class UserLogin(BaseModel):
    login: str
    password: str