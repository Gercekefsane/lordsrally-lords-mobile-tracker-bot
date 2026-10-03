/* BAN DALGASI — VERİ ÇEKME (GitHub Action adımı).
 *
 * 🔴 SÖZLEŞME: uç `{ durum: "ok"|"bos"|"okunamadi", ... }` döner.
 *    · "okunamadi" → MEVCUT DOSYALAR KORUNUR (boş veriyle EZİLMEZ): ağ/DB arızasında
 *      repodaki son iyi veri durur. Sessizce silmek, vitrini boşaltırdı.
 *    · Yanıt HTTP 200 değilse ya da JSON değilse → aynı şekilde hata verip çıkılır;
 *      Action kırmızı olur (sessiz kalmaz), dosyalar değişmez.
 * ⚠️ Zaman aşımı: uç yavaşsa (DB soğuk) 25 sn beklenir; daha uzun asılma iş akışını
 *    gereksiz tutardı.        */
const [, , endpoint] = process.argv;
if (!endpoint) { console.error("kullanim: banwave-cek.mjs <endpoint>"); process.exit(2); }

const yanit = await fetch(endpoint, {
  headers: { accept: "application/json" },
  signal: AbortSignal.timeout(25000),
});
if (!yanit.ok) {
  console.error(`veri ucu HTTP ${yanit.status} — dosyalar korunacak`);
  process.exit(1);
}
const govde = await yanit.json().catch(() => null);
if (!govde || typeof govde !== "object") {
  console.error("yanit JSON degil — dosyalar korunacak");
  process.exit(1);
}
if (govde.durum === "okunamadi") {
  console.error("uc 'okunamadi' dedi (kaynak okunamadi) — dosyalar KORUNUR");
  process.exit(1);
}
/* Boş veri de ezmez: 'bos' (hiç dalga yok) yalnız dosya YOKKEN yazılır. */
process.stdout.write(JSON.stringify(govde));
