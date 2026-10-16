"""Environment-only credential access for local business-pipeline adapters.

This module deliberately does not parse dotenv files, mutate process state, or
return credential values in diagnostics. Secret installation remains an
owner-controlled runtime action.
"""

import os
from typing import Mapping, Optional


class MissingRuntimeCredential(RuntimeError):
    """Raised without exposing a missing credential's value."""


def credential_present(name: str, *, environ: Optional[Mapping[str, str]] = None) -> bool:
    source = os.environ if environ is None else environ
    return bool(str(source.get(name) or "").strip())


def require_runtime_credential(
    name: str,
    *,
    environ: Optional[Mapping[str, str]] = None,
) -> str:
    source = os.environ if environ is None else environ
    value = str(source.get(name) or "").strip()
    if not value:
        raise MissingRuntimeCredential(f"{name} is unavailable in the current process environment")
    return value


def credential_presence_report(*names: str, environ: Optional[Mapping[str, str]] = None):
    """Return names and booleans only; never return or fingerprint secret values."""
    return {name: credential_present(name, environ=environ) for name in names}
