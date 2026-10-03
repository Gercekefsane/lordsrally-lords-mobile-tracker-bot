/* PUBLIC DATA — FETCH STEP (GitHub Action).
 *
 * Pulls one JSON endpoint and writes it to `--out`. The returned/exited code is
 * the contract the workflow branches on:
 *
 *   0  data written to --out            → caller regenerates the document
 *   3  endpoint not deployed yet (404)  → --allow-missing; caller preserves the
 *                                          existing document (a warning, not a
 *                                          silent failure)
 *   1  genuine failure                  → HTTP error, non-JSON body, or the
 *                                          endpoint reporting the source as
 *                                          unreadable/unavailable. The caller
 *                                          must FAIL the job so it never goes
 *                                          silent, and the document is preserved.
 *
 * 🔴 SILENT-FAILURE GUARD: an endpoint may answer 200 with
 *    `status:"unreadable"` / `"unavailable"` (its own data source is down).
 *    That is NOT empty data — it must never overwrite a good document, so it is
 *    a hard failure (1), exactly like a network error.
 *
 * ⚠️ Stale-input guard: `--out` is removed up front. If the fetch does not
 *    succeed, the caller sees no file and preserves the document instead of
 *    re-processing last run's bytes.
 */
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Fetch `endpoint` to `out`. Returns an exit code (0/1/3); never throws. */
export async function fetchToFile(endpoint, out, { allowMissing = false } = {}) {
  /* Never let a stale file from a previous run masquerade as fresh data. */
  if (existsSync(out)) rmSync(out);

  let yanit;
  try {
    yanit = await fetch(endpoint, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(25000),
    });
  } catch (e) {
    console.error(`fetch failed: ${endpoint} — ${e?.message ?? e}`);
    return 1;
  }

  /* Route not deployed yet: a warning to the caller, not a failure. A deployed
   * endpoint that breaks does NOT 404 — it answers 200 with status:unavailable
   * or a 5xx — so this branch cannot hide real breakage. */
  if (yanit.status === 404 && allowMissing) {
    console.error(`endpoint not deployed yet (HTTP 404): ${endpoint} — document preserved`);
    return 3;
  }

  if (!yanit.ok) {
    console.error(`endpoint HTTP ${yanit.status}: ${endpoint} — document preserved`);
    return 1;
  }

  const govde = await yanit.json().catch(() => null);
  if (!govde || typeof govde !== "object") {
    console.error(`response is not JSON: ${endpoint} — document preserved`);
    return 1;
  }

  /* The endpoint says its own source could not be read → never overwrite. */
  const durum = govde.status ?? govde.durum;
  if (durum === "unreadable" || durum === "unavailable" || durum === "okunamadi") {
    console.error(`endpoint reports source ${durum}: ${endpoint} — document preserved`);
    return 1;
  }

  writeFileSync(out, JSON.stringify(govde));
  console.log(`fetched ${endpoint} → ${out}`);
  return 0;
}

/* CLI entry (skipped when imported by the self-test). */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const endpoint = argv[0];
  const outIdx = argv.indexOf("--out");
  const out = outIdx >= 0 ? argv[outIdx + 1] : null;
  if (!endpoint || !out) {
    console.error("usage: fetch.mjs <endpoint> --out <file> [--allow-missing]");
    process.exit(2);
  }
  process.exit(await fetchToFile(endpoint, out, { allowMissing: argv.includes("--allow-missing") }));
}
