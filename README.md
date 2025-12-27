![Shieldmate Banner](docs/assets/shieldmate-banner.png)

<p align="center">
  <a href="https://github.com/Arbor-Aid/Shieldmate/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Arbor-Aid/Shieldmate/ci.yml?label=CI%20Build&logo=githubactions&style=for-the-badge" alt="Build Status"></a>
  <a href="https://github.com/Arbor-Aid/Shieldmate/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/Arbor-Aid/Shieldmate?style=for-the-badge" alt="License"></a>
  <a href="https://github.com/Arbor-Aid/Shieldmate/stargazers"><img src="https://img.shields.io/github/stars/Arbor-Aid/Shieldmate?style=for-the-badge&logo=github" alt="Stars"></a>
  <a href="https://github.com/Arbor-Aid/Shieldmate/issues"><img src="https://img.shields.io/github/issues/Arbor-Aid/Shieldmate?style=for-the-badge" alt="Issues"></a>
</p>

# 🛡️ Shieldmate — The Autonomous Support Platform

Shieldmate orchestrates autonomous AI agents, Firebase, Dockerized Model Context Protocol (MCP) services, Slack workflows, and a Lovable.dev React UI to deliver a mission-ready support platform.

---

## ✨ Screenshots

| Dashboard | Mobile | Architecture |
| --- | --- | --- |
| ![Dashboard](docs/assets/dashboard.png) | ![Mobile](docs/assets/mobile.png) | ![Architecture Diagram](docs/assets/diagram.png) |

---

## 🚀 Features

- 🤖 **Autonomous AI agents** coordinate tasks across domains.
- 🔥 **Firebase + Google Cloud backend** for auth, data, and serverless functions.
- 🐳 **Dockerized MCP services** deployable to Cloud Run.
- 💬 **Slack + Notion integrations** keep humans in the loop.
- ⚙️ **CI/CD workflows** with lint, tests, deploy, and health checks.
- 📊 **Google Workspace + Notion sync** for governance and visibility.

---

## ⚡ Quickstart

```bash
# Clone the repo
git clone https://github.com/Arbor-Aid/Shieldmate.git
cd Shieldmate

# Web frontend + services
npm install
npm run dev
```

---

## 🧠 Architecture

![Shieldmate Architecture](docs/assets/diagram.png)

- **Frontend**: React + Vite UI.
- **MCP Services**: Docker containers for AI agents (Cloud Run ready).
- **Firebase**: Auth, Firestore, Functions, Storage, and Analytics.
- **Integrations**: Slack workflows, Notion dashboards, Google Workspace automations.

See [`docs/AGENT_ARCHITECTURE.md`](docs/AGENT_ARCHITECTURE.md) for agent, MCP, edge, and RBAC design.

---

## Web Platform (Active)

- Vite + React + TypeScript in `src/`, built with Vite and deployed from `dist/` to Firebase Hosting.
- Firebase Auth + App Check are initialized in `src/lib/firebase.ts`; MCP calls are made via `src/services/mcpClient.ts` or `useMcpClient`.
- SPA routing is served through `firebase.json` rewrites to `/index.html`.

## Flutter (Legacy / Isolated)

- Historic mobile work lives in `android/` and `frontend/arbor_aid_app/`.
- These paths remain untouched for now; all new product work is in the web stack.

## Dev Quick Start (Web)

```bash
npm install
npm run dev:web
# sanity check before pushing
npm run verify
```

---

## 🗂️ Governance Snapshot

See the current compliance + automation posture in [`docs/governance_snapshot.md`](docs/governance_snapshot.md).

---

## 🤝 Contributing

- Follow CODEOWNERS review gates for frontend, backend MCPs, DevOps workflows, and sensitive configs.
- Open a feature branch from `main`, create a PR, and tag the relevant owners.
- All contributions run through CI, security checks, and branch protection rules.

---

## 📄 License

Released under the [MIT License](LICENSE.md).

---

## ⚡ Call to Action

**Deploy your own Shieldmate and let the AI agents do the work!**
---

## Production Hardening Notes

- Hosting: firebase.json serves dist/ with SPA rewrite to index.html plus CSP, HSTS, X-Content-Type-Options, Referrer-Policy, and X-Frame-Options headers.
- Firebase env: set VITE_FIREBASE_* keys, VITE_FIREBASE_APPCHECK_KEY (reCAPTCHA v3), VITE_ENABLE_EMAIL_AUTH, and VITE_MCP_ENDPOINT for the Cloud Run MCP HTTPS endpoint.
- Firebase Console: enable App Check (Web) and enforce on Firestore + Cloud Functions; allow domain shieldmate.2marines.us; enable Google sign-in and email/password only if desired.
- MCP: Cloud Run service must accept Authorization: Bearer <idToken> and optional X-Firebase-AppCheck; keep the endpoint HTTPS only.
- Deployment: use deploy-shieldmate.ps1 locally or GitHub Actions workflow .github/workflows/deploy-shieldmate.yml to deploy hosting target shieldmate on project marines-ai-agent.
