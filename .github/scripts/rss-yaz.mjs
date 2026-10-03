/* RSS PRICING — DOCUMENT GENERATOR (GitHub Action step).
 *
 * Source : `/prices/rss` (public, sell-only). Writes `docs/rss-pricing.md`.
 *
 * 🔴 COST IS NEVER PUBLISHED. The endpoint exposes only the sell price
 *    (`priceUsd`) plus public product/zone labels; this generator reads only
 *    those. Internal product/zone identifiers never reach the output.
 * ⚠️ No invented numbers: a missing price prints as "—".
 * ⚠️ Commit idempotency: `updatedAt` is written date-only.
 */
import { existsSync, readFileSync } from "node:fs";
import { blok, damga, gun, para } from "./lib.mjs";

const [, , kaynak, md] = process.argv;
if (!kaynak || !md) {
  console.error("usage: rss-yaz.mjs <data.json> <docs/rss-pricing.md>");
  process.exit(2);
}
if (!existsSync(kaynak)) {
  console.log(`no input (${kaynak}) — ${md} preserved`);
  process.exit(0);
}
const d = JSON.parse(readFileSync(kaynak, "utf8"));

const urunler = (Array.isArray(d.products) ? d.products : []).map((p) => ({
  names: p?.names && typeof p.names === "object" ? p.names : null,
  zones: p?.zones && typeof p.zones === "object" ? p.zones : null,
  kingdomMin: p?.kingdomMin ?? null,
  kingdomMax: p?.kingdomMax ?? null,
  priceUsd: p?.priceUsd ?? null,
}));

const satir = urunler.length
  ? urunler.map((u) => {
      const kb = u.kingdomMin != null && u.kingdomMax != null ? (u.kingdomMin === u.kingdomMax ? `K${u.kingdomMin}` : `K${u.kingdomMin}–K${u.kingdomMax}`) : "—";
      return `| ${ad(u.names)} | ${ad(u.zones)} | ${kb} | ${para(u.priceUsd)} |`;
    }).join("\n")
  : "| _no products available_ | | | |";

const durum = d.salesOpen === true
  ? "**Sales are currently open.**"
  : "**Sales are currently closed.** The endpoint shows availability live — order at [lordsrally.com/rss](https://lordsrally.com/rss).";

blok(md, "RSS:TABLE", satir, "| Product | Zone | Kingdoms | Sell price |\n|---|---|---|---|");
blok(md, "RSS:STATUS", `${durum}\n`);

damga(md, "<!-- RSS:UPDATED -->", `_Last updated: ${gun(d.updatedAt)} — sell prices in ${d.currency ?? "USD"}. Always live at **https://lordsrally.com/rss**._`);
console.log(`written: ${md} (${urunler.length} products)`);

function ad(names) {
  if (!names || typeof names !== "object") return "—";
  return String(names.en ?? Object.values(names)[0] ?? "—");
}
