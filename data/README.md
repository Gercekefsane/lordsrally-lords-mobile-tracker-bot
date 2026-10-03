# data/

| File | What it is |
|---|---|
| `banwave.json` | Machine-readable ban wave tracker data — **generated automatically**, do not edit by hand. |

## `banwave.json`

Produced by `.github/scripts/banwave-yaz.mjs` from the platform's public data endpoint and committed by the `Ban wave tracker sync` workflow.

```json
{
  "durum": "ok",
  "guncelleme": "2026-10-03T00:00:00.000Z",
  "sayfa": "/ban-waves",
  "kart": { "durum": "sakin", "sonBasla": "…", "gunOnce": 0, "son30": 0 },
  "medyanKurtarma": { "saat": 0, "adet": 0, "tahminiAdet": 0 },
  "dalgalar": [
    { "basla": "…", "bitis": "…", "sunucuSayisi": 0, "etkiYuzde": 0,
      "siddet": "hafif|orta|agir|bilinmiyor", "tahmini": false, "saat": 0, "gunOnce": 0 }
  ],
  "aylik": [ { "ay": "2026-09", "adet": 0, "enYuksekOran": 0 } ],
  "yillar": [ { "yil": 2026, "adet": 0 } ]
}
```

**Field notes**

- `etkiYuzde` is a **percentage** (0–100) — never an absolute account count. `null` means it could not be measured.
- `tahmini: true` marks a **derived estimate**, not a measurement.
- `sunucuSayisi` is how many servers were hit in that wave; server identities are anonymised (`Multi Node Server N`).
- `durum: "okunamadi"` is not written here — the sync job **keeps the previous file** in that case. If you consume this data, do the same.

**Stability:** field names mirror the platform's public endpoint and are intended to be stable. New optional fields may be added; consumers should ignore unknown fields.
