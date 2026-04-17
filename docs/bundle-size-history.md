# REDLINE FC Web — Bundle Size History

Purpose: lightweight tracking of production bundle growth over time.

| Timestamp (local) | JS asset | JS gzip | CSS asset | CSS gzip | Notes |
|---|---:|---:|---:|---:|---|
| 2026-04-17 11:42 | 546.63 kB | 140.00 kB | 7.92 kB | 2.26 kB | Solo team-control + docs sync pass |
| 2026-04-17 11:51 | 548.91 kB | 140.60 kB | 8.92 kB | 2.45 kB | Added pause overlay flow + quick controls + vuvuzela warning |

## Threshold notes (prototype)
- Soft watch threshold: JS gzip > 170 kB
- Hard action threshold: JS gzip > 220 kB

Current status: within soft threshold.
