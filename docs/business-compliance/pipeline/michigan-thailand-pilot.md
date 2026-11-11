# Michigan-Thailand Machinery Research Pilot

Status: research scope only; no procurement, customs, shipment, sales-lead, or external-write authority

Assessment date: 2026-10-16

Authority: ShieldMate Canon v2.0 and `docs/SYSTEM_OF_RECORD.md`

## Bounded scope

- Geography: Michigan statewide, with Washtenaw County (state FIPS `26`, county FIPS `161`) as the first county drill-down.
- Trade partner: Thailand. This identifies a country-level research partner only, not a buyer, seller, carrier, or approved destination.
- Industry family: machinery manufacturing.
- Initial aggregate industry code: 2022 NAICS `333`, Machinery Manufacturing.
- Outputs: aggregate Census/Comtrade intelligence, candidate classification research, and logistics questions for human review.
- Exclusions: company leads, transactional counterparties, tariff or origin determinations, customs rulings, carrier selection, quotes, capacity claims, and execution.

## Classification method

The structured companion artifact, `michigan-thailand-naics-hs-candidates.json`, uses only the U.S. Census Bureau's 2022 NAICS definitions and its 2026 Schedule B export concordance. The official fixed-width layout identifies the 10-digit Schedule B commodity field at positions 1-10 and the six-digit NAICS field at positions 266-271. The artifact derives the six-digit HS candidate from the first six digits of the cited 2026 Schedule B code.

This evidence demonstrates a statistical concordance, not a product-specific classification. A single HS six-digit heading can correspond to several NAICS industries because individual 10-digit Schedule B lines within that heading map differently. Conversely, one NAICS industry can map to many HS headings. Product composition, function, principal use, technical specifications, and the importing country's tariff schedule remain unresolved.

Official evidence:

- U.S. Census Bureau, 2022 NAICS, Machinery Manufacturing: https://www.census.gov/naics/?chart=2022&details=333&input=333
- U.S. Census Bureau, 2026 Schedule B export concordance: https://www.census.gov/foreign-trade/schedules/b/2026/exp-code.txt
- U.S. Census Bureau, 2026 export-concordance layout: https://www.census.gov/foreign-trade/schedules/b/2026/exp-stru.txt
- U.S. Census Bureau, AES concordance notice (July 1, 2026): https://www.census.gov/foreign-trade/aes/concordance.html

## Review gates

1. Keep Census and UN Comtrade results `INTELLIGENCE_ONLY`; neither source creates a Possible Fit buyer or seller record.
2. Select a specific product and confirm current technical facts before narrowing any candidate code.
3. Require a trade/customs specialist to review the exporting and importing classifications and any Thailand-specific requirements.
4. Treat the NAICS-to-HS artifact as non-authoritative research guidance. It is not a customs classification or customs ruling.
5. Keep every external mutation, outreach, quote request, shipment instruction, or filing behind the existing human approval workflow.

No live Census, Comtrade, carrier, port, or customs call was performed to create this scope.
