# Zero Employee Studio OS

![Version](https://img.shields.io/badge/version-0.3.0-indigo?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Python](https://img.shields.io/badge/python-3.14-blue?style=flat-square)
![React](https://img.shields.io/badge/react-18-61dafb?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)

> **An autonomous business operating system that runs a complete creative agency with zero human employees.**

Four AI agents handle everything from client intake to creative delivery — in under 3 seconds.

---

## 🎯 What It Does

Zero Employee Studio OS automates the entire creative agency workflow:

1. **📋 Client submits a brief** → Intake Agent analyzes requirements
2. **🔍 AI analyzes needs** → Business type, tone, style preferences detected
3. **💰 Pricing Agent calculates** → Optimal package and price with margins
4. **💳 Stripe Agent processes** → Checkout session and payment simulation
5. **🎨 Creative Agent generates** → Logo, website, social media, brand identity
6. **✅ Client receives complete package** → Zero human intervention

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                │
│              http://localhost:5173                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Dashboard │ │ Generate │ │  Clients │ │ Settings │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────┐
│                    Backend (FastAPI)                      │
│              http://localhost:8000                        │
│  ┌─────────────────────────────────────────────────────┐│
│  │              API Router & Middleware                 ││
│  └──┬──────────┬──────────┬──────────┬────────────────┘│
│     │          │          │          │                   │
│  ┌──▼──┐   ┌──▼──┐   ┌──▼──┐   ┌──▼──┐               │
│  │Intake│   │Pric-│   │Stri-│   │Crea-│               │
│  │Agent │   │ing  │   │pe   │   │tive │               │
│  │      │   │Agent│   │Agent│   │Agent│               │
│  └──────┘   └─────┘   └─────┘   └─────┘               │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │           In-Memory Session Store                   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.14+
- Node.js 18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-team/zero-employee-studio.git
cd zero-employee-studio
```

### 2. Start the Backend

```bash
cd backend
pip install fastapi uvicorn pydantic
python main.py
# Backend runs on http://localhost:8000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Open the Dashboard

Navigate to `http://localhost:5173` and click **Live Demo** to see the full workflow.

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API root and info |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze-brief` | Analyze client brief (Intake Agent) |
| `POST` | `/api/calculate-pricing` | Calculate pricing (Pricing Agent) |
| `POST` | `/api/create-checkout` | Create Stripe checkout (Stripe Agent) |
| `GET` | `/api/payment-status/{id}` | Check payment status |
| `POST` | `/api/generate-creative` | Generate creative package (Creative Agent) |
| `GET` | `/api/generation-progress/{id}` | Track generation progress |
| `GET` | `/api/clients` | List all clients |
| `GET` | `/api/clients/{id}` | Get client details |
| `DELETE` | `/api/clients/{id}` | Delete a client |
| `POST` | `/api/clients/{id}/full-workflow` | Run complete workflow |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/dashboard/activity` | Recent activity |
| `GET` | `/api/demo/brief-example` | Get demo brief |
| `GET` | `/api/demo/run-complete` | Run full demo workflow |

### Example Request

```bash
# Analyze a brief
curl -X POST http://localhost:8000/api/analyze-brief \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "Italian restaurant needs a website, logo, and social media content",
    "client_name": "Mario'\''s Kitchen",
    "client_email": "mario@example.com"
  }'
```

---

## 🤖 AI Agents

### 1. Intake Agent
- **Purpose**: Analyzes client briefs and extracts structured requirements
- **Detects**: Business type, needs, tone, style preferences, target audience
- **Scores**: Brief quality (0-100) with improvement suggestions
- **Technology**: Nemotron 3 Ultra (via OpenRouter) / Rule-based MVP

### 2. Pricing Agent
- **Purpose**: Calculates optimal pricing based on requirements
- **Features**: Dynamic packages, volume discounts, add-on suggestions
- **Packages**: Starter ($299), Business ($499), Premium ($999), Enterprise ($1999)
- **Calculates**: Costs, margins, ROI, and delivery timeline

### 3. Stripe Agent
- **Purpose**: Handles payment processing and checkout
- **Features**: Session creation, status tracking, webhook simulation
- **Supports**: Pending, processing, paid, failed, refunded, cancelled states
- **Simulates**: Complete Stripe Checkout flow for demo

### 4. Creative Agent
- **Purpose**: Generates complete creative deliverables
- **Deliverables**: Logo, website, social media, brand identity, marketing copy
- **Templates**: Restaurant, Tech, Agency, Retail, Healthcare, Education
- **Output**: SVG, PNG, PDF formats with brand guidelines

---

## 🛠️ Technologies

### Backend
- **Python 3.14** — Latest Python runtime
- **FastAPI** — High-performance async API framework
- **Pydantic** — Data validation and serialization
- **Uvicorn** — ASGI server

### Frontend
- **React 18** — UI library with hooks
- **Vite** — Fast build tool and dev server
- **Tailwind CSS** — Utility-first CSS framework
- **Axios** — HTTP client

### Design System
- **Custom CSS** — Premium design tokens and animations
- **Dark Mode** — Native dark theme
- **Responsive** — Mobile, tablet, desktop support
- **Glassmorphism** — Modern glass-effect UI components

---

## 📁 Project Structure

```
zero-employee-studio/
├── README.md                    # This file
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── demo_brief.json          # Demo client brief
│   └── requirements.txt         # Python dependencies
├── agents/
│   ├── intake_agent.py          # Brief analysis agent
│   ├── pricing_agent.py         # Pricing calculation agent
│   ├── stripe_agent.py          # Payment processing agent
│   └── creative_agent.py        # Creative generation agent
└── frontend/
    ├── index.html               # Entry HTML
    ├── package.json             # Node.js dependencies
    ├── tailwind.config.js       # Tailwind configuration
    ├── public/
    │   └── presentation.html    # Hackathon presentation page
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Main application (all pages)
        ├── App.css              # Base styles
        └── styles/
            └── premium.css      # Premium design system
```

---

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366f1) — Main actions and accents
- **Secondary**: Purple (#8b5cf6) — Highlights and badges
- **Accent**: Pink (#ec4899) — Special emphasis
- **Success**: Emerald (#10b981) — Positive states
- **Background**: Dark (#030712) — Base background

### Typography
- **Headings**: System font stack with -apple-system
- **Body**: Inter / system-ui
- **Code**: JetBrains Mono / monospace

### Components
- Glass cards with backdrop-blur
- Gradient text effects
- Animated progress bars
- Status badges with color coding
- Responsive sidebar navigation

---

## 📊 Business Model

### Revenue Potential
| Package | Price | Cost | Margin |
|---------|-------|------|--------|
| Starter | $299 | $50 | 83% |
| Business | $499 | $50 | 90% |
| Premium | $999 | $75 | 92% |
| Enterprise | $1,999 | $100 | 95% |

### Scalability
- **0 employees** → Fixed costs = $0
- **100 projects/month** → $50,000 revenue
- **1,000 projects/month** → $500,000 revenue
- **Cost per project**: ~$50 (AI + infrastructure)

---

## 🏆 Hackathon Highlights

- ✅ **Zero human employees** — Fully autonomous operation
- ✅ **4 AI agents** — Intake, Pricing, Stripe, Creative
- ✅ **< 3 second workflow** — From brief to delivery
- ✅ **91%+ profit margins** — Minimal cost structure
- ✅ **Professional UI** — Startup-quality design
- ✅ **Interactive demo** — One-click workflow execution
- ✅ **RESTful API** — Documented with OpenAPI/Swagger
- ✅ **Responsive design** — Works on all devices
- ✅ **Dark mode** — Native dark theme
- ✅ **Presentation page** — Vercel/Linear-style landing

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for Hackathon 2026
- Powered by Nemotron 3 Ultra (via OpenRouter)
- Payment processing by Stripe
- UI inspired by Vercel, Linear, and Stripe

---

<p align="center">
  <strong>Zero Employee Studio OS</strong> — The future of creative agencies is autonomous.<br>
  <em>Built by the Zero Employee Studio Team</em>
</p>
