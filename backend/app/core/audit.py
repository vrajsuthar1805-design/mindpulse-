from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Request
from app.models.audit_log import AuditLog
from app.models.user import User

def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user: Optional[User] = None,
    request: Optional[Request] = None
):
    """
    Simulated security audit logging for data access and sensitive operations.
    """
    user_id = user.id if user else None
    ip_address = request.client.host if (request and request.client) else None
    user_agent = request.headers.get("user-agent") if request else None

    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
