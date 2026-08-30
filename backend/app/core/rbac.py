from typing import List
from fastapi import HTTPException, status
from app.models.user import User, UserRole

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User) -> bool:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Operation requires one of the roles {[r.value for r in self.allowed_roles]}. Your role: {current_user.role.value}"
            )
        return True

allow_admin = RoleChecker([UserRole.ADMIN])
allow_doctor = RoleChecker([UserRole.DOCTOR, UserRole.ADMIN])
allow_patient = RoleChecker([UserRole.PATIENT, UserRole.ADMIN])
allow_any = RoleChecker([UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT])
