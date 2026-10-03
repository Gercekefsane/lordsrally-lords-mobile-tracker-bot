# LordsRally — Lords Mobile Tracking Bot & Automation Platform

**LordsRally** is a Lords Mobile bot platform: automated kingdom tracking, ready-to-use accounts, in-game bulk messaging and a public ban wave tracker — all measured transparently.

> 🌐 Website: **[lordsrally.com](https://lordsrally.com)** · 7 languages (TR · EN · ES · PT · RU · ID · VI)

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

---

## Bot commands (79 commands · 11 categories)

| Category | Commands |
|---|---|
| Tracking | 18 |
| Kingdom | 11 |
| War | 10 |
| Tiles | 9 |
| Wonder | 9 |
| Migration | 6 |
| Search | 6 |
| Inactive scan | 3 |
| Scout | 3 |
| General | 2 |
| Guild | 2 |

Every command is documented with its arguments, help text and localised names in **7 languages**.
👉 Full command list: **[lordsrally.com/commands](https://lordsrally.com/commands)**

---

## Ban Wave Tracker

Lords Mobile periodically bans bots in waves. Most players only notice after the fact.

The **[LordsRally Ban Wave Tracker](https://lordsrally.com/ban-waves)** measures each wave from our own infrastructure and publishes:

- **When** the wave happened
- **How much** of a server's account pool was affected (percentage)
- **How long** recovery took with a spare account pool
- A 90-day **server × day heatmap** and a month-by-month archive

**Live data in this repository:** [`docs/ban-wave-tracker.md`](docs/ban-wave-tracker.md) — automatically updated whenever the measured data changes. Machine-readable form: [`data/banwave.json`](data/banwave.json).

> **Honest by design:** where a value could not be measured, it is marked as an estimate — we do not publish invented numbers. Recovery figures are only shown as a duration when the evidence supports it.

---

## Why players and guilds use it

- **Transparent measurements** — the ban wave tracker is public and shows its own methodology caveats.
- **No fake numbers** — untraceable claims are not made anywhere on the platform.
- **Multi-language** — TR · EN · ES · PT · RU · ID · VI.
- **One account, one balance** — the platform uses a single account and USD balance across all products.

---

## Links

- 🌐 Website — https://lordsrally.com
- 🤖 Bot commands — https://lordsrally.com/commands
- 📦 Bot packages & features — https://lordsrally.com/features
- 🌊 Ban wave tracker — https://lordsrally.com/ban-waves
- 🏰 Kingdoms — https://lordsrally.com/kingdoms
- 💬 Bulk Message — https://lordsrally.com/bulk-message
- 📰 Blog — https://lordsrally.com/blog

---

## About this repository

This repository is the **public showcase** of the LordsRally platform: documentation, the ban wave tracker data and public reference material. It contains **no application source code**.

The ban wave file is updated automatically from the platform's public data endpoint.

## License

Documentation and data in this repository are published for reference and citation.
See [LICENSE](LICENSE).
