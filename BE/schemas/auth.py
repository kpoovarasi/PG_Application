"""schemas/auth.py — Pydantic schemas for authentication"""
from pydantic import BaseModel
from enum import Enum

class UserRoleEnum(str, Enum):
    admin  = "admin"
    tenant = "tenant"

class LoginRequest(BaseModel):
    email:    str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    role:         UserRoleEnum
    user_id:      int
    name:         str

class UserOut(BaseModel):
    id:    int
    uid:   str
    name:  str
    email: str
    role:  UserRoleEnum

    model_config = {"from_attributes": True}
