"""Shared, dry-run-only business pipeline primitives.

This package contains normalization and packet-building logic shared by existing
MCP owners. Importing it performs no network calls, writes, or service startup.
"""

FUZZY_THRESHOLD = 0.85

