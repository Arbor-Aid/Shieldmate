import os
from typing import Dict, Any
import firebase_admin
from firebase_admin import auth as fb_auth, credentials

_app_inited = False

def _init_firebase_admin():
    global _app_inited
    if _app_inited:
        return
    # If running in Cloud Run with default creds, firebase_admin.initialize_app() can work.
    # If you need explicit service account JSON, wire it via Secret Manager + env file path later.
    try:
        firebase_admin.initialize_app()
        _app_inited = True
        return
    except Exception:
        # Allow falling through to dev/noauth.
        return

def verify_firebase_token(authorization_header: str) -> Dict[str, Any]:
    """
    Requires: Authorization: Bearer <id_token>
    DEV fallback ONLY if ALLOW_DEV_NOAUTH=true and token == 'dev'
    """
    if not authorization_header or not authorization_header.lower().startswith("bearer "):
        raise PermissionError("Missing Authorization Bearer token.")
    token = authorization_header.split(" ", 1)[1].strip()

    allow_dev = os.getenv("ALLOW_DEV_NOAUTH", "false").lower() == "true"
    if allow_dev and token == "dev":
        return {
            "uid": "dev",
            "email": "dev@local",
            "orgId": "dev-org",
            "roles": ["super_admin"],
            "admin": True,
        }

    _init_firebase_admin()
    decoded = fb_auth.verify_id_token(token)
    # Normalize common claim names
    claims = dict(decoded)
    # Custom claims expected: orgId, roles[], admin bool
    return claims

def _extract_org_id(claims: Dict[str, Any]):
    for key in ("orgId", "org_id", "org"):
        value = claims.get(key)
        if isinstance(value, str) and value:
            return value
    org_roles = claims.get("orgRoles")
    if isinstance(org_roles, dict):
        for key in org_roles.keys():
            if isinstance(key, str) and key:
                return key
    return None

def _extract_roles(claims: Dict[str, Any]):
    roles = claims.get("roles")
    if isinstance(roles, list):
        return [r for r in roles if isinstance(r, str) and r]
    legacy_role = claims.get("role")
    if isinstance(legacy_role, str) and legacy_role:
        return [legacy_role]
    return []

def enforce_org_match(claims: Dict[str, Any], payload_org_id: str):
    token_org = _extract_org_id(claims)
    if not payload_org_id:
        raise PermissionError("Payload orgId required.")
    if not token_org or token_org != payload_org_id:
        raise PermissionError("orgId mismatch.")

def require_approver(claims: Dict[str, Any]):
    roles = _extract_roles(claims)
    admin = bool(claims.get("admin"))
    normalized_roles = [r.lower() for r in roles]
    # Approver rule: admin OR super_admin OR role includes 'joshua'/'luis'
    ok = admin or ("super_admin" in normalized_roles) or ("joshua" in normalized_roles) or ("luis" in normalized_roles)
    if not ok:
        raise PermissionError("Approver role required.")
