# ShieldMate Web Tree

## Canonical folder layout
frontend/web/
- src/
  - pages/
    - Index.tsx
    - programs/index.tsx
    - programs/ProgramDetail.tsx
    - tie/index.tsx
    - partners/index.tsx
    - partners/PartnerDetail.tsx
    - contact/index.tsx
  - components/site/SiteLayout.tsx
  - styles/tokens.css
  - styles/base.css
  - content/
    - programs/.gitkeep
    - tie/.gitkeep
    - partners/.gitkeep
  - data/
    - programs.seed.json
    - orgs.seed.json
    - tie.seed.json
    - site-data.ts
- public/
  - data/
    - programs.seed.json
    - orgs.seed.json
    - tie.seed.json
- docs/
  - WEB_TREE.md
  - DATASET_EXPORT_CONTRACT.md

## Route map
- / → Home (programs + partners summary)
- /programs → Programs index
- /programs/:programSlug → Program detail (slug from programs.seed.json)
- /tie → TIE program page
- /partners → Partner org index
- /partners/:orgSlug → Partner org detail (slug from orgs.seed.json)
- /contact → Contact info (primary org from orgs.seed.json)

## Data schema
programs.seed.json (Dataset<ProgramItem>)
- schema_version
- meta.site_title
- meta.site_tagline
- meta.nav_home
- meta.nav_programs
- meta.index_title
- meta.index_summary
- items[].id
- items[].slug
- items[].name
- items[].summary
- items[].eligibility
- items[].how_to_apply
- items[].service_area
- items[].last_updated

orgs.seed.json (Dataset<OrgItem>)
- schema_version
- meta.nav_partners
- meta.index_title
- meta.index_summary
- meta.contact_title
- meta.contact_summary
- items[].id
- items[].slug
- items[].name
- items[].category
- items[].description
- items[].address
- items[].phone
- items[].website
- items[].service_area
- items[].intake_steps[]
- items[].last_updated

tie.seed.json (Dataset<TieItem>)
- schema_version
- items[].id
- items[].slug
- items[].name
- items[].summary
- items[].steps[]
- items[].eligibility[]
- items[].partner_roles[]
- items[].last_updated

## MCP rule
MCPs consume JSON exports only and never scrape HTML pages at runtime.