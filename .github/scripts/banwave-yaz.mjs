/* BAN DALGASI — DOSYA ÜRETİCİ (GitHub Action adımı).
 *
 * İki dosya yazar:
 *   1. `data/banwave.json` — özet + dalgalar (makine-okur)
 *   2. `docs/ban-wave-tracker.md` — `<!-- BANWAVE:*:START/END -->` işaretleri ARASINDAKİ
 *      tabloları doldurur; işaret DIŞINDAKİ metne (açıklama, metodoloji, SSS) DOKUNMAZ.
 *
 * 🔴 BEYAZ LİSTE: yalnız `sunucu` (takma ad), tarih, yüzde, bayrak yazılır. Gelen JSON'da
 *    fazladan alan olsa bile BURADAN GEÇMEZ (nesne tek tek kurulur).
 * ⚠️ Sayı biçimi: yüzde virgüllü basılır; `null` → "—" (uydurma %0 YOK).
 * ⚠️ "Tahmini" etiketi korunur: ölçülmemiş değer tahmin olarak işaretlenir.   */
import { readFileSync, writeFileSync } from "node:fs";

const [, , kaynak, md, json] = process.argv;
if (!kaynak || !md || !json) {
  console.error("kullanim: banwave-yaz.mjs <veri.json> <hedef.md> <hedef.json>");
  process.exit(2);
}
const d = JSON.parse(readFileSync(kaynak, "utf8"));

const yuzde = (v) => (typeof v === "number" && Number.isFinite(v) ? `%${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}` : "—");
const gun = (iso) => (typeof iso === "string" && iso.length >= 10 ? iso.slice(0, 10) : "—");
const saat = (h) => (typeof h === "number" && h > 0 ? `${h} h` : "—");
const siddetEtiket = { hafif: "light", orta: "moderate", agir: "heavy", bilinmiyor: "unknown" };
const kurtarma = (k) => {
  if (!k || typeof k !== "object") return "—";
  if (k.durum === "tamam" && typeof k.saat === "number") return `${k.saat} h${k.tahmini ? " (est.)" : ""}`;
  if (k.durum === "kurtarildi") return "recovered";
  if (k.durum === "suruyor") return k.saat ? `ongoing (${k.saat} h)` : "ongoing";
  return "—";
};

/* ── 1) JSON (beyaz listeli kopya) ─────────────────────────────────────── */
const cikti = {
  durum: d.durum === "ok" ? "ok" : "bos",
  guncelleme: typeof d.guncelleme === "string" ? d.guncelleme : null,
  sayfa: typeof d.sayfa === "string" ? d.sayfa : null,
  kart: d.kart && typeof d.kart === "object"
    ? { durum: String(d.kart.durum ?? ""), sonBasla: d.kart.sonBasla ?? null, gunOnce: d.kart.gunOnce ?? null, son30: d.kart.son30 ?? null }
    : null,
  medyanKurtarma: d.medyanKurtarma && typeof d.medyanKurtarma === "object"
    ? { saat: d.medyanKurtarma.saat ?? null, adet: d.medyanKurtarma.adet ?? null, tahminiAdet: d.medyanKurtarma.tahminiAdet ?? null }
    : null,
  dalgalar: Array.isArray(d.dalgalar) ? d.dalgalar.slice(0, 120).map((f) => ({
    basla: f?.basla ?? null, bitis: f?.bitis ?? null, sunucuSayisi: f?.sunucuSayisi ?? null,
    etkiYuzde: f?.etkiYuzde ?? null, siddet: f?.siddet ?? null, tahmini: !!f?.tahmini, saat: f?.saat ?? null, gunOnce: f?.gunOnce ?? null,
  })) : [],
  aylik: Array.isArray(d.aylik) ? d.aylik.slice(0, 24).map((a) => ({ ay: a?.ay ?? null, adet: a?.adet ?? null, enYuksekOran: a?.enYuksekOran ?? null })) : [],
  yillar: Array.isArray(d.yillar) ? d.yillar.slice(0, 10).map((y) => ({ yil: y?.yil ?? null, adet: y?.adet ?? null })) : [],
};
writeFileSync(json, JSON.stringify(cikti, null, 2) + "\n");

/* ── 2) Markdown işaret blokları ──────────────────────────────────────── */
const durumMetni = cikti.kart
  ? (cikti.kart.durum === "suruyor"
    ? `**A wave is in progress.** Last wave started ${gun(cikti.kart.sonBasla)} (${cikti.kart.gunOnce ?? "?"} day(s) ago). Waves in the last 30 days: **${cikti.kart.son30 ?? "—"}**.`
    : `**No wave in progress.** Last wave: ${gun(cikti.kart.sonBasla)} (${cikti.kart.gunOnce ?? "?"} day(s) ago). Waves in the last 30 days: **${cikti.kart.son30 ?? "—"}**.`)
  : "_No measurement available yet._";

const medyan = cikti.medyanKurtarma && typeof cikti.medyanKurtarma.saat === "number"
  ? `\n**Median recovery:** ${saat(cikti.medyanKurtarma.saat)} across ${cikti.medyanKurtarma.adet ?? "—"} measured server waves` +
    (cikti.medyanKurtarma.tahminiAdet ? ` (${cikti.medyanKurtarma.tahminiAdet} estimated from logs).` : ".")
  : "";

const dalgaSatirlari = cikti.dalgalar.length
  ? cikti.dalgalar.map((f) =>
      `| ${gun(f.basla)} | ${f.sunucuSayisi ?? "—"} | ${yuzde(f.etkiYuzde)}${f.tahmini ? " (est.)" : ""} | ${siddetEtiket[f.siddet] ?? f.siddet ?? "—"} | ${saat(f.saat)} | ${kurtarma(f.kurtarma)} |`).join("\n")
  : "| _no waves recorded_ | | | | | |";

const aySatirlari = cikti.aylik.length
  ? cikti.aylik.map((a) => `| ${a.ay ?? "—"} | ${a.adet ?? "—"} | ${yuzde(a.enYuksekOran)} |`).join("\n")
  : "| _no data_ | | |";

let metin = readFileSync(md, "utf8");
const blok = (ad, icerik, tabloBasligi) => {
  const bas = `<!-- BANWAVE:${ad}:START -->`;
  const son = `<!-- BANWAVE:${ad}:END -->`;
  const i = metin.indexOf(bas), j = metin.indexOf(son);
  if (i < 0 || j < 0) { console.error(`isaret bulunamadi: ${ad}`); process.exit(1); }
  metin = metin.slice(0, i + bas.length) + "\n" + (tabloBasligi ? tabloBasligi + "\n" : "") + icerik + "\n" + metin.slice(j);
};
blok("STATUS", durumMetni + medyan);
blok("WAVES", dalgaSatirlari,
  "| Date (UTC) | Servers | Impact | Severity | Duration | Recovery |\n|---|---|---|---|---|---|");
blok("MONTHS", aySatirlari, "| Month | Waves | Highest impact |\n|---|---|---|");

/* Güncelleme damgası: işaret dışında, sabit bir satır (yoksa eklenir). */
const damga = `\n_Last updated: ${cikti.guncelleme ?? "unknown"} — source: ${cikti.sayfa ?? "lordsrally.com/ban-waves"}_\n`;
const damgaBas = "<!-- BANWAVE:UPDATED -->";
metin = metin.includes(damgaBas) ? metin.replace(new RegExp(damgaBas + "[\s\S]*$"), damgaBas + damga) : metin.trimEnd() + "\n\n" + damgaBas + damga;

writeFileSync(md, metin);
console.log(`yazildi: ${json} (${cikti.dalgalar.length} dalga) + ${md}`);
