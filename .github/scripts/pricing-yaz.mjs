/* PRICING — DOCUMENT GENERATOR (GitHub Action step).
 *
 * Source : `/prices/data` (public, sell-only). Writes `docs/pricing.md`.
 *
 * 🔴 COST IS NEVER PUBLISHED. This generator has no notion of cost: it reads
 *    only the whitelisted sell fields the endpoint exposes (package names,
 *    speeds, sell prices, campaign, add-on sell prices, credit sell prices).
 *    Margin/cost fields do not exist on the input, so they cannot reach the
 *    output — this is enforced by the endpoint as well as here.
 * ⚠️ No invented numbers: a `null` price prints as "—".
 * ⚠️ Commit idempotency: `updatedAt` is written date-only.
 */
import { existsSync, readFileSync } from "node:fs";
import { blok, damga, gun, para } from "./lib.mjs";

const [, , kaynak, md, readme] = process.argv;
if (!kaynak || !md) {
  console.error("usage: pricing-yaz.mjs <data.json> <docs/pricing.md> [README.md]");
  process.exit(2);
}
/* No input file means the fetch step already reported why (not deployed yet or
 * failed); the document is preserved and there is nothing to regenerate. */
if (!existsSync(kaynak)) {
  console.log(`no input (${kaynak}) — ${md} preserved`);
  process.exit(0);
}
const d = JSON.parse(readFileSync(kaynak, "utf8"));

/* whitelisted copies (nothing spread) */
const paketler = (Array.isArray(d.packages) ? d.packages : []).map((p) => ({
  name: String(p?.name ?? ""),
  speedMinSec: p?.speedMinSec ?? null,
  speedMaxSec: p?.speedMaxSec ?? null,
  tiers: (Array.isArray(p?.tiers) ? p.tiers : []).map((t) => ({
    months: t?.months ?? null, days: t?.days ?? null,
    pricePerMonthUsd: t?.pricePerMonthUsd ?? null, totalUsd: t?.totalUsd ?? null,
  })),
}));
const eklentiler = (Array.isArray(d.addons) ? d.addons : []).map((a) => ({
  names: a?.names && typeof a.names === "object" ? a.names : null,
  pricePerMonthUsd: a?.pricePerMonthUsd ?? null,
}));
const krediler = d.credits && typeof d.credits === "object" ? d.credits : null;
const kredipaket = krediler && Array.isArray(krediler.packages) ? krediler.packages.map((c) => ({
  name: String(c?.name ?? ""), credits: c?.credits ?? null, priceUsd: c?.priceUsd ?? null,
  validityDays: c?.validityDays ?? null, pricePer1000CreditsUsd: c?.pricePer1000CreditsUsd ?? null,
})) : [];
const kredikategori = krediler && Array.isArray(krediler.categories) ? krediler.categories.map((c) => ({
  key: String(c?.key ?? ""), names: c?.names && typeof c.names === "object" ? c.names : null, creditsPerMessage: c?.creditsPerMessage ?? null,
})) : [];

/* ── build document blocks ───────────────────────────────────────────────── */
const idamga = `_Last updated: ${gun(d.updatedAt)} — prices are always live on **https://lordsrally.com/buynow** with **${d.currency ?? "USD"}** amounts below._\n`;

let ozet = "| Package | Detection speed | Sell price (per month) |\n|---|---|---|\n";
if (paketler.length) {
  for (const p of paketler) {
    const ay = p.tiers.find((t) => t.months === 1) ?? p.tiers[0];
    const hiz = p.speedMinSec != null && p.speedMaxSec != null ? `${p.speedMinSec}–${p.speedMaxSec} s` : "—";
    ozet += `| **${p.name || "—"}** | ${hiz} | ${para(ay?.pricePerMonthUsd)} |\n`;
  }
} else {
  ozet += "| _no packages_ | | |\n";
}

let tier = "| Package | Term | Sell price | Per month |\n|---|---|---|---|\n";
if (paketler.length) {
  for (const p of paketler) {
    if (!p.tiers.length) { tier += `| ${p.name || "—"} | — | — | — |\n`; continue; }
    for (const t of p.tiers) {
      const sure = t.months != null ? `${t.months} mo` : t.days != null ? `${t.days} days` : "—";
      tier += `| ${p.name || "—"} | ${sure} | ${para(t.totalUsd)} | ${para(t.pricePerMonthUsd)} |\n`;
    }
  }
} else {
  tier += "| _no packages_ | | | |\n";
}

let eklenti = "| Add-on | Sell price per month |\n|---|---|\n";
if (eklentiler.length) {
  for (const a of eklentiler) eklenti += `| ${ad(a.names, "en")} | ${para(a.pricePerMonthUsd)} |\n`;
} else {
  eklenti += "| _no add-ons sold_ | |\n";
}

let kampanya = "—";
if (d.campaign && typeof d.campaign === "object") {
  kampanya = `**${String(d.campaign.name ?? "Campaign")}** — ${para(d.campaign.priceUsd)} beyond the term end ${gun(d.campaign.endsAt)}.`;
}

let kredi = "| Credit package | Credits | Sell price | Validity | Price per 1,000 credits |\n|---|---|---|---|---|\n";
if (kredipaket.length) {
  for (const c of kredipaket) kredi += `| ${c.name || "—"} | ${c.credits ?? "—"} | ${para(c.priceUsd)} | ${c.validityDays != null ? c.validityDays + " days" : "—"} | ${para(c.pricePer1000CreditsUsd)} |\n`;
} else {
  kredi += "| _no credit packages_ | | | | |\n";
}

let kredik = "| Message category | Credits per message |\n|---|---|\n";
if (kredikategori.length) {
  for (const c of kredikategori) kredik += `| ${ad(c.names, "en")} | ${c.creditsPerMessage ?? "—"} |\n`;
} else {
  kredik += "| _no categories_ | |\n";
}

blok(md, "PRICING:SUMMARY", ozet + "\n_All amounts are sell prices in " + (d.currency ?? "USD") + "._");
blok(md, "PRICING:TIERS", tier);
blok(md, "PRICING:CREDITS", kredi);
blok(md, "PRICING:CATEGORIES", kredik);
blok(md, "PRICING:ADDONS", eklenti);
blok(md, "PRICING:CAMPAIGN", kampanya + "\n");

damga(md, "<!-- PRICING:UPDATED -->", idamga);

/* README blocks — same whitelisted data, compact form. */
if (readme) {
  blok(readme, "PRICING:README:SUMMARY", ozet + "\n| Add-on | Sell price per month |\n|---|---|\n" + eklentiler.map((a) => `| ${ad(a.names, "en")} | ${para(a.pricePerMonthUsd)} |`).join("\n"));
  blok(readme, "PRICING:README:CREDITS", kredi);
  damga(readme, "<!-- PRICING:README:UPDATED -->", idamga);
}
console.log(`written: ${md} (${paketler.length} packages, ${kredipaket.length} credit packages)${readme ? " + " + readme : ""}`);

function ad(names, lang) {
  if (!names || typeof names !== "object") return "—";
  return String(names[lang] ?? names.en ?? Object.values(names)[0] ?? "—");
}
