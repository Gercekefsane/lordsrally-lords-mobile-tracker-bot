/* Shared helpers for the public-data generators.
 *
 * Marker blocks: markdown files carry `<!-- NAMESPACE:BLOCK:START -->` …
 * `<!-- NAMESPACE:BLOCK:END -->`; only the text between the markers is
 * rewritten, the surrounding prose is never touched.
 *
 * 🔴 WHITELIST DISCIPLINE: every generator builds its output object field by
 *    field. Nothing is spread from the source. If an internal field is ever
 *    added upstream it cannot leak here by accident.
 * ⚠️ Commit idempotency: committed timestamps are DATE-ONLY (`YYYY-MM-DD`).
 *    The source endpoints stamp `updatedAt` at request time; writing the full
 *    ISO string would commit every hour. Consumers who need the exact moment
 *    read the endpoint directly.
 */
import { readFileSync, writeFileSync } from "node:fs";

/** Percentage with one decimal below 10, integer above (matches the site). */
export const yuzde = (v) =>
  typeof v === "number" && Number.isFinite(v) ? `${v}%` : "—";

/** ISO timestamp → "YYYY-MM-DD" (date only — see idempotency note). */
export const gun = (iso) =>
  typeof iso === "string" && iso.length >= 10 ? iso.slice(0, 10) : "—";

/** ISO timestamp → "YYYY-MM-DD HH:MM" in Türkiye time (UTC+3).
 *
 *  🔴 WHY (measured 2026-10-03, user request): date-only said *when* in days but
 *     not *at what hour* — "2026-09-30 11:38 (UTC+3)" is what the site shows.
 *  ⚠️ SAFE FOR COMMIT IDEMPOTENCY: only `updatedAt` is stamped at request time;
 *     a wave's `startedAt`/`endedAt` are fixed records, so a minute-resolution
 *     rendering cannot churn the repository on every run.
 *  ⚠️ Türkiye has been fixed at UTC+3 since 2016 (no DST) → plain arithmetic, no
 *     `Intl`. The site does exactly this (`lib/banDalgasi.turkiyeParcalari`); both
 *     surfaces share the same arithmetic so they cannot disagree.
 *  ⚠️ The offset is LABELLED — an unlabelled local time invites the reader to
 *     assume their own timezone. */
export const gunSaat = (iso) => {
  const t = typeof iso === "string" ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(t)) return "—";
  return isoTr(new Date(t + 3 * 3600000));
};

/** Türkiye-local ISO string from the source, when the endpoint supplies one
 *  (`startedAtTr`). Falls back to deriving it from the UTC value. */
export const gunSaatTr = (iso, isoTrDegeri) =>
  typeof isoTrDegeri === "string" && isoTrDegeri.length > 0 ? isoTrDegeri : gunSaat(iso);

const isoTr = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} (+03:00)`;
};

export const saat = (h) =>
  typeof h === "number" && Number.isFinite(h) && h > 0 ? `${h} h` : "—";

/** Duration at MINUTE resolution, matching the platform's own formatter.
 *
 *  🔴 WHY (measured 2026-10-03): hour-only rounding made a 47-minute wave print
 *     "1 h" and a 5-minute recovery print "0" — which then read as "unmeasured"
 *     and blanked the cell. The site showed "5 min"; the repository showed "—".
 *     The user spotted the mismatch.
 *  Rules taken from the site's `sureMetni` so the two surfaces cannot drift:
 *    - the smallest unit is a MINUTE (`Math.max(1, …)`), so a 20-second recovery
 *      never prints "0 min";
 *    - at most two units are shown ("1 h 5 min", "2 d 3 h", "45 min").
 *  ⚠️ `minutes: 0` is a REAL value (a wave that began and ended in the same
 *     instant). Only `null`/`undefined` means "not measured" and prints "—". */
export const sure = (dakika) => {
  if (typeof dakika !== "number" || !Number.isFinite(dakika)) return "—";
  const d = Math.max(1, Math.round(dakika));
  const gun = Math.floor(d / 1440);
  const sa = Math.floor((d % 1440) / 60);
  const dk = d % 60;
  if (gun) return sa ? `${gun} d ${sa} h` : `${gun} d`;
  if (sa) return dk ? `${sa} h ${dk} min` : `${sa} h`;
  return `${dk} min`;
};

export const para = (v) =>
  typeof v === "number" && Number.isFinite(v)
    ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

/** Internal severity vocabulary → public English labels. */
export const SIDDET = { hafif: "light", orta: "moderate", agir: "heavy", bilinmiyor: "unknown" };

/** Rewrite the block `NAMESPACE:BLOCK` inside `file`. Throws if a marker is
 *  missing so a malformed document fails loudly instead of being skipped. */
export function blok(file, ad, icerik, tabloBasligi) {
  let metin = readFileSync(file, "utf8");
  const bas = `<!-- ${ad}:START -->`;
  const son = `<!-- ${ad}:END -->`;
  const i = metin.indexOf(bas);
  const j = metin.indexOf(son);
  if (i < 0 || j < 0) throw new Error(`marker not found: ${ad} in ${file}`);
  metin =
    metin.slice(0, i + bas.length) +
    "\n" +
    (tabloBasligi ? tabloBasligi + "\n" : "") +
    icerik +
    "\n" +
    metin.slice(j);
  writeFileSync(file, metin);
}

/* Whitelist discipline lives in each generator: every output object is built
 * key by key, so a new upstream field cannot leak by accident. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Update a single-line "last updated" stamp attached to `marker`.
 *  ⚠️ Bounded to the one stamped line — a marker that is NOT the last thing in
 *  the file (README keeps several) must never wipe the text below it. */
export function damga(file, marker, satir) {
  const satirTrim = satir.trim();
  let metin = readFileSync(file, "utf8");
  const re = new RegExp(escapeRe(marker) + "\\n_Last updated:[^\\n]*_");
  if (re.test(metin)) {
    metin = metin.replace(re, marker + "\n" + satirTrim);
  } else if (metin.includes(marker)) {
    metin = metin.replace(marker, marker + "\n" + satirTrim);
  } else {
    metin = metin.trimEnd() + "\n\n" + marker + "\n" + satirTrim + "\n";
  }
  writeFileSync(file, metin);
}
