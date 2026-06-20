# RankFix AI — Hackathon Demo Script (1-3 min)

> **Concept:** Split-screen — gauche : site web, droite : Dashboard Hermes tool calls en direct

---

## 🎬 Scene 1 — Opening (15s)

**Voiceover:**
> "Meet RankFix AI — an autonomous agent that checks if your website is visible on Google *and* AI search engines. Powered by Hermes Agent, NVIDIA Nemotron 3, and Stripe."

**Split screen:**
- Gauche : `rankfix-ai.netlify.app` — hero page avec radar animation
- Droite : Dashboard Hermes `:9119` — "Sessions" page

---

## 🎬 Scene 2 — The Scan (30s)

**Action:** Type `yoursite.com` → click **"Scan My Site"**

**Voiceover:**
> "Enter any URL. RankFix AI scans four dimensions: technical SEO, AI search visibility on ChatGPT and Gemini, trust signals, and content quality. All powered by Nemotron 3."

**Split screen:**
- Gauche : Loading state avec animation radar → Résultats apparaissent
- Droite : Dashboard Hermes — tool calls défilent (curl, openssl, etc.)
  - POST /audit
  - GET /status (polling)
  - curl robots.txt, ssl check, meta tags

**Key moment:** Le score gauge apparaît et la barre de progression s'anime

---

## 🎬 Scene 3 — Results & Action Plan (25s)

**Voiceover:**
> "The agent instantly generates a score, highlights the top issues, and prioritizes fixes by impact — so you know exactly what to do first."

**Zoom sur:**
- Score gauge (ex: 56/100 en amber)
- Issues list avec alertes rouges
- Action plan avec priorité #1, #2, #3
- "Click for details" sur une action

---

## 🎬 Scene 4 — Stripe Checkout (20s)

**Voiceover:**
> "Need the full report with detailed recommendations? One click takes you to Stripe Checkout — 19 euros. Or subscribe for weekly monitoring at 29 euros per month."

**Action:** Click **"Full Report — $19"**
- Split screen : site → Stripe Checkout page (ou simulated checkout)
- Retour : "Payment successful" + accès au rapport complet

**Key moment:** Voir le flow Stripe Checkout complet

---

## 🎬 Scene 5 — Autonomous Monitoring (20s)

**Voiceover:**
> "Once subscribed, RankFix AI monitors your site automatically. Every week, it re-scans and alerts you if something changes. No dashboards to check — the agent comes to you."

**Split screen:**
- Gauche : Interface du rapport chronologique
- Droite : Dashboard Hermes — onglet "CRON" avec le job `rankfix-weekly-monitor`
  - "Last run: 10 min ago — Score: 58/100 (✅ +2 pts)"
  - "Next run: in 10 minutes"

---

## 🎬 Scene 6 — Closing (10s)

**Voiceover:**
> "RankFix AI — built with Hermes Agent, NVIDIA Nemotron 3, and Stripe. Your visibility, automated."

**Full screen:** URL du site + logos (Hermes × NVIDIA × Stripe)

---

## 📋 Shot List

| Shot | Duration | Content | Screen |
|------|----------|---------|--------|
| 1 | 15s | Landing page + Hero | Full site |
| 2 | 30s | URL input → Loading → Results | Split: site + Dashboard |
| 3 | 25s | Score, Issues, Actions | Focus on results section |
| 4 | 20s | Stripe Checkout flow | Split: site → Stripe |
| 5 | 20s | Cron monitoring + Dashboard | Split: site + Cron tab |
| 6 | 10s | Closing frame | URL + logos |

**Total: 2min 00s** (adjustable)

---

## 🛠 Setup Checklist

- [ ] Frontend accessible via Tailscale (http://100.96.186.49:5173/)
- [ ] Backend running (:8000) avec audit
- [ ] Dashboard Hermes (:9119) ouvert sur l'onglet Sessions
- [ ] Cron job actif (toutes les 10 min)
- [ ] Stripe Checkout fonctionnel (simulated mode OK)
- [ ] Enregistrement: OBS Studio split-screen
- [ ] Audio: Microphone + background music
