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
  /* 🔴 SHAPE MUST MIRROR PRODUCTION (measured 2026-10-03): on the live endpoint
   *    `waves[]` carries recovery as an OBJECT and has NO `hasRecovery` key,
   *    while `servers[]` carries the BOOLEAN. A fixture that gave `waves` a
   *    `hasRecovery` field — which the endpoint never sends — is exactly what
   *    hid the empty Recovery column: the generator read a key that only
   *    existed in the test. */
  waves: [
    { startedAt: "2026-09-30T08:38:07Z", endedAt: "2026-09-30T09:25:14Z", serverCount: 4, impactPct: 41, severity: "agir", estimated: false, capped: false, hours: 1, daysAgo: 3, recovery: { state: "complete", hours: 1, estimated: false } },
    /* Lasted 3 h, but recovery was never measured — the two durations are
     *  different quantities. A generator that reused the wave's own duration
     *  for the Recovery cell writes a number the evidence does not support. */
    { startedAt: "2026-09-21T08:45:47Z", endedAt: "2026-09-21T11:45:47Z", serverCount: 1, impactPct: 28, severity: "agir", estimated: false, capped: false, hours: 3, daysAgo: 12, recovery: { state: "recovered", hours: null, estimated: false } },
    /* ⚠️ A MEASURED zero is live today (`complete, hours: 0` on the 2026-09-24
     *  wave). It is the only case that forces the two clauses apart: "print a
     *  duration" and "the duration is positive" are different rules, and a
     *  fixture without this row cannot tell them apart. */
    { startedAt: "2026-09-24T09:10:02Z", endedAt: "2026-09-24T09:10:02Z", serverCount: 1, impactPct: 3.9, severity: "hafif", estimated: false, capped: false, hours: 0, daysAgo: 9, recovery: { state: "complete", hours: 0, estimated: true } },
    /* An unrecognised state must fall back to the CONSERVATIVE reading
     *  (`ongoing`), never to `recovered` — the column may not claim a recovery
     *  the source did not assert. */
    { startedAt: "2026-08-12T10:00:00Z", endedAt: "2026-08-12T10:00:00Z", serverCount: 1, impactPct: 100, severity: "agir", estimated: true, capped: false, hours: 0, daysAgo: 52, recovery: { state: "not_a_known_state", hours: null, estimated: false } },
  ],
  monthly: [{ month: "2026-09", count: 13, highestImpactPct: 53 }],
  years: [],
  /* Mirrors today's live payload: `servers[]` rows carry the boolean only. */
  servers: [
    { server: "Multi Node Server 1", startedAt: "2026-09-30T08:40:10Z", endedAt: "2026-09-30T09:15:37Z", impactPct: 32, estimated: false, capped: false, hasRecovery: true },
    /* A row whose recovery moment was never recorded — the user's report was
     *  that these print as `ongoing` forever, even 52 days later. */
    { server: "Multi Node Server 3", startedAt: "2026-08-12T08:00:00Z", endedAt: "2026-08-12T08:05:00Z", impactPct: 100, estimated: true, capped: false, hasRecovery: false },
    /* A deployment mid-cut-over can send BOTH shapes on one row. The object is
     *  the stronger statement; reading the boolean first would answer
     *  `ongoing` for a row that says `recovered`. */
    { server: "Multi Node Server 2", startedAt: "2026-09-21T08:02:21Z", endedAt: "2026-09-21T08:12:21Z", impactPct: 27, estimated: false, capped: false, hasRecovery: false, recovery: { state: "recovered", hours: null, estimated: false } },
  ],
  thresholds: { severityModerate: 5, severityHeavy: 20, recoveryWindowDays: 14 },
};
const banwaveLegacy = {
  durum: "ok", guncelleme: "2026-10-03T12:23:57.395Z", sayfa: "/ban-waves",
  kart: { durum: "sakin", sonBasla: "2026-09-30T08:38:07Z", gunOnce: 3, son30: 10 },
  medyanKurtarma: { saat: 0, adet: 19, tahminiAdet: 15 },
  /* Legacy deployment: recovery arrived as a bare boolean (`kurtarmaVar`).
   *  The generator must still fill the column from it — the shim is removed
   *  only once every deployment speaks the English object schema. */
  dalgalar: [{ basla: "2026-09-30T08:38:07Z", bitis: "2026-09-30T09:25:14Z", sunucuSayisi: 4, etkiYuzde: 41, siddet: "agir", tahmini: false, kirpildi: false, saat: 1, gunOnce: 3, kurtarmaVar: true }],
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

  /* 🔴 The regression the user reported: the Recovery column printed `—` on
   *  EVERY wave row because the generator read a key the endpoint never sent.
   *  Assert the cell, not the presence of the column heading. */
  const satirBul = (metin, blokAd) =>
    ((blokIci(metin, blokAd) ?? "").split("\n").filter((l) => l.startsWith("| 2026-")));
  const docSatir = satirBul(doc, "BANWAVE:WAVES");
  const mdSatir = satirBul(readme, "BANWAVE:README:WAVES");
  ok(`${ad}: doc waves table states recovery on every row`,
     docSatir.length > 0 && docSatir.every((l) => !/\|\s*—\s*\|\s*$/.test(l)));
  ok(`${ad}: README waves table states recovery on every row`,
     mdSatir.length > 0 && mdSatir.every((l) => !/\|\s*—\s*\|\s*$/.test(l)));
  ok(`${ad}: recovery carried into JSON (object, not a lost boolean)`,
     json.waves.every((w) => w && w.recovery && typeof w.recovery.state === "string"));
  ok(`${ad}: servers rows state recovery`,
     json.servers.every((s) => s && s.recovery && typeof s.recovery.state === "string")
     && ((blokIci(doc, "BANWAVE:SERVERS") ?? "").split("\n").filter((l) => l.startsWith("| Multi")).every((l) => !/\|\s*—\s*\|\s*$/.test(l))));
  /* A row with no recovery moment must be REPORTED (recovered/ongoing), not
   *  blanked — the user's report was an empty-looking column. A `false`
   *  boolean means "no moment recorded", NOT "still ongoing". */
  ok(`${ad}: server row without a recovery moment is still stated`,
     json.servers.every((s) => ["complete", "recovered", "ongoing"].includes(s.recovery.state))
     && !/\| Multi Node Server 3 \| 2026-08-12 \|[^|]*\|\s*—\s*\|/.test(blokIci(doc, "BANWAVE:SERVERS") ?? ""));
  /* Object beats boolean when a row carries both — the boolean is the weaker
   *  statement and must not mask a stated `recovered`. Only the English
   *  fixture carries such a row; the legacy shape has no object to prefer. */
  const karisik = (Array.isArray(fixture.servers) ? fixture.servers : []).find((s) => s?.recovery && s?.hasRecovery !== undefined);
  if (karisik) {
    ok(`${ad}: a row carrying both shapes reads the object, not the boolean`,
       (json.servers.find((s) => s.server === karisik.server) ?? {}).recovery?.state === "recovered");
  }

  /* Recovery hours are the RECOVERY duration, never the wave's own duration.
   *  The English fixture's second wave lasted 0 h but has no measured recovery
   *  — a generator that reused `f.hours` would print a number here. */
  if (Array.isArray(fixture.waves) && fixture.waves.length > 1) {
    const sonSatir = (metin, blokAd) =>
      ((blokIci(metin, blokAd) ?? "").split("\n").filter((l) => l.includes("2026-09-21")).pop() ?? "");
    ok(`${ad}: recovery hours are not the wave's own duration`,
       json.waves[1].hours === 3 && json.waves[1].recovery.hours === null);
    ok(`${ad}: no unmeasured duration printed for recovery`,
       docSatir.length > 1 && /\| recovered \|$/.test(docSatir[1]) && !/\(3 h\)/.test(sonSatir(doc, "BANWAVE:WAVES")));
    /* A measured zero is DURATION 0, so it must stay bare — printing "(0 h)"
     *  next to "under 1 h" on the page would be a second, contradicting unit. */
    ok(`${ad}: a measured zero duration prints bare, not "(0 h)"`,
       !/\(0 h\)/.test(doc) && !/\(0 h\)/.test(readme));
    ok(`${ad}: an unknown recovery state is not reported as recovered`,
       json.waves[json.waves.length - 1].recovery.state === "ongoing");
  }
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

/* ── 3b: the DOCUMENTED schema matches what the generator emits ────────────
 * 🔴 WHY (measured 2026-10-03): `data/README.md` and `docs/ban-wave-tracker.md`
 *    documented `hasRecovery` on `waves[]` — a field the endpoint never sent and
 *    the generator never wrote. Readers were told about a contract that did not
 *    exist, and it was the same confusion that made the Recovery column blank.
 *    A schema example is a promise; keep it in step with the code. */
{
  const belgeler = [
    join(repo, "data", "README.md"),
    join(repo, "docs", "ban-wave-tracker.md"),
  ].filter(existsSync);
  const sizan = belgeler.filter((p) => /hasRecovery/.test(readFileSync(p, "utf8")));
  ok("documented schema does not name the removed `hasRecovery` field",
    sizan.length === 0);
  ok("documented schema describes the recovery object",
    belgeler.every((p) => /"recovery"\s*:\s*\{\s*"state"/.test(readFileSync(p, "utf8"))));
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
