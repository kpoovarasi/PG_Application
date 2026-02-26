"""
routers/auth.py — Login endpoint → returns JWT token
Serves: login-page.tsx
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import User
from schemas.auth import LoginRequest, TokenOut
from auth import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenOut)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    print(f"Login attempt: {payload.email}")
    
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    
    if not user:
        print(f"User not found: {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    print(f"User found: {user.email}, role: {user.role}")
    password_valid = verify_password(payload.password, user.password_hash)
    print(f"Password valid: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenOut(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        name=user.name,
    )

@router.get("/me")
async def get_me(token: str, db: AsyncSession = Depends(get_db)):
    """Get current user info from token (used on page load)."""
    from auth import get_current_user
    user = await get_current_user(token, db)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
