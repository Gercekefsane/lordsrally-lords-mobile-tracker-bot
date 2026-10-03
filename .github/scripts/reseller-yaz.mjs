/* RESELLER (SALESMAN) — DOCUMENT GENERATOR (GitHub Action step).
 *
 * Source : `/prices/reseller` (public). Writes `docs/reseller.md`.
 *
 * 🔴 MARGIN IS NEVER PUBLISHED. The endpoint exposes the *customer* price and
 *    the reseller's own commission percentage — both already shown publicly on
 *    /salesman. The platform's own cost/margin rules are never read. This
 *    generator has no notion of cost.
 * ⚠️ No invented numbers: a missing value prints as "—".
 * ⚠️ Commit idempotency: `updatedAt` is written date-only.
 */
import { existsSync, readFileSync } from "node:fs";
import { blok, damga, gun, para, yuzde } from "./lib.mjs";

const [, , kaynak, md, readme] = process.argv;
if (!kaynak || !md) {
  console.error("usage: reseller-yaz.mjs <data.json> <docs/reseller.md> [README.md]");
  process.exit(2);
}
if (!existsSync(kaynak)) {
  console.log(`no input (${kaynak}) — ${md} preserved`);
  process.exit(0);
}
const d = JSON.parse(readFileSync(kaynak, "utf8"));

const paketler = (Array.isArray(d.packages) ? d.packages : []).map((p) => ({
  name: String(p?.name ?? ""),
  tiers: (Array.isArray(p?.tiers) ? p.tiers : []).map((t) => ({
    months: t?.months ?? null, days: t?.days ?? null, displayName: t?.displayName ?? null,
    customerPriceUsd: t?.customerPriceUsd ?? null, commissionPct: t?.commissionPct ?? null,
  })),
}));

/* Some tier labels are still Turkish in the product data; the public document
 * is English, so known labels are mapped (unknown labels pass through). */
const TERIM = { "KVK Versiyon": "KVK edition", "Versiyon": "Edition" };
const terim = (s) => TERIM[s] ?? s;

let tablo = "| Package | Term | Customer price | Your commission |\n|---|---|---|---|\n";
let satirSayisi = 0;
for (const p of paketler) {
  for (const t of p.tiers) {
    const sure = t.displayName != null ? terim(String(t.displayName)) : t.months != null ? `${t.months} mo` : t.days != null ? `${t.days} days` : "—";
    tablo += `| ${p.name || "—"} | ${sure} | ${para(t.customerPriceUsd)} | ${yuzde(t.commissionPct)} |\n`;
    satirSayisi++;
  }
}
if (!satirSayisi) tablo = "| _no reseller packages available_ | | | |\n";

const seviye = d.level && typeof d.level === "object" && d.level.name
  ? `New resellers start at the **${String(d.level.name)}** level. The tier system is currently **${d.tierSystemOn === true ? "on" : "off"}**; commission follows the level shown on **[lordsrally.com/salesman](https://lordsrally.com/salesman)**.`
  : `Commission follows the level shown on **[lordsrally.com/salesman](https://lordsrally.com/salesman)**.`;

blok(md, "RESELLER:TABLE", tablo);
blok(md, "RESELLER:LEVEL", seviye + "\n");

const i = `_Last updated: ${gun(d.updatedAt)} — customer prices are ${d.currency ?? "USD"}. Your current commission is always live at **https://lordsrally.com/salesman**._`;
damga(md, "<!-- RESELLER:UPDATED -->", i);

/* README block — compact: data package row + commission note. */
if (readme) {
  const ornek = paketler.find((p) => p.tiers.length);
  const ornekSatir = ornek ? `| ${ornek.name || "—"} | ${ornek.tiers[0].months != null ? ornek.tiers[0].months + " mo" : "—"} | ${para(ornek.tiers[0].customerPriceUsd)} | ${yuzde(ornek.tiers[0].commissionPct)} |` : "| _no data_ | | | |";
  blok(readme, "RESELLER:README:TABLE", "| Package | Term | Customer price | Your commission |\n|---|---|---|---|\n" + ornekSatir + "\n\nSee the full table in [`docs/reseller.md`](docs/reseller.md).");
  blok(readme, "RESELLER:README:LEVEL", seviye + "\n");
  damga(readme, "<!-- RESELLER:README:UPDATED -->", i);
}
console.log(`written: ${md} (${satirSayisi} tiers)${readme ? " + " + readme : ""}`);
