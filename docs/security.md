# Security & Honesty

This page exists because most automation is sold with claims and no evidence. Here is what LordsRally does, and what it deliberately does **not** do.

---

## We publish our own risk data

Lords Mobile bans bot accounts in waves. Instead of claiming automation is safe, LordsRally **measures** the waves and publishes the results — timing, the share of a server's account pool affected, and how long recovery took.

👉 **[Ban wave tracker](https://lordsrally.com/ban-waves)** · machine-readable: [`data/banwave.json`](../data/banwave.json)

Where a value could not be measured it is **labelled as an estimate** — never presented as fact.

## No invented numbers

You will not find in this repository:

- fake "customers served" counters,
- fabricated delivery guarantees,
- unverifiable claims about competitors,
- made-up percentages or account counts.

Prices, availability and command counts live on the site, which reads them in real time. Anything mirrored here is generated from the platform's own public endpoints and stamped with the date it was last synced.

## What we never publish

Our public surfaces are restricted by design. Not published anywhere:

| Category | Why |
|---|---|
| Absolute account counts | Only **shares** are shown — an absolute number would expose the size of the operation. |
| Server identities | Anonymous labels only (`Multi Node Server N`). |
| Our own costs / margins | Resellers see the **commission** they earn, never what the platform pays. |
| Customer data | Numbers, order details and contact information are never disclosed to third parties. |
| Internal system names | Public documentation uses product names only. |

## Customer data

- Ordering requires a **verified phone number**, used solely so delivery notices and account-security messages actually reach the customer.
- The balance ledger is **the customer's own** — every top-up, order and refund is listed in their account so they can reconcile it themselves.
- Customer data is **never sold or shared**. See [lordsrally.com/privacy](https://lordsrally.com/privacy) for the full statement.

## Being honest about risk

- **Automation carries risk in any game.** We say so plainly rather than pretending otherwise.
- The Bulk Message editor **warns** about wording that raises mute/ban risk, and never sends more than you confirmed — see [Bulk Message](bulk-message.md).
- Command output and bot events are **recorded and visible** in your account: failures are shown, not hidden.

## Verifying these claims

Everything on this page can be checked:

- Ban wave data: [`docs/ban-wave-tracker.md`](ban-wave-tracker.md) and [`data/banwave.json`](../data/banwave.json).
- Price mirrors: [`docs/pricing.md`](pricing.md), [`docs/rss-pricing.md`](rss-pricing.md), [`docs/reseller.md`](reseller.md) — each stamped with its last sync date.
- Live behaviour: the [demo](https://lordsrally.com) needs no account.

> 🔄 The mirrored files are **generated automatically** from the platform's public data endpoints. If an endpoint cannot be read, the previous document is preserved rather than being blanked — you never see a silently emptied page.

---

🔗 [Why LordsRally](why-lordsrally.md) · [Privacy policy](https://lordsrally.com/privacy) · [Terms](https://lordsrally.com/terms)
