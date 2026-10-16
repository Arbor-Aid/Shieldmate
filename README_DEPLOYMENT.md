# Deployment

## Firebase setup notes
- Firebase configuration lives in `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, and `storage.rules`.
- Firestore rules require App Check and claims-based RBAC; Storage rules currently deny all access by default.
- Auth, Firestore, Storage, and Analytics must be enabled in the Firebase project used for ShieldMate.

## Flutter pipelines (web, Android, iOS)
- Flutter app source is in `frontend/flutter`.
- Android builds use Gradle; Kotlin Gradle Plugin must remain at 1.8.22 (`frontend/flutter/android/settings.gradle`).
- iOS pipeline is defined in `frontend/flutter/codemagic.yaml` (workflow `ios_testflight`).

## MCP services on Cloud Run
- Build MCP containers from `mcp/Dockerfile.mcp` and deploy each service independently.
- MCP Gateway is deployed separately from individual MCP services.
- Use `mcp_services.csv` as the service inventory snapshot.
- Gateway registry defaults to Cloud Run service URLs in deploys. Localhost routing is opt-in via `MCP_USE_LOCALHOST=true` and per-service `MCP_<SLUG>_URL` overrides.

## Slack alerts
- Slack alerts and intake are configured via `SLACK_*` environment variables (template in `.env.bak`).
- Never commit tokens or webhook values.

## Deployment safety
- Do not deploy if the Android Gradle build is failing.
