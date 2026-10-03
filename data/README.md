# data/

| File | What it is |
|---|---|
| `banwave.json` | Machine-readable ban wave tracker data — **generated automatically**, do not edit by hand. |

## `banwave.json`

Produced by `.github/scripts/banwave-yaz.mjs` from the platform's public tracker endpoint and committed by the `Public data sync` workflow. Field names are **English** and mirror the public endpoint.

```json
{
  "status": "ok",
  "updatedAt": "2026-10-03",
  "page": "/ban-waves",
  "summary": { "state": "quiet|in_progress", "lastStartedAt": "…", "daysAgo": 0, "last30d": 0 },
  "medianRecovery": { "hours": 0, "count": 0, "estimatedCount": 0 },
  "waves": [
    { "startedAt": "…", "endedAt": "…", "serverCount": 0, "impactPct": 0,
      "severity": "light|moderate|heavy|unknown", "estimated": false, "capped": false,
      "hours": 0, "daysAgo": 0,
      "recovery": { "state": "complete|recovered|ongoing", "hours": 0, "estimated": false } }
  ],
  "monthly": [ { "month": "2026-09", "count": 0, "highestImpactPct": 0 } ],
  "years": [ { "year": 2026, "count": 0 } ],
  "servers": [ { "server": "Multi Node Server 1", "startedAt": "…", "endedAt": "…", "impactPct": 0, "estimated": false, "capped": false,
                 "recovery": { "state": "recovered", "hours": null, "estimated": false } } ],
  "thresholds": { "severityModerate": 5, "severityHeavy": 20, "recoveryWindowDays": 14 }
}
```

**Field notes**

- `impactPct` is a **percentage** (0–100) — never an absolute account count. `null` means it could not be measured.
- `estimated: true` marks a **derived estimate**, not a measurement.
- `capped: true` means the reported bans exceeded the pool, so the measured share was clamped at 100%.
- `serverCount` is how many servers were hit in that wave; server identities are anonymised (`Multi Node Server N`).
- `recovery` describes the account pool **after** the wave. `state` is `complete` (recovery measured within the tracking window), `recovered` (the pool came back, but past the window so no duration is claimed) or `ongoing` (the pool had not returned by the last check). `hours` is the **recovery** duration — not the wave's own duration in `hours` — and is `null` whenever no duration is supported by the evidence. Both `waves[]` and `servers[]` carry this same object.
- Recovery durations longer than `thresholds.recoveryWindowDays` are reported as `recovered` rather than as a possibly-misleading number.
- `updatedAt` is **date-only** so the file does not commit on every run; the exact moment is in the live endpoint.
- `status: "unreadable"` is never written here — the sync job **keeps the previous file** in that case. If you consume this data, do the same.

**Stability:** field names mirror the platform's public endpoint and are intended to be stable. New optional fields may be added; consumers should ignore unknown fields.
