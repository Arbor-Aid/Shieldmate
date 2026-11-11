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


## MarineCoin / Market Intelligence Additions (2026-11-02)

These are candidate integrations, **not** claims of live endpoints, installed keys, approved licenses, or deployed MCP services. Prioritize public read-only data and paper trading. Preserve the existing canonical MCP fleet and its unresolved 28-vs-34 governance count. Never store secrets in this matrix or Git.

| External system | Purpose | Which site/app uses it | Which MCP or backend service should call it | Frontend may call directly? | Required credentials | Where credentials should live | Approval requirements | Current status | Verification step / official documentation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEC EDGAR public data APIs | Equity filings, XBRL fundamentals, point-in-time public disclosures | MarineCoin research | Existing information-retrieval-ai or future approved market-data adapter | No; server-side | No key for public read endpoints; compliant user agent | Not applicable to public API; server logging | Read-only; filings submission separate | Proposed; not connected | https://www.sec.gov/search-filings/edgar-application-programming-interfaces |
| FRED / ALFRED API | Economic indicators and vintage-aware macro backtests | MarineCoin; import/export research | Existing information-retrieval-ai or proposed research adapter | No | FRED API key where required | Approved server secret storage | Read-only | Proposed; not connected | https://fred.stlouisfed.org/docs/api/fred/ |
| U.S. Census International Trade API | Monthly import/export volumes, HS categories, countries, ports | Tradeops; MarineCoin research | Existing tradeops or approved research adapter | No | Census key where required; some public endpoints | Approved server secret storage | Read-only; respect data publication lag | Proposed; not connected | https://www.census.gov/data/developers/data-sets/international-trade.html |
| UN Comtrade API | International trade flows, partners, commodity trends | Tradeops; MarineCoin research | Existing tradeops or approved research adapter | No | Subscription API key for full access; limited preview without | Approved server secret storage | Read-only; review plan/license | Proposed; not connected | https://uncomtrade.org/docs/un-comtrade-api/ |
| CFTC COT public API | Aggregate futures positioning and commodity market analysis | MarineCoin research; tradeops | Approved research adapter | No | Generally no API token for public reporting | No credential needed unless provider changes | Read-only; publication lag | Proposed; not connected | https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm |
| Market price and financial fundamentals provider (Financial Datasets or licensed alternative) | Historical prices, fundamentals, earnings for AI Hedge Fund/TradingAgents | MarineCoin research | Proposed market-data adapter | No | Provider subscription/API key; verify commercial license | Approved server secret storage | Read-only; budget/entitlements approval | Evaluate provider; not connected | https://github.com/virattt/ai-hedge-fund |
| Coinbase Advanced Trade market-data feeds | Crypto trades, tickers, order book for research | MarineCoin crypto research | Proposed market-data adapter | No | Public feed may work without trading credentials; private feed requires auth | Approved server secret storage if private | Market-data only; no order permissions | Proposed; not connected | https://help.coinbase.com/en/developer-platform/websocket-feeds/advanced-trade |
| Alpaca paper-trading API | Simulated stock and crypto portfolio execution | MarineCoin paper research | Proposed isolated simulation adapter, never existing production trade gateway | No | Paper-only API key separate from live credentials | Approved server secret storage; paper-only | Paper orders gated; live orders prohibited | Optional; not connected | https://docs.alpaca.markets/us/docs/trading-api |
| Robinhood Crypto Trading API (legacy bot review) | Review historical bot interfaces; read-only accounts/market data if explicitly approved | MarineCoin legacy bot audit | Proposed isolated adapter | No | Official authorized API credentials only | Approved server secret storage | No live orders; verify permitted API use | Legacy project unverified | https://docs.robinhood.com/crypto/trading/ |
| Jev / TypeSafe decision API | Optional structured signal classification; compare against local models | MarineCoin research; approved agent-routing tests | Proposed research adapter | No | Provider API key and data-handling approval if used | Approved server secret storage | Research only; no execution authority | Optional evaluation; not connected | https://github.com/virattt/ai-hedge-fund |
| Ollama local endpoint (existing) | Local inference for research and subagent workflows | TheBot; FieldBot; MarineCoin research | Existing internal OpenClaw/local model routing | No public frontend access | Private endpoint access via approved local/Tailscale controls | Local protected service configuration | Read-only research; no live trading | Existing local capability; MarineCoin adapter not connected | https://docs.ollama.com/api |

### Registration and readiness rules

November 3 operational update: see [Departmental Integration Status](DEPARTMENTAL_INTEGRATION_STATUS.md) for prior authenticated provider tests, the bounded four-provider run and separate delivery/ingestion limitations. The November 2 candidate inventory remains a historical vendor evaluation; it must not be interpreted as either current connectivity proof or a denial of subsequent test evidence.

- Track API **provider, account owner, entitlement, environment, cost, rate limit, data license, allowed use, key location reference, access scope, test date, and status** in the operational registry. Record a secret reference only, never a secret value.
- Reuse existing `tradeops`, `treasury`, `investment_recommendation`, `information-retrieval-ai`, and `trade_execution_gateway` as **audit candidates**, not assumed working implementations. Validate contracts before reuse.
- Keep external data source integrations in the API matrix; do not increase the MCP service count merely by listing a provider.
- Preserve point-in-time availability, provenance, timestamp, allowed use, checksums and publication lag for research datasets; avoid look-ahead bias.
- Live broker execution, fundraising, investor accounts, custody and related-party transfers remain out of scope pending documented legal approval and independent governance.
