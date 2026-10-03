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
import { blok, damga, gun, saat, SIDDET } from "./lib.mjs";

const [, , kaynak, md, json, readme] = process.argv;
if (!kaynak || !md || !json) {
  console.error("usage: banwave-yaz.mjs <data.json> <doc.md> <data.json-out> [README.md]");
  process.exit(2);
}
const ham = JSON.parse(readFileSync(kaynak, "utf8"));

/** Summary state → English ("sakin" / "suruyor" are legacy Turkish values). */
const DURUM = { sakin: "quiet", suruyor: "in_progress", quiet: "quiet", in_progress: "in_progress" };

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
      ? { state: kart.state ?? kart.durum, lastStartedAt: kart.lastStartedAt ?? kart.sonBasla, daysAgo: kart.daysAgo ?? kart.gunOnce, last30d: kart.last30d ?? kart.son30 }
      : null,
    medianRecovery: med
      ? { hours: med.hours ?? med.saat, count: med.count ?? med.adet, estimatedCount: med.estimatedCount ?? med.tahminiAdet }
      : null,
    waves: (d.waves ?? d.dalgalar ?? []).map((f) => ({
      startedAt: f.startedAt ?? f.basla, endedAt: f.endedAt ?? f.bitis, serverCount: f.serverCount ?? f.sunucuSayisi,
      impactPct: f.impactPct ?? f.etkiYuzde, severity: sev[f.severity ?? f.siddet] ?? f.severity ?? f.siddet ?? null,
      estimated: !!(f.estimated ?? f.tahmini), capped: !!(f.capped ?? f.kirpildi),
      hours: f.hours ?? f.saat, daysAgo: f.daysAgo ?? f.gunOnce, hasRecovery: f.hasRecovery ?? null,
    })),
    monthly: (d.monthly ?? d.aylik ?? []).map((a) => ({ month: a.month ?? a.ay, count: a.count ?? a.adet, highestImpactPct: a.highestImpactPct ?? a.enYuksekOran })),
    years: (d.years ?? d.yillar ?? []).map((y) => ({ year: y.year ?? y.yil, count: y.count ?? y.adet })),
    servers: (d.servers ?? d.sonSatirlar ?? []).map((s) => ({
      server: s.server ?? s.sunucu, startedAt: s.startedAt ?? s.basla, endedAt: s.endedAt ?? s.bitis,
      impactPct: s.impactPct ?? s.etkiYuzde, estimated: !!(s.estimated ?? s.tahmini), capped: !!(s.capped ?? s.kirpildi),
      hasRecovery: s.hasRecovery ?? s.kurtarmaVar ?? null,
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
    ? { state: DURUM[String(d.summary.state ?? "")] ?? String(d.summary.state ?? ""), lastStartedAt: d.summary.lastStartedAt ?? null, daysAgo: d.summary.daysAgo ?? null, last30d: d.summary.last30d ?? null }
    : null,
  medianRecovery: d.medianRecovery && typeof d.medianRecovery === "object"
    ? { hours: d.medianRecovery.hours ?? null, count: d.medianRecovery.count ?? null, estimatedCount: d.medianRecovery.estimatedCount ?? null }
    : null,
  waves: Array.isArray(d.waves) ? d.waves.slice(0, 120).map((f) => ({
    startedAt: f?.startedAt ?? null, endedAt: f?.endedAt ?? null, serverCount: f?.serverCount ?? null,
    impactPct: f?.impactPct ?? null, severity: f?.severity ?? null, estimated: !!f?.estimated,
    capped: !!f?.capped, hours: f?.hours ?? null, daysAgo: f?.daysAgo ?? null, hasRecovery: f?.hasRecovery ?? null,
  })) : [],
  monthly: Array.isArray(d.monthly) ? d.monthly.slice(0, 24).map((a) => ({ month: a?.month ?? null, count: a?.count ?? null, highestImpactPct: a?.highestImpactPct ?? null })) : [],
  years: Array.isArray(d.years) ? d.years.slice(0, 10).map((y) => ({ year: y?.year ?? null, count: y?.count ?? null })) : [],
  servers: Array.isArray(d.servers) ? d.servers.slice(0, 200).map((s) => ({
    server: typeof s?.server === "string" ? s.server : null, startedAt: s?.startedAt ?? null, endedAt: s?.endedAt ?? null,
    impactPct: s?.impactPct ?? null, estimated: !!s?.estimated, capped: !!s?.capped, hasRecovery: s?.hasRecovery ?? null,
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
    ? `**A wave is in progress.** Last wave started ${gun(s.lastStartedAt)} (${s.daysAgo ?? "?"} day(s) ago). Waves in the last 30 days: **${s.last30d ?? "—"}**.`
    : `**No wave in progress.** Last wave: ${gun(s.lastStartedAt)} (${s.daysAgo ?? "?"} day(s) ago). Waves in the last 30 days: **${s.last30d ?? "—"}**.`)
  : "_No measurement available yet._";

const mr = cikti.medianRecovery;
const medyan = mr && typeof mr.hours === "number"
  ? `\n**Median recovery:** ${mr.hours > 0 ? `${mr.hours} h` : "under 1 h"} across ${mr.count ?? "—"} measured server waves` +
    (mr.estimatedCount ? ` (${mr.estimatedCount} estimated from logs).` : ".")
  : "";

const wavesSatir = cikti.waves.length
  ? cikti.waves.map((f) =>
      `| ${gun(f.startedAt)} | ${f.serverCount ?? "—"} | ${yuzdeMetni(f.impactPct)}${f.estimated ? " (est.)" : ""} | ${SIDDET[f.severity] ?? f.severity ?? "—"} | ${saat(f.hours)} | ${f.hasRecovery === true ? "recovered" : f.hasRecovery === false ? "ongoing" : "—"} |`).join("\n")
  : "| _no waves recorded_ | | | | | |";

const aySatir = cikti.monthly.length
  ? cikti.monthly.map((a) => `| ${a.month ?? "—"} | ${a.count ?? "—"} | ${yuzdeMetni(a.highestImpactPct)} |`).join("\n")
  : "| _no data_ | | |";

/* ── docs/ban-wave-tracker.md ─────────────────────────────────────────────── */
blok(md, "BANWAVE:STATUS", durumMetni + medyan);
blok(md, "BANWAVE:WAVES", wavesSatir, "| Date (UTC) | Servers | Impact | Severity | Duration | Recovery |\n|---|---|---|---|---|---|");
blok(md, "BANWAVE:MONTHS", aySatir, "| Month | Waves | Highest impact |\n|---|---|---|");
blok(md, "BANWAVE:SERVERS", serverSatir(cikti.servers), "| Server | Date (UTC) | Impact | Recovery |\n|---|---|---|---|");

const damgaSatiri = `_Last updated: ${cikti.updatedAt ?? "unknown"} — source: ${cikti.page ?? "lordsrally.com/ban-waves"}_`;
damga(md, "<!-- BANWAVE:UPDATED -->", damgaSatiri);

/* ── README.md blocks (İ2) ───────────────────────────────────────────────── */
if (readme) {
  blok(readme, "BANWAVE:README:STATUS", durumMetni + medyan);
  blok(readme, "BANWAVE:README:LATEST", enSonOzet(cikti), null);
  blok(readme, "BANWAVE:README:WAVES", wavesSatir, "| Date (UTC) | Servers | Impact | Severity | Duration | Recovery |\n|---|---|---|---|---|---|");
  blok(readme, "BANWAVE:README:MONTHS", aySatir, "| Month | Waves | Highest impact |\n|---|---|---|");
  damga(readme, "<!-- BANWAVE:README:UPDATED -->", damgaSatiri);
}

console.log(`written: ${json} (${cikti.waves.length} waves) + ${md}${readme ? " + " + readme : ""}`);

/* ── helpers ─────────────────────────────────────────────────────────────── */
function yuzdeMetni(v) {
  return typeof v === "number" && Number.isFinite(v) ? `${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}%` : "—";
}
function serverSatir(sunucular) {
  return sunucular.length
    ? sunucular.map((x) => `| ${x.server ?? "—"} | ${gun(x.startedAt)} | ${yuzdeMetni(x.impactPct)}${x.estimated ? " (est.)" : ""} | ${x.hasRecovery === true ? "recovered" : x.hasRecovery === false ? "ongoing" : "—"} |`).join("\n")
    : "| _no server data_ | | | |";
}
function enSonOzet(c) {
  const son = c.waves[0];
  if (!son) return "_No waves recorded yet._";
  return [
    `| Field | Value |`,
    `|---|---|`,
    `| Last wave (UTC) | ${gun(son.startedAt)} |`,
    `| Days ago | ${son.daysAgo ?? "—"} |`,
    `| Servers hit | ${son.serverCount ?? "—"} |`,
    `| Impact | ${yuzdeMetni(son.impactPct)}${son.estimated ? " (estimated)" : ""} |`,
    `| Severity | ${SIDDET[son.severity] ?? son.severity ?? "—"} |`,
    `| Duration | ${saat(son.hours)} |`,
    ``,
    `Full history and the live heatmap: **[lordsrally.com/ban-waves](https://lordsrally.com/ban-waves)**.`,
  ].join("\n");
}
