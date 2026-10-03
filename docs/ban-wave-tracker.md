# Lords Mobile Ban Wave Tracker

Lords Mobile periodically bans bot accounts in **waves**. Players usually find out afterwards, with no idea how big the wave was or how long recovery takes.

This page is generated from LordsRally's own measurements and **updated automatically** whenever the measured data changes.

> 🔄 **This file is machine-updated.** Do not edit by hand — changes are overwritten.
> Live interactive version: **[lordsrally.com/ban-waves](https://lordsrally.com/ban-waves)**

---

## Current status

<!-- BANWAVE:STATUS:START -->
**No wave in progress.** Last wave: 2026-09-30 (3 day(s) ago). Waves in the last 30 days: **2**.
**Median recovery:** 18 h across 7 measured server waves (2 estimated from logs).
<!-- BANWAVE:STATUS:END -->

---

## Recent waves

Fleet waves group servers hit at the same time. `Impact` is the share of that server's account pool affected; higher is worse.

<!-- BANWAVE:WAVES:START -->
| Date (UTC) | Servers | Impact | Severity | Duration | Recovery |
|---|---|---|---|---|---|
| 2026-09-30 | 5 | %12.4 | moderate | 2 h | — |
| 2026-09-12 | 3 | %38.9 (est.) | heavy | 6 h | — |
<!-- BANWAVE:WAVES:END -->

---

## Monthly history

<!-- BANWAVE:MONTHS:START -->
| Month | Waves | Highest impact |
|---|---|---|
| 2026-09 | 3 | %38.9 |
<!-- BANWAVE:MONTHS:END -->

---

## How to read this

| Term | Meaning |
|---|---|
| **Impact** | Share of the affected server's account pool that the wave hit, as a percentage. |
| **Severity** | Derived from impact: light (< 5%), moderate (5–20%), heavy (≥ 20%). |
| **Duration** | How long the wave lasted (first to last ban notification). |
| **Recovery** | How long it took the account pool to return to working strength. Shown as a duration only when the evidence supports it; otherwise marked as recovered without a duration. |
| **Estimated** | The value could not be measured directly and is derived from the server's usual pool — marked as an estimate. |

### Honest by design

- **No invented percentages.** Where a value could not be measured, it is marked as an estimate or left blank.
- **No absolute account counts** are published here — only shares and timing.
- **Servers are anonymised** as `Multi Node Server N`; we do not publish internal infrastructure identities.
- Recovery durations longer than the tracking window are reported as "recovered", not as a made-up number of days.

## Methodology (short)

Waves are detected from ban notifications received by the platform's own account pool. For each wave we record the pre-wave pool size and the reported bans, then follow the pool afterwards to measure recovery. The same measurement feeds the public page, so the numbers here and on [lordsrally.com/ban-waves](https://lordsrally.com/ban-waves) are produced by **one** implementation.

---

## Machine-readable

Automation consumers should use [`data/banwave.json`](../data/banwave.json) instead of parsing this page.

```json
{
  "durum": "ok",
  "guncelleme": "2026-10-03T00:00:00.000Z",
  "kart": { "durum": "sakin", "sonBasla": "...", "gunOnce": 0, "son30": 0 },
  "medyanKurtarma": { "saat": 0, "adet": 0, "tahminiAdet": 0 },
  "dalgalar": [ { "basla": "...", "bitis": "...", "sunucuSayisi": 0, "etkiYuzde": 0, "siddet": "hafif", "saat": 0, "gunOnce": 0 } ]
}
```

Field names follow the public endpoint; `durum: "okunamadi"` means the source could not be read — **keep the previous data in that case**.

<!-- BANWAVE:UPDATED -->
_Last updated: 2026-10-03T00:00:00.000Z — source: /ban-waves_
