# Michigan-Thailand Freight Corridor Research Assessment

Status: bounded decision support only; no routing, carrier, booking, capacity, cost, customs, or feasibility determination

Assessment date: 2026-10-16

Pilot: Michigan statewide; Washtenaw County drill-down; Thailand partner; machinery manufacturing

## Official evidence reviewed

| Source | Source date/version | What it supports | URL |
|---|---|---|---|
| BTS National Transportation Atlas Database | Continuously updated catalog; spring 2025 release describes highway, rail, and Principal Ports layers | Dataset authority and limitations | https://www.bts.gov/ntad |
| BTS NTAD National Highway Planning Network | Compiled 2014-05-01; version `2014.05` in queried Washtenaw rows | County-level candidate road access only | https://rosap.ntl.bts.gov/view/dot/54952 |
| BTS NTAD National Highway Freight Network | Compiled 2023-01-27; queried Michigan I-94 rows identify version `2023.02.08` and source-year 2019 | Statewide primary freight-system evidence | https://rosap.ntl.bts.gov/view/dot/88270 |
| BTS/FRA North American Rail Network Lines | Updated 2026-07-21 | Rail-line ownership/operation and network attributes for Washtenaw County | https://rosap.ntl.bts.gov/view/dot/53568 |
| BTS NTAD Principal Ports, sourced from USACE | Calendar year 2023 | Great Lakes port identity and annual tonnage fields | https://geodata.bts.gov/datasets/usdot::principal-ports/about |
| USACE Waterborne Commerce Statistics Center | WCSC page reviewed 2026-10-16; Ports and Waterways tool last updated 2026-08-03 | Official port/waterway, cargo, trip, and tonnage program context | https://www.iwr.usace.army.mil/About/Technical-Centers/WCSC-Waterborne-Commerce-Statistics-Center/WCSC-Waterborne-Commerce/ |

The public BTS feature services were queried read-only on 2026-10-16. No credential, carrier system, booking system, or commercial data source was used.

## Bounded findings

### Highway access

- The county-filtered NHPN layer contains Washtenaw County segments for I-94, US-23, US-12, and other arterials. Because the county-level NHPN evidence was compiled in 2014, these are candidates for current-route verification, not current operating claims.
- The newer statewide NHFN layer identifies Michigan I-94 as part of the Primary Highway Freight System (`NHFN_CODE=1`). This supports I-94 as the strongest evidenced freight-corridor candidate in this review.
- The datasets do not establish origin-facility access, truck restrictions, current construction, permits, transit time, drayage price, or equipment availability.

### Rail access

- The 2026 NARN county query returns Washtenaw segments associated with Ann Arbor Railroad (`AA`), Amtrak/Norfolk Southern Michigan Line (`AMTK`/`NS`), CSX Plymouth Subdivision (`CSXT`), Great Lakes Central (`GLC`), and Norfolk Southern Detroit District/Rawsonville Spur (`NS`), including recorded trackage-rights fields where present.
- Network presence does not establish that any named railroad will accept the pilot cargo, provide a suitable origin facility, quote service, interchange on a particular path, or meet schedule/capacity requirements.

### Great Lakes and nearby port candidates

- The CY2023 Principal Ports layer contains Detroit-Wayne County Port, Monroe, and Muskegon in Michigan and Toledo-Lucas County in nearby Ohio. These are research candidates only; no distance ranking or suitability decision was made.
- USACE WCSC confirms that its port datasets are annual statistical records of vessel, cargo, trip, and tonnage activity. Those records do not prove current sailing schedules, terminal capability for a specific machine, carrier acceptance, available capacity, or a commercially viable Thailand service.

### International gateway dependency

Thailand is outside the Great Lakes system. Therefore, any waterborne or intermodal concept requires an additional international gateway connection beyond the Michigan origin leg. The reviewed official datasets do not select among a Great Lakes/St. Lawrence movement, a rail/truck transfer to an Atlantic/Gulf/Pacific ocean gateway, or another multimodal pattern. Exact gateway port, transload, carrier, vessel service, border/customs sequence, and Thailand destination port remain unresolved and require current carrier, terminal, broker, and customs evidence under human approval.

## Dataset limitations

- NHPN county detail is materially older than the assessment date; use it only to seed current verification.
- The NHFN extract confirms statewide freight-network status but does not by itself prove a specific Washtenaw facility connection.
- NARN represents mapped rail infrastructure and recorded operators/rights, not service availability or commercial access.
- Principal Ports and WCSC statistics are historical annual aggregates. Tonnage is not capacity, schedule, rate, suitability, or a promise of service.
- None of the reviewed sources determines commodity classification, export control, import admissibility, duty, procurement origin, insurance, packaging, dangerous-goods status, or commercial feasibility.

## Required next human-reviewed evidence

1. Exact origin facility and machinery dimensions, weight, packaging, value, hazards, and handling constraints.
2. Product-specific Schedule B/HS review and Thailand import classification by a qualified trade/customs specialist.
3. Current road restrictions and drayage feasibility from the origin to candidate rail/port terminals.
4. Written rail, terminal, forwarder, ocean-carrier, and customs-broker service/quote evidence.
5. Destination port/facility, importer-of-record, Incoterms, insurance, export filing, import licensing, and screening decisions.

Until those items are approved, the corridor remains `RESEARCH_ONLY` and `PENDING_REVIEW`; no external write or execution is authorized.
