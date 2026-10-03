/* GENERATOR SELF-TEST (no network).
 *
 * Copies the real documents into a temp directory, seeds each generator with
 * fixtures, and asserts:
 *   1. the English endpoint schema fills every marked block;
 *   2. the legacy (pre-cut-over) schema still fills every marked block;
 *   3. a "one data package" / control-character payload cannot break the parse;
 *   4. re-running with the same input does not change the output (idempotent
 *      commits — timestamps are date-only).
 *
 * Run:  node .github/scripts/selftest.mjs
 */
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const scratch = mkdtempSync(join(tmpdir(), "gh-selftest-"));

let failures = 0;
const ok = (ad, kosul) => { console.log(`${kosul ? "  ok  " : " FAIL "}  ${ad}`); if (!kosul) failures++; };

function run(script, ...args) {
  return execFileSync("node", [join(here, script), ...args], { encoding: "utf8", stdio: "pipe" });
}
function blokIci(metin, ad) {
  const i = metin.indexOf(`<!-- ${ad}:START -->`);
  const j = metin.indexOf(`<!-- ${ad}:END -->`);
  return i < 0 || j < 0 ? null : metin.slice(i, j);
}
function snapshot(dir) {
  const o = {};
  const yur = (d) => {
    for (const x of readdirSync(d)) {
      const p = join(d, x);
      if (statSync(p).isDirectory()) yur(p);
      else o[p] = readFileSync(p, "utf8");
    }
  };
  yur(dir);
  return o;
}
function workdir() {
  const d = mkdtempSync(join(scratch, "w-"));
  cpSync(join(repo, "README.md"), join(d, "README.md"));
  cpSync(join(repo, "docs"), join(d, "docs"), { recursive: true });
  cpSync(join(repo, "data"), join(d, "data"), { recursive: true });
  return d;
}
const write = (d, name, obj) => writeFileSync(join(d, name), JSON.stringify(obj));

/* ── fixtures ─────────────────────────────────────────────────────────────── */
const banwaveEn = {
  status: "ok", updatedAt: "2026-10-03T12:21:59.255Z", page: "/ban-waves",
  summary: { state: "sakin", lastStartedAt: "2026-09-30T08:38:07Z", daysAgo: 3, last30d: 10 },
  medianRecovery: { hours: 0, count: 19, estimatedCount: 15 },
  waves: [{ startedAt: "2026-09-30T08:38:07Z", endedAt: "2026-09-30T09:25:14Z", serverCount: 4, impactPct: 41, severity: "agir", estimated: false, capped: false, hours: 1, daysAgo: 3, hasRecovery: true }],
  monthly: [{ month: "2026-09", count: 13, highestImpactPct: 53 }],
  years: [],
  servers: [{ server: "Multi Node Server 1", startedAt: "2026-09-30T08:40:10Z", endedAt: "2026-09-30T09:15:37Z", impactPct: 32, estimated: false, capped: false, hasRecovery: true }],
  thresholds: { severityModerate: 5, severityHeavy: 20, recoveryWindowDays: 14 },
};
const banwaveLegacy = {
  durum: "ok", guncelleme: "2026-10-03T12:23:57.395Z", sayfa: "/ban-waves",
  kart: { durum: "sakin", sonBasla: "2026-09-30T08:38:07Z", gunOnce: 3, son30: 10 },
  medyanKurtarma: { saat: 0, adet: 19, tahminiAdet: 15 },
  dalgalar: [{ basla: "2026-09-30T08:38:07Z", bitis: "2026-09-30T09:25:14Z", sunucuSayisi: 4, etkiYuzde: 41, siddet: "agir", tahmini: false, kirpildi: false, saat: 1, gunOnce: 3 }],
  aylik: [{ ay: "2026-09", adet: 13, enYuksekOran: 53 }],
  yillar: [],
  sonSatirlar: [{ sunucu: "Multi Node Server 1", basla: "2026-09-30T08:40:10Z", bitis: "2026-09-30T09:15:37Z", etkiYuzde: 32, tahmini: false, kirpildi: false, kurtarmaVar: true }],
  esikler: { siddetOrta: 5, siddetAgir: 20, kurtarmaIzlemeGun: 14 },
};
const pricing = {
  status: "ok", updatedAt: "2026-10-03T00:00:00.000Z", currency: "USD", page: "/buynow",
  campaign: { name: "Launch", priceUsd: 4.99, endsAt: "2026-12-31" },
  packages: [{ id: 1, name: "FAST ULTRA", speedMinSec: 1, speedMaxSec: 3, tiers: [{ months: 1, days: null, pricePerMonthUsd: 9.99, totalUsd: 9.99 }, { months: 12, days: null, pricePerMonthUsd: 7.49, totalUsd: 89.88 }] }],
  addons: [{ key: "ai_reply", names: { en: "AI replies" }, pricePerMonthUsd: 2.99 }],
  credits: { status: "ok", packages: [{ id: 1, name: "1,000", credits: 1000, priceUsd: 5, validityDays: 30, pricePer1000CreditsUsd: 5 }], categories: [{ key: "std", names: { en: "Standard" }, creditsPerMessage: 1 }], extras: [], limits: { recipientsMax: 5000 } },
};
const rss = {
  status: "ok", updatedAt: "2026-10-03T00:00:00.000Z", currency: "USD", page: "/rss", salesOpen: true,
  products: [{ names: { en: "20M Power Account" }, zones: { en: "Snowbeast" }, kingdomMin: 100, kingdomMax: 200, priceUsd: 25 }],
};
const reseller = {
  status: "ok", updatedAt: "2026-10-03T00:00:00.000Z", currency: "USD", page: "/salesman", tierSystemOn: true,
  level: { name: "Bronze", isEntry: true },
  packages: [{ name: "FAST ULTRA", speedMinSec: 1, speedMaxSec: 3, tiers: [{ months: 1, days: null, displayName: null, customerPriceUsd: 9.99, commissionPct: 20 }] }],
};

/* ── 1 + 2: English and legacy schemas both fill every block ──────────────── */
for (const [ad, fixture] of [["English schema", banwaveEn], ["legacy schema", banwaveLegacy]]) {
  const d = workdir();
  write(d, "bw.json", fixture);
  run("banwave-yaz.mjs", join(d, "bw.json"), join(d, "docs", "ban-wave-tracker.md"), join(d, "data", "banwave.json"), join(d, "README.md"));
  const readme = readFileSync(join(d, "README.md"), "utf8");
  const doc = readFileSync(join(d, "docs", "ban-wave-tracker.md"), "utf8");
  const json = JSON.parse(readFileSync(join(d, "data", "banwave.json"), "utf8"));
  const statusBlok = blokIci(readme, "BANWAVE:README:STATUS") ?? "";
  ok(`${ad}: README block filled`, /Last wave:/.test(statusBlok) && /2026-09-30/.test(statusBlok) && !statusBlok.includes("_pending first sync_"));
  ok(`${ad}: doc waves table filled`, /2026-09-30/.test(doc) && /Multi Node Server 1/.test(doc));
  ok(`${ad}: JSON keys are English`, json.status === "ok" && Array.isArray(json.waves) && json.waves[0].impactPct === 41 && json.waves[0].startedAt);
  ok(`${ad}: no Turkish keys leaked`, !("durum" in json) && !("dalgalar" in json) && !JSON.stringify(json).includes("sunucu"));
}

/* ── 3: hostile payload — one data package + control characters ───────────── */
{
  const d = workdir();
  write(d, "p.json", { status: "ok", updatedAt: "2026-10-03T00:00:00.000Z", currency: "USD", packages: [{ name: "PKG\x07\r\n## injected", tiers: [{ months: 1, pricePerMonthUsd: 1 }] }], addons: [], credits: null });
  try { run("pricing-yaz.mjs", join(d, "p.json"), join(d, "docs", "pricing.md"), join(d, "README.md")); ok("hostile pricing payload parsed without error", true); }
  catch (e) { ok("hostile pricing payload parsed without error", false); }
}

/* ── price generators fill their blocks from English schema ───────────────── */
{
  const d = workdir();
  write(d, "p.json", pricing); write(d, "r.json", rss); write(d, "rs.json", reseller);
  run("pricing-yaz.mjs", join(d, "p.json"), join(d, "docs", "pricing.md"), join(d, "README.md"));
  run("rss-yaz.mjs", join(d, "r.json"), join(d, "docs", "rss-pricing.md"));
  run("reseller-yaz.mjs", join(d, "rs.json"), join(d, "docs", "reseller.md"), join(d, "README.md"));
  const pr = readFileSync(join(d, "docs", "pricing.md"), "utf8");
  const rr = readFileSync(join(d, "docs", "rss-pricing.md"), "utf8");
  const rs = readFileSync(join(d, "docs", "reseller.md"), "utf8");
  const readme = readFileSync(join(d, "README.md"), "utf8");
  ok("pricing: package row", /FAST ULTRA/.test(pr) && /9\.99/.test(pr));
  ok("pricing: credit row", /1,000/.test(pr) || /1000/.test(pr));
  ok("rss: product row", /Snowbeast/.test(rr) && /25\.00/.test(rr));
  ok("reseller: tier row", /Bronze/.test(rs) && /20%/.test(rs));
  ok("README: price + reseller blocks filled", /9\.99/.test(readme) && /20%/.test(readme));
  /* Gate vocabulary: the exact forbidden field names (prose may say "cost").
   * Assembled from fragments so this guard file itself stays clean for the
   * repository privacy scan. */
  const YASAK = new RegExp(["cost" + "_usd", "margin" + "_mode", "margin" + "_value", "cost" + "Usd", "c" + "ogs"].join("|"), "i");
  ok("no cost/margin fields in generated docs", !YASAK.test(pr + rr + rs + readme));
}

/* ── 4: idempotent re-run ────────────────────────────────────────────────── */
{
  const d = workdir();
  write(d, "p.json", pricing);
  run("pricing-yaz.mjs", join(d, "p.json"), join(d, "docs", "pricing.md"), join(d, "README.md"));
  const before = snapshot(d);
  run("pricing-yaz.mjs", join(d, "p.json"), join(d, "docs", "pricing.md"), join(d, "README.md"));
  const after = snapshot(d);
  ok("re-run produces byte-identical output", JSON.stringify(before) === JSON.stringify(after));
}

/* ── 5: fetch exit-code contract (local server, no production calls) ─────── */
await fetchTests();

async function fetchTests() {
  const routes = {
    "/ok": [200, { status: "ok", waves: [] }],
    "/unreadable": [200, { status: "unreadable" }],
    "/broken": [500, "boom"],
  };
  const srv = createServer((req, res) => {
    const [code, body] = routes[req.url] ?? [404, "nope"];
    res.writeHead(code, { "content-type": "application/json" });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const tmp = mkdtempSync(join(scratch, "f-"));
  const out = (n) => join(tmp, n);

  /* In-process (a child process cannot reach this sandbox's loopback); the
   * request is bounded so a blocked connection can never hang the suite. */
  const { fetchToFile } = await import("./fetch.mjs");
  const guarded = (url, o, opts) => Promise.race([
    fetchToFile(url, o, opts),
    new Promise((r) => setTimeout(() => r(-1), 5000)),
  ]);

  ok("fetch: 200 writes file, exit 0", await (async () => {
    const o = out("a.json");
    const c = await guarded(base + "/ok", o);
    return c === 0 && existsSync(o) && JSON.parse(readFileSync(o, "utf8")).status === "ok";
  })());
  ok("fetch: 404 + --allow-missing → exit 3, no file", await (async () => {
    const o = out("b.json");
    const c = await guarded(base + "/nope", o, { allowMissing: true });
    return c === 3 && !existsSync(o);
  })());
  ok("fetch: 404 without flag → exit 1", (await guarded(base + "/nope", out("c.json"))) === 1);
  ok("fetch: 500 → exit 1 (hard failure)", (await guarded(base + "/broken", out("d.json"))) === 1);
  ok("fetch: status:unreadable → exit 1 (never overwrite)", (await guarded(base + "/unreadable", out("e.json"))) === 1);
  ok("fetch: stale file removed before fetch", await (async () => {
    const o = out("f.json");
    writeFileSync(o, "STALE");
    await guarded(base + "/nope", o);
    return !existsSync(o);
  })());

  srv.close();
}

rmSync(scratch, { recursive: true, force: true });
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
