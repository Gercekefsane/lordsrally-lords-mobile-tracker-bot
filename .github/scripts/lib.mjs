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

export const saat = (h) =>
  typeof h === "number" && Number.isFinite(h) && h > 0 ? `${h} h` : "—";

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
