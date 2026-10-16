# API Integration Matrix

Audit date: 2026-06-03

Security rule: no frontend should hold long-lived secrets, refresh tokens, service account JSON, Apple private keys, Shopify Admin tokens, Google Ads refresh tokens, Meta long-lived tokens, or Firebase Admin credentials.

## Matrix

| External system | Purpose | Which site/app uses it | Which MCP or backend service should call it | Frontend may call directly? | Required credentials | Where credentials should live | Approval requirements | Current status | Verification step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Meta Graph API / Marketing API | Publish/stage social content, read page/IG metrics, manage ads if approved | Marketing/admin workflows, not public pages | Future Meta MCP/backend only; content drafts may use `content-generation-ai` without publishing | Public links only; no privileged API calls | Meta app credentials, page/account tokens, ad account access | Secret Manager or approved backend env, never Vite env | Publishing, ad spend, audience/billing changes require approval | Placeholder/planning | Confirm public social links are valid or marked pending; verify no Meta tokens in git diff |
| Google Ads API | Campaign/ad/keyword/budget management and metrics | ShieldMate admin approvals and Ads + Analytics workflows | `mcp-google-ads` through MCP Gateway | No | Developer token, OAuth client, refresh token, customer IDs | Secret Manager or Cloud Run secrets | Any mutation or spend requires approved approval record | Placeholder/skeleton; approval UI exists | Verify `AdminApprovals` uses `toolId: "mcp-google-ads"` and gateway rejects unauthenticated execution |
| Google Analytics / GTM | Page/event/conversion tracking and UTM attribution | 2Marines, ShieldMate, MarineCoin public/app routes | Frontend may send client-safe analytics events; `mcp-analytics` may read/report server-side | Yes for client-safe analytics only | GA measurement ID, GTM container ID; server API credentials only if reporting API is used | Public IDs in env/config; reporting credentials in secret storage | GTM publish, conversion import, and tracking architecture changes require approval | Partially configured; GTM/GA targets documented | Check `docs/marketing/ads-tracking-plan.md`; verify no duplicate tracking snippets |
| Shopify Admin API | Product/order/storefront management | Commerce workflows, `/shop` and `/store` public redirects | Commerce backend/MCP only after approval | No Admin API calls; public storefront redirect is allowed | Shopify Admin token/app credentials | Secret Manager or approved backend env | Product/order/checkout/pricing changes require approval | Storefront URL configured; Admin API not configured in repo | Verify `/shop` and `/store` redirect to `https://shieldmateapp.myshopify.com/` where intended |
| Firebase Admin SDK | Verify tokens, manage custom claims, server-side Firestore/Auth operations | MCP Gateway, Cloud Functions, backend admin code | Cloud Functions, MCP Gateway, approved backend services | No | Service account/application default credentials | Firebase/Cloud runtime identity or Secret Manager when needed | Claims/rules/admin mutations require approval | Configured in code paths; no secret file added by this audit | Verify gateway protected route fails closed without ID token |
| Google Play Developer API | Future Play listing, internal test, release metadata | App Release Agent and public app link placeholders | Backend/App Release MCP only if configured | No | Service account or OAuth credentials | Secret Manager or Play-connected CI secrets | App submission/release/signing changes require approval | Placeholder | Verify `VITE_GOOGLE_PLAY_URL` is absent, placeholder, or public URL only |
| Apple App Store Connect API | Future TestFlight/App Store metadata and release automation | App Release Agent and public app link placeholders | Backend/App Release MCP only if configured | No | Issuer ID, key ID, private key | Secret Manager or approved CI secret storage | TestFlight/App Store submission or metadata changes require approval | Placeholder | Verify no Apple private key or App Store Connect token in git diff |
| OpenAI / MCP / Responses API | Content drafts, agent/tool execution, summarization, QA assistance | MCP services and supervised agent workflows | Server-side MCP services such as `content-generation-ai`, not public frontend | No long-lived API key in frontend | OpenAI API key or Azure/OpenAI endpoint credentials | Secret Manager, Cloud Run secrets, or approved local secret storage | Publishing, regulated actions, sensitive data export require approval; draft generation can be read-only | Referenced conceptually; no real key added by this audit | Verify no OpenAI key patterns in changed files and service env docs use placeholders only |

## Frontend Credential Boundary

Allowed in frontend:

- Public URLs.
- Firebase web app config values.
- Analytics measurement/container IDs.
- Public storefront/social/app-store links.
- MCP Gateway base URL if it is not secret.

Not allowed in frontend:

- Refresh tokens.
- Admin tokens.
- Service account JSON.
- Private keys.
- Long-lived access tokens.
- Billing or account-management credentials.
- Firebase Admin credentials.
