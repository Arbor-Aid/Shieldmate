# App Store Beta Readiness

Last updated: 2026-06-03

## Scope

This checklist resumes Google Play and Apple Developer beta setup review for the active 15-day launch campaign. The 90-day framework is future expansion only and is not part of the current commit.

It does not approve changing bundle IDs, package names, signing, store URLs, or release settings.

## Source Materials

- `docs/release/app-store-readiness.md`
- `frontend/flutter/codemagic.yaml`
- `frontend/flutter/ios/Runner/Info.plist`
- `frontend/flutter/android/app/build.gradle`
- `frontend/flutter/android/app/src/main/AndroidManifest.xml`
- `frontend/web/src/config/marketingLinks.ts`

## Current Repo-Side Findings

- Flutter exists under `frontend/flutter` as a legacy or isolated app.
- iOS display name is `ShieldMate`.
- Some identifiers are inconsistent or placeholder-like in the Flutter project.
- Codemagic references `com.2marines.2marinesOnline` for the TestFlight workflow.
- Store product URLs remain placeholder-driven until App Store Connect and Play Console records exist.
- No account-side App Store Connect or Google Play Console record evidence is stored in the repo.

## 15-Day Launch Placeholder Policy

- Keep App Store and Google Play CTAs as placeholders until product pages exist.
- Do not publish placeholder store URLs in paid ads.
- Organic launch materials may mention beta readiness only if the wording is approved.
- Any app-store or Google Play release action requires account-owner approval.

## Do Not Change Yet

- Do not change iOS bundle identifiers.
- Do not change Android application IDs or package names.
- Do not change signing configuration.
- Do not change App Store or Google Play URLs.
- Do not add private keys, certificates, provisioning profiles, API keys, issuer IDs, or service-account JSON files to the repo.

## Apple TestFlight Checklist

- Confirm Apple Developer team.
- Confirm production bundle ID.
- Confirm App Store Connect app record exists.
- Confirm app name, subtitle, support URL, privacy URL, and category.
- Confirm TestFlight internal tester group.
- Confirm signing assets are available through approved secure storage.
- Confirm Codemagic environment variables are configured outside the repo.
- Confirm first beta build number strategy.
- Submit to TestFlight only after account owner approval.

## Google Play Internal Testing Checklist

- Confirm Google Play Console app record exists.
- Confirm production Android application ID.
- Confirm app name, short description, full description, category, and contact details.
- Confirm privacy policy URL.
- Confirm app content declarations.
- Confirm internal testing track and tester list.
- Confirm signing approach.
- Confirm release notes.
- Publish internal test only after account owner approval.

## Required Assets

- App icon set.
- Store screenshots.
- Feature graphic for Google Play if required.
- Privacy policy URL.
- Support URL.
- App description copy.
- Release notes.

## Blockers

- Confirm final iOS bundle ID.
- Confirm final Android application ID.
- Confirm account-side app records.
- Confirm secure signing and API credential storage.
- Confirm final store URLs before wiring public website buttons.
