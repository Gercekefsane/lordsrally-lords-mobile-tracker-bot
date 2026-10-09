# LordsRally — Lords Mobile Tracking Bot & Automation Platform

**LordsRally** is a Lords Mobile automation platform: automated kingdom tracking, ready-to-use accounts and redeem codes, in-game bulk messaging, and a public, continuously measured **ban wave tracker** — all on one account and one balance.

<p>
  <a href="https://lordsrally.com">🌐 Website</a> ·
  <a href="https://lordsrally.com/commands">Commands</a> ·
  <a href="https://lordsrally.com/features">Features</a> ·
  <a href="https://lordsrally.com/ban-waves">Ban Wave Tracker</a> ·
  <a href="https://lordsrally.com/salesman">Become a reseller</a>
</p>

> 💬 Alerts arrive on **WhatsApp** and **Telegram** — see [WhatsApp bot](docs/whatsapp-bot.md).
> 🎁 **1-day free trial** — open the site and press **Demo** → [start here](docs/free-trial.md).
> 🌍 The whole platform runs in **7 languages** (TR · EN · ES · PT · RU · ID · VI).

---

## Table of contents

- [What is LordsRally?](#what-is-lordsrally)
- [The four products](#the-four-products)
  - [1. Bot packages](#1-bot-packages)
  - [2. RSS accounts & redeem codes](#2-rss-accounts--redeem-codes)
  - [3. Bulk Message](#3-bulk-message)
  - [4. Ban Wave Tracker](#4-ban-wave-tracker)
- [Bot commands (79 · 11 categories)](#bot-commands-79--11-categories)
- [Ban waves — measured, not claimed](#ban-waves--measured-not-claimed)
- [Pricing](#pricing)
- [Become a reseller](#become-a-reseller)
- [1-day free trial](#1-day-free-trial)
- [WhatsApp bot](#whatsapp-bot)
- [How it works](#how-it-works)
- [Languages](#languages)
- [Frequently asked](#frequently-asked)
- [Links](#links)
- [About this repository](#about-this-repository)
- [License](#license)

---

## What is LordsRally?

LordsRally is a **Lords Mobile automation platform** that covers the whole lifecycle of running an account at scale: tracking, migration, war support, resource farming and player outreach.

It is not a single script. It is a platform of **79 commands across 11 categories**, grouped into four products:

| Product | What it does |
|---|---|
| **Bot packages** | Automated in-game actions — kingdom tracking, war assistance, wonder control, tile scanning, migration |
| **RSS accounts** | Ready-to-deliver Lords Mobile accounts and redeem codes, with balance-based ordering |
| **Bulk Message** | In-game mail advertising to Lords Mobile players — target by guild, kingdom or title, with delivery tracking and auto-reply |
| **Ban Wave Tracker** | Public, continuously measured record of Lords Mobile ban waves: timing, share of accounts affected, and recovery time |

**One account, one balance.** Registration is free. You top up a single USD balance, and every movement — top-ups, orders, refunds — is listed in your own transaction history so you can reconcile it yourself.

---

## The four products

### 1. Bot packages

A bot bound to your guild/kingdom runs the automation on schedule and **reports back** — you are never running blind.

| Automation area | What it covers |
|---|---|
| **Tracking** | Enemy castle movement, kingdom transfers, alliance changes, online/offline patterns |
| **War support** | Rally participation, troop coordination, target scanning |
| **Wonder control** | Wonder occupancy timing and defence scheduling |
| **Tiles & resources** | Resource tile scanning and farming routes |
| **Migration** | Kingdom transfer preparation and execution |
| **Inactive scan** | Finding inactive players for targeted outreach |
| **Scout** | Reconnaissance of target kingdoms and players |

Alerts are pushed to **WhatsApp** and **Telegram**. Add-ons (such as AI-generated player replies) can be attached to a package. You never hand over your game account — packages run on the platform's own bots.

👉 Detail: [`docs/bot-packages.md`](docs/bot-packages.md) · Live: [lordsrally.com/features](https://lordsrally.com/features)

### 2. RSS accounts & redeem codes

Buy prepared Lords Mobile accounts and redeem codes from a **balance-based shop**.

| | |
|---|---|
| **Accounts** | Prepared Lords Mobile accounts, delivered as credentials |
| **Redeem codes** | Codes you redeem in-game for the listed package |
| **Ordering** | Top up once; order from your balance; track status in your account |
| **No silent substitution** | If an item is unavailable, it is not swapped; if delivery cannot complete, the amount returns to your balance |

👉 Detail: [`docs/rss-accounts.md`](docs/rss-accounts.md) · Pricing: [`docs/rss-pricing.md`](docs/rss-pricing.md) · Live: [lordsrally.com](https://lordsrally.com)

### 3. Bulk Message

Send a message to many Lords Mobile players at once through **in-game mail**, and see who received it and who replied.

> This is not WhatsApp, Telegram or Discord spam. Delivery happens **inside Lords Mobile**, to game accounts, through game mail.

| Capability | What it does |
|---|---|
| **Targeting** | By guild, kingdom, title, saved lists or a pasted list — stackable, de-duplicated |
| **Mute-risk warning** | The editor flags wording that raises mute/ban risk |
| **Approval** | Every campaign is reviewed before it goes out |
| **Tracking** | Deliveries, failures with reasons, replies, CSV export, auto-reply |

Campaigns are paid in **credits** from your USD balance; the exact rate is shown **before you send**. Credit pricing is mirrored live in [`docs/pricing.md`](docs/pricing.md).

👉 Detail: [`docs/bulk-message.md`](docs/bulk-message.md) · Live: [lordsrally.com/bulk-message](https://lordsrally.com/bulk-message)

### 4. Ban Wave Tracker

Lords Mobile periodically bans bot accounts in **waves**. Most players only find out afterwards. LordsRally measures each wave from its own infrastructure and publishes:

- **When** the wave happened
- **How much** of a server's account pool was affected (a percentage — never an absolute count)
- **How long** recovery took with a spare account pool
- A 90-day **server × day heatmap** and a month-by-month archive

The same measurement drives the public page and the data in this repository, so the numbers are produced by **one** implementation.

👉 Live: [lordsrally.com/ban-waves](https://lordsrally.com/ban-waves) · Data: [`data/banwave.json`](data/banwave.json) · Docs: [`docs/ban-wave-tracker.md`](docs/ban-wave-tracker.md)

---

## Bot commands (79 · 11 categories)

The LordsRally bot exposes **79 commands across 11 categories**, each with localised names, arguments and help text in **7 languages**.

| Category | Commands | Covers |
|---|---|---|
| Tracking | 18 | Player and kingdom movement tracking |
| Kingdom | 11 | Kingdom-level queries and status |
| War | 10 | War and rally support |
| Tiles | 9 | Resource tiles and farming |
| Wonder | 9 | Wonder occupancy and control |
| Migration | 6 | Kingdom transfer |
| Search | 6 | Player search |
| Inactive scan | 3 | Finding inactive players |
| Scout | 3 | Reconnaissance |
| General | 2 | Shared utilities |
| Guild | 2 | Guild-level queries |
| **Total** | **79** | |

Each command takes arguments (player name, kingdom number, coordinates, …) and answers in your account's language. Commands are addressed to the platform's bot in the channel where it operates — WhatsApp or Telegram.

> The count above mirrors the live product. Command names, availability and arguments are always authoritative on the website.

👉 Full, current list: **[lordsrally.com/commands](https://lordsrally.com/commands)** · Detail: [`docs/commands.md`](docs/commands.md)

---

## Ban waves — measured, not claimed

Automation carries risk in any game. LordsRally publishes the **real, measured** risk instead of claiming safety.

**Latest measurement (auto-updated):**

<!-- BANWAVE:README:STATUS:START -->
**A wave is in progress.** Last wave started 2026-10-09 10:25 (+03:00) (0 day(s) ago). Waves in the last 30 days: **9**.
**Median recovery:** under 1 h across 22 measured server waves (15 estimated from logs).
<!-- BANWAVE:README:STATUS:END -->

**Last wave at a glance:**

<!-- BANWAVE:README:LATEST:START -->
| Field | Value |
|---|---|
| Last wave | 2026-10-09 10:25 (+03:00) |
| Wave ended | 2026-10-09 10:34 (+03:00) |
| Days ago | 0 |
| Servers hit | 4 |
| Impact | 59% |
| Severity | heavy |
| Duration | 10 min |
| Recovery | ongoing (8 h 44 min) |

Full history and the live heatmap: **[lordsrally.com/ban-waves](https://lordsrally.com/ban-waves)**.
<!-- BANWAVE:README:LATEST:END -->

**Recent waves:**

<!-- BANWAVE:README:WAVES:START -->
| Wave start (UTC+3) | Servers | Impact | Severity | Duration | Recovery |
|---|---|---|---|---|---|
| 2026-10-09 10:25 (+03:00) | 4 | 59% | heavy | 10 min | ongoing (8 h 44 min) |
| 2026-09-30 11:38 (+03:00) | 4 | 41% | heavy | 47 min | complete (55 min) |
| 2026-09-24 12:10 (+03:00) | 1 | 3.9% | light | 1 min | complete (6 min, est.) |
| 2026-09-21 22:00 (+03:00) | 1 | 2.3% (est.) | light | 1 min | recovered |
| 2026-09-21 20:55 (+03:00) | 1 | 0.8% (est.) | light | 1 min | recovered |
| 2026-09-21 11:45 (+03:00) | 4 | 28% | heavy | 11 min | recovered |
| 2026-09-21 11:02 (+03:00) | 3 | 27% | heavy | 7 min | recovered |
| 2026-09-16 12:33 (+03:00) | 4 | 51% | heavy | 30 min | recovered |
| 2026-09-10 12:38 (+03:00) | 4 | 23% (est.) | heavy | 2 min | recovered |
| 2026-09-09 10:38 (+03:00) | 2 | 4.7% | light | 1 min | complete (6 min, est.) |
| 2026-09-08 04:43 (+03:00) | 2 | 1.6% | light | 3 min | complete (8 min, est.) |
| 2026-09-03 11:17 (+03:00) | 2 | 3.1% | light | 1 min | complete (6 min, est.) |
| 2026-09-01 13:14 (+03:00) | 1 | 2.3% (est.) | light | 1 min | recovered |
| 2026-09-01 08:44 (+03:00) | 2 | 53% | heavy | 13 min | recovered |
| 2026-08-17 08:38 (+03:00) | 1 | 0.8% | light | 1 min | complete (5 min, est.) |
| 2026-08-13 05:59 (+03:00) | 2 | 100% | heavy | 6 min | recovered |
| 2026-08-12 20:15 (+03:00) | 2 | 1.6% (est.) | light | 1 min | recovered |
| 2026-08-12 11:43 (+03:00) | 2 | 100% (est.) | heavy | 8 min | recovered |
<!-- BANWAVE:README:WAVES:END -->

**Monthly history:**

<!-- BANWAVE:README:MONTHS:START -->
| Month | Waves | Highest impact |
|---|---|---|
| 2026-10 | 1 | 59% |
| 2026-09 | 13 | 53% |
| 2026-08 | 4 | 100% |
<!-- BANWAVE:README:MONTHS:END -->

**Honest by design:** where a value could not be measured it is marked as an **estimate**; recovery is shown as a duration only when the evidence supports it; and only **shares** are published, never absolute account counts. Servers are anonymised.

> 🔄 These blocks are updated automatically by the `Public data sync` workflow. Human-readable tables live in [`docs/ban-wave-tracker.md`](docs/ban-wave-tracker.md); machine-readable data in [`data/banwave.json`](data/banwave.json).

---

## Pricing

Prices are **sell prices in USD**, mirrored automatically from the platform's public price feed. The live checkout is always authoritative.

**Packages (sell price per month):**

<!-- PRICING:README:SUMMARY:START -->
| Package | Detection speed | Sell price (per month) |
|---|---|---|
| **FAST x1** | 30–40 s | $40.00 |
| **FAST ULTRA** | 1–3 s | $60.00 |

| Add-on | Sell price per month |
|---|---|
| Scout Bot | $20.00 |
| Guild Chat Bot | $10.00 |
<!-- PRICING:README:SUMMARY:END -->

**Bulk Message credits:**

<!-- PRICING:README:CREDITS:START -->
| Credit package | Credits | Sell price | Validity | Price per 1,000 credits |
|---|---|---|---|---|
| Starter | 5000 | $45.00 | 30 days | $9.00 |
| Standard | 20000 | $175.00 | 30 days | $8.75 |
| Pro | 50000 | $430.00 | 30 days | $8.60 |
| Business | 100000 | $850.00 | 30 days | $8.50 |
| Enterprise | 200000 | $1,690.00 | 30 days | $8.45 |

<!-- PRICING:README:CREDITS:END -->

👉 Full price list, terms and add-ons: [`docs/pricing.md`](docs/pricing.md) · RSS products: [`docs/rss-pricing.md`](docs/rss-pricing.md) · Live: [lordsrally.com/buynow](https://lordsrally.com/buynow)

<!-- PRICING:README:UPDATED -->
_Last updated: 2026-10-09 — prices are always live on **https://lordsrally.com/buynow** with **USD** amounts below._

---

## Become a reseller

Sell LordsRally to your own customers at a price **you** set, and keep the difference. The public [salesman page](https://lordsrally.com/salesman) shows the customer price and the commission a reseller earns.

<!-- RESELLER:README:TABLE:START -->
| Package | Term | Customer price | Your commission |
|---|---|---|---|
| FAST x1 | 1 mo | $40.00 | 16.68% |

See the full table in [`docs/reseller.md`](docs/reseller.md).
<!-- RESELLER:README:TABLE:END -->

<!-- RESELLER:README:LEVEL:START -->
New resellers start at the **Normal** level. The tier system is currently **on**; commission follows the level shown on **[lordsrally.com/salesman](https://lordsrally.com/salesman)**.

<!-- RESELLER:README:LEVEL:END -->

👉 Detail: [`docs/reseller.md`](docs/reseller.md) · Live: [lordsrally.com/salesman](https://lordsrally.com/salesman)

<!-- RESELLER:README:UPDATED -->
_Last updated: 2026-10-09 — customer prices are USD. Your current commission is always live at **https://lordsrally.com/salesman**._

---

## 1-day free trial

Try before you buy.

1. Go to **[lordsrally.com](https://lordsrally.com)**.
2. Create your free account.
3. Press the **Demo** button (*See Live Demo*).

You get a full day to run the bot against your own guild/kingdom and watch the alerts arrive. The **live demo** needs no account at all — it shows real command output as it looks on WhatsApp and Telegram.

👉 Detail: [`docs/free-trial.md`](docs/free-trial.md)

---

## WhatsApp bot

Alerts and command output are delivered over **WhatsApp** as well as Telegram, so the event reaches you where you already are.

- **Automatic alerts** — castle detected, shield drop, rally/war activity, player movement.
- **Command output** — the result of the commands you run.
- **Connect via the site** — the **WhatsApp** button on [lordsrally.com](https://lordsrally.com).

> 📱 A contact number is **never published** on public surfaces, including this repository. Everything starts from the website, by design.

👉 Detail: [`docs/whatsapp-bot.md`](docs/whatsapp-bot.md)

---

## How it works

| Step | What happens |
|---|---|
| **1. Register** | One free account for every product. |
| **2. Top up** | One USD balance; the available payment rails are listed live in your account. |
| **3. Choose** | Pick a bot package, an RSS product or a Bulk Message campaign. |
| **4. Run** | The bot is bound to your guild/kingdom and runs on schedule. |
| **5. Watch** | Alerts arrive on WhatsApp/Telegram; delivery and order status stay in your account. |

👉 Detail: [`docs/how-it-works.md`](docs/how-it-works.md)

---

## Languages

The whole platform — bot commands, help text and delivery notifications — runs in **7 languages**:

🇹🇷 Turkish · 🇬🇧 English · 🇪🇸 Spanish · 🇵🇹 Portuguese · 🇷🇺 Russian · 🇮🇩 Indonesian · 🇻🇳 Vietnamese

---

## Frequently asked

**Do I have to give you my game account?**
No. Packages run on the platform's own bots bound to your guild/kingdom.

**Is Bulk Message WhatsApp/Telegram spam?**
No. Delivery is **in-game mail inside Lords Mobile**, to game accounts. Nothing is sent to anyone's personal messenger.

**Is automation detectable?**
Every automation carries risk in any game. We publish the **real, measured** ban data instead of claiming it is safe → [ban wave tracker](https://lordsrally.com/ban-waves).

**Do I need separate accounts for the products?**
No. One account, one USD balance, shared across everything.

**Can I resell it?**
Yes — join the reseller programme and keep your margin → [reseller](docs/reseller.md).

**Where do the numbers in this repository come from?**
From the platform's own public data endpoints, mirrored automatically and stamped with the last sync date. Values that cannot be measured are marked as estimates; nothing is invented.

👉 More: [`docs/faq.md`](docs/faq.md)

---

## Links

- 🌐 Website — https://lordsrally.com
- 🤖 Bot commands — https://lordsrally.com/commands
- 📦 Bot packages & features — https://lordsrally.com/features
- 🌊 Ban wave tracker — https://lordsrally.com/ban-waves
- 🏰 Kingdoms — https://lordsrally.com/kingdoms
- 💬 Bulk Message — https://lordsrally.com/bulk-message
- 🧑‍💼 Reseller (salesman) — https://lordsrally.com/salesman
- 🛒 Buy now — https://lordsrally.com/buynow
- 📰 Blog — https://lordsrally.com/blog
- 🔒 Privacy — https://lordsrally.com/privacy

---

## About this repository

This repository is the **public showcase** of the LordsRally platform: documentation, the ban wave tracker data and public reference material. It contains **no application source code**.

Everything under `data/` and the marked blocks in `README.md` and `docs/` are **generated automatically** from the platform's public data endpoints by GitHub Actions workflows. If an endpoint cannot be read, the previous document is preserved and the workflow fails loudly — you never see a silently emptied page.

- [`docs/ban-wave-tracker.md`](docs/ban-wave-tracker.md) — human-readable ban wave data
- [`data/banwave.json`](data/banwave.json) — machine-readable ban wave data
- [`docs/pricing.md`](docs/pricing.md) · [`docs/rss-pricing.md`](docs/rss-pricing.md) · [`docs/reseller.md`](docs/reseller.md) — price mirrors
- [`docs/security.md`](docs/security.md) — security & honesty

---

## License

Documentation and data in this repository are published for reference and citation.
See [LICENSE](LICENSE).

<!-- BANWAVE:README:UPDATED -->
_Last updated: 2026-10-09 — source: /ban-waves_
