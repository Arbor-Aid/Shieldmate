# App Store Readiness

Audit date: 2026-06-01

Flutter is present as a legacy/isolated app under `frontend/flutter`; main UI is React under `frontend/web`.

## Metadata Found

| Item | Status | Evidence |
| --- | --- | --- |
| App name | Mixed | iOS display name is `ShieldMate` in `frontend/flutter/ios/Runner/Info.plist`; pubspec name and Android label remain `arbor_aid_app`. |
| iOS bundle ID | Found but placeholder-like | `frontend/flutter/ios/Runner.xcodeproj/project.pbxproj` uses `com.example.arborAidApp`; `frontend/flutter/ios/Runner/Info.plist` reads `$(PRODUCT_BUNDLE_IDENTIFIER)`. |
| Android package name | Found but inconsistent | App Gradle `applicationId` is `com.example.arbor_aid_app` in `frontend/flutter/android/app/build.gradle`; manifest package is `com.twomarines.twomarinesonline` in `frontend/flutter/android/app/src/main/AndroidManifest.xml`. |
| Version | Found | `frontend/flutter/pubspec.yaml` has `version: 1.0.0+1`. |
| App icons | Needs review | Android still references `@mipmap/ic_launcher`; brand image assets exist in `frontend/flutter/assets/images/` and `frontend/flutter/assets/logo.png`. |
| Screenshots | Missing from repo evidence | No App Store/Play Store screenshot set found in release docs or Flutter metadata. |
| Privacy policy URL | Missing for ShieldMate app release | A MarineCoin privacy route exists at `/marinecoin/legal/privacy`, but no ShieldMate app privacy URL was confirmed. |
| Support URL | Partially available | Public contact routes exist in React (`/contact`, `/site/contact`), but no app-store support URL is declared in release metadata. |
| Apple App Store URL | Placeholder | `frontend/web/src/config/marketingLinks.ts` reads `VITE_APP_STORE_URL`. Existing HeroSection contains placeholder-style Apple URL. |
| Google Play URL | Placeholder | `frontend/web/src/config/marketingLinks.ts` reads `VITE_GOOGLE_PLAY_URL`. Existing HeroSection contains a hardcoded Google Play URL. |
| App Store Connect status | Account-side placeholder | No App Store Connect record evidence found in repo. |
| Google Play Console status | Account-side placeholder | No Play Console record evidence found in repo. |

## Do Not Change Yet

Do not change bundle IDs, package names, signing configuration, or store URLs until Joshua confirms the production identifiers in Apple Developer and Google Play Console.

## Manual Account-Side Tasks

- Confirm production iOS bundle identifier.
- Confirm production Android application ID.
- Create or verify App Store Connect app record.
- Create or verify Google Play Console app record.
- Add production app icon set and screenshots.
- Publish privacy policy and app support URLs.
- Set `VITE_APP_STORE_URL` and `VITE_GOOGLE_PLAY_URL` only after store pages exist.
