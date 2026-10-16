import os
from typing import Any, Dict

import firebase_admin
from firebase_admin import auth as fb_auth, credentials

_app_inited = False


def _init_firebase_admin():
    global _app_inited
    if _app_inited:
        return
    try:
        firebase_admin.initialize_app()
        _app_inited = True
    except Exception:
        return


def verify_firebase_token(authorization_header: str) -> Dict[str, Any]:
    """
    Requires: Authorization: Bearer <id_token>
    DEV fallback ONLY if ALLOW_DEV_NOAUTH=true and token == "dev".
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
        }

    _init_firebase_admin()
    return dict(fb_auth.verify_id_token(token))


def _explicit_org_id(claims: Dict[str, Any]):
    for key in ("orgId", "org_id", "org"):
        value = claims.get(key)
        if isinstance(value, str) and value:
            return value
    return None


def _extract_org_id(claims: Dict[str, Any]):
    explicit_org_id = _explicit_org_id(claims)
    if explicit_org_id:
        return explicit_org_id

    org_roles = claims.get("orgRoles")
    if not isinstance(org_roles, dict):
        return None

    valid_orgs = [
        org_id
        for org_id, roles in org_roles.items()
        if isinstance(org_id, str)
        and org_id
        and isinstance(roles, list)
        and any(isinstance(role, str) and role and role != "super_admin" for role in roles)
    ]
    return valid_orgs[0] if len(valid_orgs) == 1 else None


def _has_global_super_admin(claims: Dict[str, Any]) -> bool:
    roles = claims.get("roles")
    return isinstance(roles, list) and any(
        isinstance(role, str) and role.lower() == "super_admin"
        for role in roles
    )


def _extract_roles(claims: Dict[str, Any], payload_org_id: str = None):
    role_set = set()

    if _has_global_super_admin(claims):
        role_set.add("super_admin")

    if not payload_org_id:
        return list(role_set)

    explicit_org_id = _explicit_org_id(claims)
    if explicit_org_id == payload_org_id:
        roles = claims.get("roles")
        if isinstance(roles, list):
            for role in roles:
                if isinstance(role, str) and role and role.lower() != "super_admin":
                    role_set.add(role)

        legacy_role = claims.get("role")
        if isinstance(legacy_role, str) and legacy_role:
            role_set.add(legacy_role)

    org_roles = claims.get("orgRoles")
    if isinstance(org_roles, dict):
        scoped_roles = org_roles.get(payload_org_id)
        if isinstance(scoped_roles, list):
            for role in scoped_roles:
                if isinstance(role, str) and role and role.lower() != "super_admin":
                    role_set.add(role)

    return list(role_set)


def enforce_org_match(claims: Dict[str, Any], payload_org_id: str):
    if not payload_org_id:
        raise PermissionError("Payload orgId required.")

    if _has_global_super_admin(claims):
        return

    if _explicit_org_id(claims) == payload_org_id:
        return

    org_roles = claims.get("orgRoles")
    scoped_roles = org_roles.get(payload_org_id) if isinstance(org_roles, dict) else None
    if isinstance(scoped_roles, list) and any(
        isinstance(role, str) and role and role.lower() != "super_admin"
        for role in scoped_roles
    ):
        return

    raise PermissionError("orgId mismatch.")


def require_approver(claims: Dict[str, Any], payload_org_id: str):
    if not payload_org_id:
        raise PermissionError("Payload orgId required.")

    normalized_roles = {
        role.lower()
        for role in _extract_roles(claims, payload_org_id)
        if isinstance(role, str)
    }

    if "super_admin" not in normalized_roles and "org_admin" not in normalized_roles:
        raise PermissionError("Approver role required.")
