> Historical note: this document still contains Unity-era planning/reference material. It is not the primary source of truth for the current web prototype unless and until it is rewritten. Prefer `README.md`, `BUILD.md`, `docs/Technical_Architecture.md`, `docs/Complete_Game_Development_Checklist.md`, `docs/web-release-checklist.md`, and `KNOWN_ISSUES.md` for current status.

# REDLINE FC — Asset Register Template

Use this document to track every externally sourced character model or animation before it enters production.

## License Review Rule
Do not use any downloaded asset in production until the following fields are completed and a human has confirmed the source page.

## Required Fields Per Asset
- Asset ID
- Asset Name
- Source Site
- Source URL
- Author / Publisher
- Date Checked
- License Type
- Commercial Use Allowed
- Attribution Required
- Redistribution Restrictions
- Modification Allowed
- Download Method
- Original Format
- Target Unity Format
- Rig Type
- Retargeting Needed
- Style Notes
- Intended Character Slot
- Risk Notes
- Final Approval Status
- Screenshot Evidence Stored

## Example Table
| Asset ID | Asset Name | Source Site | Source URL | License Type | Commercial Use Allowed | Attribution Required | Intended Character Slot | Approval Status |
|---|---|---|---|---|---|---|---|---|
| CHAR_001 | Example Character | Mixamo | paste-link-here | Verify current terms | Pending | Pending | Street Striker | Pending |

## Recommended Candidate Source Types
### Mixamo
Use for:
- broad humanoid variety
- easy rigging and retargeting
- rapid prototype roster building

Manual checks required:
- current commercial use terms
- redistribution limitations

### Unity Asset Store (Free)
Use for:
- stylized or toon characters
- Unity-ready prefabs and materials
- fast prototyping

Manual checks required:
- current asset store standard license applicability
- author-specific restrictions if any are listed

### OpenGameArt
Use only when:
- license is clearly CC0 or another permissive commercial-use-safe license
- attribution requirements are understood and documented

Avoid for MVP if license is unclear or share-alike obligations are undesirable.

### Sketchfab
Use only when:
- license is explicitly commercial-use safe
- the downloadable asset is permitted for game use
- editorial / non-commercial restrictions are absent

## Recommended Roster Planning Sheet
Track at least 12 unique final character slots:
1. Street Striker
2. Bruiser Defender
3. Nimble Playmaker
4. Flash Winger
5. Veteran Enforcer
6. Midfield Engine
7. Masked Trickster
8. Power Finisher
9. Acrobat
10. Punk Speedster
11. Elegant Captain
12. Wildcard Brawler

## Art Unification Checklist
Before final import, confirm:
- scale normalized
- humanoid rig compatibility checked
- material style aligned
- shader stack unified
- texture contrast aligned
- team marker readability preserved
- silhouette distinct from other roster members

## Approval Workflow
1. Find candidate asset
2. Capture source URL and page screenshot
3. Record license terms
4. Validate commercial-use safety
5. Import into sandbox scene
6. Check rig and retarget viability
7. Review silhouette readability in gameplay camera
8. Approve or reject
