# Compliance and Security Posture

ShieldMate is NOT a government agency.
ShieldMate provides no legal or medical advice.

## SOC2/ISO readiness posture
- Claims-based RBAC with role and org scoping via Firebase custom claims.
- Append-only audit logging in Firestore with retention metadata.
- Access reviews and change control documented in `docs/COMPLIANCE.md` and `docs/SYSTEM_OF_RECORD.md`.
- Incident response and recovery expectations defined in `docs/COMPLIANCE.md`.

## Data minimization
- Collect only data required for service operation.
- Avoid storing PII in audit logs or operational logs.

## PII handling
- Org data is segmented under organization paths in Firestore and protected by rules.
- App Check and claims-based rules gate all data access.

## User account deletion
- Remove the Firebase Auth user record.
- Delete or anonymize org-scoped Firestore data tied to the user.
- Preserve audit records without PII per retention policy.

## Audit readiness
- Audits are append-only and reviewable by administrators.
- Evidence for access reviews and incident response should be retained for compliance reviews.