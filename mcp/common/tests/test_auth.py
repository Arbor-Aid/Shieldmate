import sys
import types
import unittest

firebase_admin = types.ModuleType("firebase_admin")
firebase_auth = types.ModuleType("firebase_admin.auth")
firebase_credentials = types.ModuleType("firebase_admin.credentials")
firebase_admin.initialize_app = lambda: None
firebase_auth.verify_id_token = lambda token: {}
firebase_admin.auth = firebase_auth
firebase_admin.credentials = firebase_credentials
sys.modules.setdefault("firebase_admin", firebase_admin)
sys.modules.setdefault("firebase_admin.auth", firebase_auth)
sys.modules.setdefault("firebase_admin.credentials", firebase_credentials)

from pathlib import Path
from runpy import run_path

auth_module = run_path(str(Path(__file__).resolve().parents[1] / "auth.py"))
enforce_org_match = auth_module["enforce_org_match"]
require_approver = auth_module["require_approver"]


class ClaimsAuthorizationTests(unittest.TestCase):
    def test_requested_org_admin_is_allowed(self):
        claims = {"orgRoles": {"org-a": ["org_admin"]}}
        enforce_org_match(claims, "org-a")
        require_approver(claims, "org-a")

    def test_cross_org_role_is_rejected(self):
        claims = {"orgRoles": {"org-a": ["org_admin"]}}
        with self.assertRaises(PermissionError):
            enforce_org_match(claims, "org-b")
        with self.assertRaises(PermissionError):
            require_approver(claims, "org-b")

    def test_global_super_admin_can_access_requested_org(self):
        claims = {"roles": ["super_admin"]}
        enforce_org_match(claims, "org-b")
        require_approver(claims, "org-b")

    def test_admin_boolean_is_not_authority(self):
        claims = {"admin": True, "orgId": "org-a"}
        with self.assertRaises(PermissionError):
            require_approver(claims, "org-a")

    def test_super_admin_inside_org_roles_is_not_global(self):
        claims = {"orgRoles": {"org-a": ["super_admin"]}}
        with self.assertRaises(PermissionError):
            enforce_org_match(claims, "org-a")
        with self.assertRaises(PermissionError):
            require_approver(claims, "org-a")

    def test_legacy_role_requires_matching_org(self):
        claims = {"org": "org-a", "role": "org_admin"}
        require_approver(claims, "org-a")
        with self.assertRaises(PermissionError):
            require_approver(claims, "org-b")

    def test_ambiguous_org_context_requires_requested_scope(self):
        claims = {
            "orgRoles": {
                "org-a": ["org_admin"],
                "org-b": ["client"],
            }
        }
        with self.assertRaises(PermissionError):
            require_approver(claims, None)
        with self.assertRaises(PermissionError):
            require_approver(claims, "org-b")


if __name__ == "__main__":
    unittest.main()
