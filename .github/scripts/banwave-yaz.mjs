/* BAN WAVE — DOCUMENT GENERATOR (GitHub Action step).
 *
 * Input : the JSON fetched from the platform's public tracker endpoint.
 * Output: three surfaces, all English, all whitelisted field by field:
 *
 *   1. `data/banwave.json`      — machine-readable (English keys)
 *   2. `docs/ban-wave-tracker.md` — human-readable tables
 *   3. `README.md`              — the `<!-- BANWAVE:README:* -->` blocks
 *
 * 🔴 SCHEMA: the endpoint's public contract is English
 *    (`status`, `updatedAt`, `waves`, `monthly`, `years`, `servers`, …). The
 *    repository may still be served by an older deployment that only speaks
 *    the legacy Turkish schema; that shape is read through a compatibility
 *    shim so the job keeps working across the cut-over. The shim is removed
 *    once the English deployment is live everywhere.
 *
 * 🔴 WHITELIST: output objects are built key by key — never spread. A new
 *    internal field added upstream cannot leak into the public repository.
 * ⚠️ No invented numbers: an unmeasured value is `null` and prints as "—".
 * ⚠️ Commit idempotency: `updatedAt` is written date-only (see lib.mjs).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { blok, damga, gun, gunSaatTr, saat, sure, SIDDET } from "./lib.mjs";

const [, , kaynak, md, json, readme] = process.argv;
if (!kaynak || !md || !json) {
  console.error("usage: banwave-yaz.mjs <data.json> <doc.md> <data.json-out> [README.md]");
  process.exit(2);
}
const ham = JSON.parse(readFileSync(kaynak, "utf8"));

/** Summary state → English ("sakin" / "suruyor" are legacy Turkish values). */
const DURUM = { sakin: "quiet", suruyor: "in_progress", quiet: "quiet", in_progress: "in_progress" };

/** Recovery state → English. The endpoint already speaks English
 *  (`complete` / `recovered` / `ongoing`); the Turkish words are the legacy
 *  vocabulary, kept so a deployment still on the older contract keeps filling
 *  the column. Unknown values fall back to `ongoing` — the conservative
 *  reading: never claim a recovery the evidence does not support. */
const KURTARMA = { complete: "complete", recovered: "recovered", ongoing: "ongoing", tamam: "complete", kurtarildi: "recovered", suruyor: "ongoing" };

/** Recovery object → whitelisted `{state, hours, estimated}`, or `null`.
 *
 *  🔴 WHY THIS EXISTS (measured 2026-10-03): the `waves` array carries recovery
 *     as an OBJECT (`{state, hours, estimated}`), while the `servers` array
 *     carries a BOOLEAN (`hasRecovery`). The generator only ever read the
 *     boolean, so on `waves` it was always `undefined` and the README/doc
 *     `Recovery` column printed `—` for every row. `hasRecovery` is kept as a
 *     fallback for `servers` and for any older deployment that only sends it.
 *  ⚠️ `hours` here is the RECOVERY duration — not the wave's own duration. */
function publicKurtarma(k) {
  if (k === null || k === undefined) return null;
  if (typeof k === "boolean") return { state: k ? "recovered" : "ongoing", minutes: null, hours: null, estimated: false };
  if (typeof k !== "object") return null;
  const state = KURTARMA[String(k.state ?? k.durum ?? "")] ?? "ongoing";
  const hamSaat = k.hours ?? k.saat;
  const hours = typeof hamSaat === "number" && Number.isFinite(hamSaat) ? hamSaat : null;
  /* Minute resolution — the site shows "5 min"; hour-only rounding said "0" and
     the cell printed blank. Fall back to hours for an older endpoint. */
  const hamDk = k.minutes ?? k.dakika;
  const minutes = typeof hamDk === "number" && Number.isFinite(hamDk) ? hamDk
    : (hours === null ? null : hours * 60);
  return { state, minutes, hours, estimated: !!(k.estimated ?? k.tahmini) };
}

/* ── compatibility shim: Turkish / hybrid schema → English shape ───────────
 * The endpoint's public contract is English, but a deployment in transition can
 * mix naming (for example English `waves` alongside Turkish `kart`). Every
 * field is therefore read English-first with a Turkish fallback, so no single
 * half-migrated key can blank a block. The shim is removed once every
 * deployment speaks English. */
function normalize(d) {
  const sev = { hafif: "light", orta: "moderate", agir: "heavy", bilinmiyor: "unknown" };
  const kart = d.summary ?? d.kart ?? null;
  const med = d.medianRecovery ?? d.medyanKurtarma ?? null;
  const th = d.thresholds ?? d.esikler ?? null;
  return {
    status: d.status ?? d.durum,
    updatedAt: d.updatedAt ?? d.guncelleme ?? null,
    page: d.page ?? d.sayfa ?? null,
    summary: kart
      ? { state: kart.state ?? kart.durum, lastStartedAt: kart.lastStartedAt ?? kart.sonBasla, lastStartedAtTr: kart.lastStartedAtTr ?? null, daysAgo: kart.daysAgo ?? kart.gunOnce, last30d: kart.last30d ?? kart.son30 }
      : null,
    medianRecovery: med
      ? { hours: med.hours ?? med.saat, count: med.count ?? med.adet, estimatedCount: med.estimatedCount ?? med.tahminiAdet }
      : null,
    waves: (d.waves ?? d.dalgalar ?? []).map((f) => ({
      startedAt: f.startedAt ?? f.basla, endedAt: f.endedAt ?? f.bitis, serverCount: f.serverCount ?? f.sunucuSayisi,
      impactPct: f.impactPct ?? f.etkiYuzde, severity: sev[f.severity ?? f.siddet] ?? f.severity ?? f.siddet ?? null,
      estimated: !!(f.estimated ?? f.tahmini), capped: !!(f.capped ?? f.kirpildi),
      hours: f.hours ?? f.saat, minutes: f.minutes ?? f.dakika, daysAgo: f.daysAgo ?? f.gunOnce,
      startedAtTr: f.startedAtTr ?? f.baslaTr ?? null, endedAtTr: f.endedAtTr ?? f.bitisTr ?? null,
      recovery: publicKurtarma(f.recovery ?? f.kurtarma ?? f.hasRecovery ?? f.kurtarmaVar),
    })),
    monthly: (d.monthly ?? d.aylik ?? []).map((a) => ({ month: a.month ?? a.ay, count: a.count ?? a.adet, highestImpactPct: a.highestImpactPct ?? a.enYuksekOran })),
    years: (d.years ?? d.yillar ?? []).map((y) => ({ year: y.year ?? y.yil, count: y.count ?? y.adet })),
    servers: (d.servers ?? d.sonSatirlar ?? []).map((s) => ({
      server: s.server ?? s.sunucu, startedAt: s.startedAt ?? s.basla, endedAt: s.endedAt ?? s.bitis,
      impactPct: s.impactPct ?? s.etkiYuzde, estimated: !!(s.estimated ?? s.tahmini), capped: !!(s.capped ?? s.kirpildi),
      minutes: s.minutes ?? s.dakika, startedAtTr: s.startedAtTr ?? s.baslaTr ?? null, endedAtTr: s.endedAtTr ?? s.bitisTr ?? null,
      /* ⚠️ OBJECT FIRST. A deployment in transition can carry both shapes at
       *  once; the boolean is the weaker statement ("a recovery moment is on
       *  record") and reading it first would report `ongoing` for a row whose
       *  own `recovery` object says `recovered`. */
      recovery: publicKurtarma(s.recovery ?? s.kurtarma ?? s.hasRecovery ?? s.kurtarmaVar),
    })),
    thresholds: th
      ? { severityModerate: th.severityModerate ?? th.siddetOrta, severityHeavy: th.severityHeavy ?? th.siddetAgir, recoveryWindowDays: th.recoveryWindowDays ?? th.kurtarmaIzlemeGun }
      : null,
  };
}
const d = normalize(ham);

/* ── whitelist copy → data/banwave.json (English, machine-readable) ──────── */
const cikti = {
  status: d.status === "ok" ? "ok" : "empty",
  updatedAt: gun(d.updatedAt),
  page: typeof d.page === "string" ? d.page : null,
  summary: d.summary && typeof d.summary === "object"
    ? { state: DURUM[String(d.summary.state ?? "")] ?? String(d.summary.state ?? ""), lastStartedAt: d.summary.lastStartedAt ?? null, lastStartedAtTr: d.summary.lastStartedAtTr ?? null, daysAgo: d.summary.daysAgo ?? null, last30d: d.summary.last30d ?? null }
    : null,
  medianRecovery: d.medianRecovery && typeof d.medianRecovery === "object"
    ? { hours: d.medianRecovery.hours ?? null, count: d.medianRecovery.count ?? null, estimatedCount: d.medianRecovery.estimatedCount ?? null }
    : null,
  waves: Array.isArray(d.waves) ? d.waves.slice(0, 120).map((f) => ({
    startedAt: f?.startedAt ?? null, endedAt: f?.endedAt ?? null, serverCount: f?.serverCount ?? null,
    impactPct: f?.impactPct ?? null, severity: f?.severity ?? null, estimated: !!f?.estimated,
    capped: !!f?.capped, hours: f?.hours ?? null, minutes: f?.minutes ?? null, daysAgo: f?.daysAgo ?? null,
    startedAtTr: f?.startedAtTr ?? null, endedAtTr: f?.endedAtTr ?? null,
    recovery: f?.recovery && typeof f.recovery === "object"
      ? { state: f.recovery.state ?? null, minutes: f.recovery.minutes ?? null, hours: f.recovery.hours ?? null, estimated: !!f.recovery.estimated }
      : null,
  })) : [],
  monthly: Array.isArray(d.monthly) ? d.monthly.slice(0, 24).map((a) => ({ month: a?.month ?? null, count: a?.count ?? null, highestImpactPct: a?.highestImpactPct ?? null })) : [],
  years: Array.isArray(d.years) ? d.years.slice(0, 10).map((y) => ({ year: y?.year ?? null, count: y?.count ?? null })) : [],
  servers: Array.isArray(d.servers) ? d.servers.slice(0, 200).map((s) => ({
    server: typeof s?.server === "string" ? s.server : null, startedAt: s?.startedAt ?? null, endedAt: s?.endedAt ?? null,
    impactPct: s?.impactPct ?? null, estimated: !!s?.estimated, capped: !!s?.capped,
    minutes: s?.minutes ?? null, startedAtTr: s?.startedAtTr ?? null, endedAtTr: s?.endedAtTr ?? null,
    recovery: s?.recovery && typeof s.recovery === "object"
      ? { state: s.recovery.state ?? null, minutes: s.recovery.minutes ?? null, hours: s.recovery.hours ?? null, estimated: !!s.recovery.estimated }
      : null,
  })) : [],
  thresholds: d.thresholds && typeof d.thresholds === "object"
    ? { severityModerate: d.thresholds.severityModerate ?? null, severityHeavy: d.thresholds.severityHeavy ?? null, recoveryWindowDays: d.thresholds.recoveryWindowDays ?? null }
    : null,
};
writeFileSync(json, JSON.stringify(cikti, null, 2) + "\n");

/* ── derived English strings ─────────────────────────────────────────────── */
const s = cikti.summary;
const durumMetni = s
  ? (s.state === "in_progress"
    ? `**A wave is in progress.** Last wave started ${gunSaatTr(s.lastStartedAt, s.lastStartedAtTr)} (${s.daysAgo ?? "?"} day(s) ago). Waves in the last 30 days: **${s.last30d ?? "—"}**.`
    : `**No wave in progress.** Last wave: ${gunSaatTr(s.lastStartedAt, s.lastStartedAtTr)} (${s.daysAgo ?? "?"} day(s) ago). Waves in the last 30 days: **${s.last30d ?? "—"}**.`)
  : "_No measurement available yet._";

const mr = cikti.medianRecovery;
const medyan = mr && typeof mr.hours === "number"
  ? `\n**Median recovery:** ${mr.hours > 0 ? `${mr.hours} h` : "under 1 h"} across ${mr.count ?? "—"} measured server waves` +
    (mr.estimatedCount ? ` (${mr.estimatedCount} estimated from logs).` : ".")
  : "";

const wavesSatir = cikti.waves.length
  ? cikti.waves.map((f) =>
      `| ${gunSaatTr(f.startedAt, f.startedAtTr)} | ${f.serverCount ?? "—"} | ${yuzdeMetni(f.impactPct)}${f.estimated ? " (est.)" : ""} | ${SIDDET[f.severity] ?? f.severity ?? "—"} | ${sureMetni(f)} | ${kurtarmaMetni(f.recovery)} |`).join("\n")
  : "| _no waves recorded_ | | | | | |";

const aySatir = cikti.monthly.length
  ? cikti.monthly.map((a) => `| ${a.month ?? "—"} | ${a.count ?? "—"} | ${yuzdeMetni(a.highestImpactPct)} |`).join("\n")
  : "| _no data_ | | |";

/* ── docs/ban-wave-tracker.md ─────────────────────────────────────────────── */
blok(md, "BANWAVE:STATUS", durumMetni + medyan);
blok(md, "BANWAVE:WAVES", wavesSatir, "| Wave start (UTC+3) | Servers | Impact | Severity | Duration | Recovery |\n|---|---|---|---|---|---|");
blok(md, "BANWAVE:MONTHS", aySatir, "| Month | Waves | Highest impact |\n|---|---|---|");
blok(md, "BANWAVE:SERVERS", serverSatir(cikti.servers), "| Server | Wave start (UTC+3) | Impact | Recovery |\n|---|---|---|---|");

const damgaSatiri = `_Last updated: ${cikti.updatedAt ?? "unknown"} — source: ${cikti.page ?? "lordsrally.com/ban-waves"}_`;
damga(md, "<!-- BANWAVE:UPDATED -->", damgaSatiri);

/* ── README.md blocks (İ2) ───────────────────────────────────────────────── */
if (readme) {
  blok(readme, "BANWAVE:README:STATUS", durumMetni + medyan);
  blok(readme, "BANWAVE:README:LATEST", enSonOzet(cikti), null);
  blok(readme, "BANWAVE:README:WAVES", wavesSatir, "| Wave start (UTC+3) | Servers | Impact | Severity | Duration | Recovery |\n|---|---|---|---|---|---|");
  blok(readme, "BANWAVE:README:MONTHS", aySatir, "| Month | Waves | Highest impact |\n|---|---|---|");
  damga(readme, "<!-- BANWAVE:README:UPDATED -->", damgaSatiri);
}

console.log(`written: ${json} (${cikti.waves.length} waves) + ${md}${readme ? " + " + readme : ""}`);

/* ── helpers ─────────────────────────────────────────────────────────────── */
/** Recovery cell. A MEASURED duration is spelled out — the user's report was
 *  that the column looked empty ("recovered kısımları boş gibi"), and a bare
 *  state word next to a `—` Duration column reads as missing data. When the
 *  evidence gives no duration (`recovered` past the tracking window) the state
 *  word stands alone — that is the honest form, not a blank.
 *  ⚠️ Never a made-up number: an absent/zero duration prints bare. */
function kurtarmaMetni(r) {
  if (!r || typeof r.state !== "string") return "—";
  /* Prefer MINUTES — that is the resolution the site shows. Fall back to hours
     only for an endpoint that has not yet been deployed with `minutes`. */
  const dk = typeof r.minutes === "number" && Number.isFinite(r.minutes) ? r.minutes : null;
  if (dk !== null) return `${r.state} (${sure(dk)}${r.estimated ? ", est." : ""})`;
  /* ⚠️ FALLBACK only — an endpoint that has not yet been deployed with `minutes`.
     `hours` is ROUNDED, so `hours === 0` means "somewhere under an hour", NOT
     "an instant". Printing "1 min" here would be invented precision (it could
     have been 25 minutes); the honest rendering is "under 1 h" — the same
     wording the site uses for its median. */
  const h = typeof r.hours === "number" && Number.isFinite(r.hours) ? r.hours : null;
  if (h === null) return r.state;
  return `${r.state} (${h > 0 ? `${h} h` : "under 1 h"})`;
}

/** Wave duration cell for a row that may only carry the rounded `hours`. */
function sureMetni(f) {
  if (typeof f?.minutes === "number" && Number.isFinite(f.minutes)) return sure(f.minutes);
  const h = typeof f?.hours === "number" && Number.isFinite(f.hours) ? f.hours : null;
  if (h === null) return "—";
  return h > 0 ? `${h} h` : "under 1 h";
}

function yuzdeMetni(v) {
  return typeof v === "number" && Number.isFinite(v) ? `${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}%` : "—";
}
function serverSatir(sunucular) {
  return sunucular.length
    ? sunucular.map((x) => `| ${x.server ?? "—"} | ${gunSaatTr(x.startedAt, x.startedAtTr)} | ${yuzdeMetni(x.impactPct)}${x.estimated ? " (est.)" : ""} | ${kurtarmaMetni(x.recovery)} |`).join("\n")
    : "| _no server data_ | | | |";
}
function enSonOzet(c) {
  const son = c.waves[0];
  if (!son) return "_No waves recorded yet._";
  return [
    `| Field | Value |`,
    `|---|---|`,
    `| Last wave | ${gunSaatTr(son.startedAt, son.startedAtTr)} |`,
    `| Wave ended | ${son.endedAt ? gunSaatTr(son.endedAt, son.endedAtTr) : "—"} |`,
    `| Days ago | ${son.daysAgo ?? "—"} |`,
    `| Servers hit | ${son.serverCount ?? "—"} |`,
    `| Impact | ${yuzdeMetni(son.impactPct)}${son.estimated ? " (estimated)" : ""} |`,
    `| Severity | ${SIDDET[son.severity] ?? son.severity ?? "—"} |`,
    `| Duration | ${saat(son.hours)} |`,
    /* The user's report was that recovery looked missing — the at-a-glance box
       must state it too, not only the history table below. */
    `| Recovery | ${kurtarmaMetni(son.recovery)} |`,
    ``,
    `Full history and the live heatmap: **[lordsrally.com/ban-waves](https://lordsrally.com/ban-waves)**.`,
  ].join("\n");
}
