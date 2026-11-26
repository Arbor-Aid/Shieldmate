# Dataset Export Contract

## JSON export locations
- Source-of-truth: frontend/web/src/data/*.seed.json
- Published exports: frontend/web/public/data/*.seed.json
- Hosted path (static): /data/*.seed.json

## Versioning strategy
- schema_version is stored at the dataset root.
- last_updated is stored on every item entry.
- Update both when structure or content changes.

## MCP access rules
- MCPs should request the static JSON files (for example /data/programs.seed.json).
- MCPs must not scrape HTML pages for data.
- MCPs should cache by last_updated and refresh when the timestamp changes.