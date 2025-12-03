from typing import Optional

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    id: Optional[int]
    login: str


class UserResponse(UserBase):
    role: int
    password: str
    is_banned: bool

    class Config:
        from_attributes = True


class UpdateUser(BaseModel):
    login: str | None = Field(default=None)
    password: str | None = Field(default=None)
    role: int | None = Field(default=None)
    is_banned: str | None = Field(default=None)


class UserLogin(BaseModel):
    login: str
    password: str


class PostBase(BaseModel):
    id: Optional[int]
    title: str
    content: str


class PostCreate(BaseModel):
    title: str
    content: str
    author_id: int


class PostResponse(PostBase):
    likes_count: int

    class Config:
        from_attributes = True
