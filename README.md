# Maison Noir — Haute Parfumerie Store, Kaggle ML Scent Engine & n8n AI Automation

🌐 **Live Demo:** [MAISON NOIR · Haute Parfumerie & AI Scent Atelier](https://maison-noir-store.vercel.app/)

**Maison Noir** is a full-stack luxury fragrance e-commerce platform powered by a **hybrid Machine Learning recommender engine** and **n8n Cloud AI automation workflows** with **Google Gemini 2.0 Flash**.

Instead of relying on an LLM to guess products (which can cause hallucinations), Maison Noir uses a **deterministic TF-IDF + Cosine Similarity + Multi-Constraint ML Engine** to score and rank an 18-bottle flagship catalog enriched with Kaggle community ratings and Jungian psychological archetypes, then orchestrates **n8n Cloud workflows** to compose bespoke sensory copywriting and power **Layla Noor**, a bilingual (English/Arabic) AI Fragrance Concierge.

---

## Key Features

### 1. Kaggle ML Scent & Psychological Recommender (`backend/ml/recommender.js`)
- **Sublinear TF-IDF Vectorization & Cosine Similarity:** Tokenizes olfactory pyramids (top/heart/base notes), tactile fabric descriptors, sensory memories, and psychological traits using $(1 + \ln(\text{tf})) \cdot \text{idf}$ weighting and L2-normalized cosine similarity.
- **Domain Query Expansion:** Maps emotional, personality, and tactile keywords (*cozy*, *introvert*, *leader*, *cashmere*, *boozy*, *smoky*) into weighted accord vectors.
- **Multi-Constraint Scoring:** Applies structured boosts and penalties across **Season** (Winter vs. Summer), **Gender** (Pour Homme, Pour Femme, Unisex), **Beast-Mode Sillage**, **Tier** (Niche vs. Designer), and **Kaggle Community Ratings**.
- **18 Jungian Scent Archetypes:** Profiles every user into archetypes such as *The Quiet Sovereign*, *The Nocturnal Hedonist*, *The Mediterranean Aristocrat*, *The Velvet Mystic*, and *The Crystalline Icon*.

### 2. Layla Noor — Bilingual AI Fragrance Concierge (`backend/chat.js` & `ChatbotWidget.jsx`)
- **6-Step Psychological & Gender Calibration Quiz:** Interactive step-by-step profiling covering *Gender & Olfactory Expression*, *Unspoken Room Presence*, *Inner Emotional Anchor*, *Sensory Memory & Chronotype*, *Tactile Fabric Affinity*, and *Sillage Distance*.
- **Live ML Telemetry Header:** Synchronizes Season, Gender, Sillage pills, top accord percentage bars, and confidence states (`READY` → `CALIBRATING` → `HIGH`) in real time as you chat.
- **Head-to-Head Bottle Comparator & Encyclopedia:** Ask about any bottle or compare two fragrances side by side with interactive product cards and direct **Add to Bag** actions.
- **Bespoke Formula Composer:** Generates custom *Extrait de Parfum (30%)* formulas (`"L'Âme Secrète"`) with top/heart/base percentages and IFRA maceration guidance.
- **Full Bilingual Support:** Automatic English & Arabic (`[\u0600-\u06FF]`) detection and response generation.

### 3. Multi-Workflow n8n Cloud Automation (`n8n/`)
- **Workflow 5 — Master Nose Copywriter (`n8n/workflow 5/My workflow 5.json`):** Webhook-triggered LangChain + **Google Gemini 2.0 Flash** pipeline with a `Safe Parse & Error Guard` code node that writes a structured 3-part consultation (*The Scent Diagnosis*, *The Reveal*, *The Guarantee*).
- **Workflow 6 — Layla Noor Conversational Agent (`n8n/chatbot assitace/My workflow 6.json`):** LangChain Chat Trigger + Gemini 2.0 Flash + `Simple Memory` window buffer (`contextWindowLength: 10`) trained on the 18-bottle Maison Noir collection.
- **Workflow 7 — Personalized Gmail Marketing & Order Dispatcher (`n8n/email sender/My workflow 7.json`):** Webhook (`POST /webhook/maison-noir-emails`) → `Split Recipients` (`body.recipients`) → `Write Personalized Email` (LangChain + Gemini 2.0 Flash + `Email Format` structured output parser) → `Send an Email` via Gmail SMTP (`muhamedgad444@gmail.com`) to any email address the client enters. Automatically dispatches tailored emails on order checkout, Master Nose consultations, and batch VIP campaigns.
- **Automated SMTP Error Alerting (`n8n/workflow 5/Error Alert - My workflow 5.json`):** Dedicated `Error Trigger` workflow linked via `errorWorkflow` that emails diagnostic details (workflow name, failing node, error message, Cairo timestamp, and execution link) on failure.
- **Programmatic Workflow Builder (`n8n/build-workflow.mjs`):** Node.js script that generates `n8n/master-nose.workflow.json` with `x-api-secret` header verification and output guardrails.

---

## Project Structure

```text
Maison-Noir-store/
├── front end/                      # React 19 + Vite + Tailwind CSS + Framer Motion UI
│   ├── public/                     # Perfume bottle imagery & static assets
│   └── src/
│       ├── components/
│       │   ├── ChatbotWidget.jsx       # Layla Noor AI Concierge & Live ML Telemetry UI
│       │   ├── MasterNoseModal.jsx     # Bespoke AI Scent Consultation Modal
│       │   ├── ProductCard.jsx         # Luxury 3D-tilt product cards
│       │   ├── ProductDetail.jsx       # Olfactory pyramid & size selector drawer
│       │   ├── CheckoutPanel.jsx       # Slide-over shopping bag, checkout & automatic Gmail confirmation
│       │   ├── Navbar.jsx              # Navigation & collection filters
│       │   └── CustomCursor.jsx        # Interactive luxury cursor
│       ├── data/
│       │   └── products.js             # 18-bottle catalog with notes, prices & metadata
│       └── App.jsx                     # Main storefront layout & state management
├── backend/                            # Zero-dependency Node.js HTTP API + ML Engine
│   ├── ml/
│   │   └── recommender.js              # Kaggle Persona Matrix, TF-IDF & Cosine Recommender
│   ├── chat.js                         # Layla Noor session engine, 6-step quiz & n8n bridge
│   ├── compose.js                      # Master Nose n8n webhook client & local fallback
│   ├── email.js                        # n8n Workflow 7 Gmail webhook client & HTML preview
│   ├── server.js                       # REST API (/api/recommend, /api/chat, /api/orders, /api/emails)
│   └── .env.example                    # Environment variable template
└── n8n/                                # n8n Cloud AI Automation Workflows
    ├── workflow 5/
    │   ├── My workflow 5.json              # Master Nose Gemini 2.0 Flash webhook workflow
    │   └── Error Alert - My workflow 5.json # Automated SMTP error alert workflow
    ├── chatbot assitace/
    │   └── My workflow 6.json              # Layla Noor Chat Trigger + Memory workflow
    ├── email sender/
    │   └── My workflow 7.json              # Personalized Gmail Marketing & Order Dispatcher
    ├── master-nose.workflow.json   # Code-built Master Nose workflow
    └── build-workflow.mjs          # Script to regenerate master-nose.workflow.json
```

---

## Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/muhamedgad444-netizen/Maison-Noir-store.git
cd Maison-Noir-store
```

### 2. Configure & Start the Backend API (`http://localhost:5000`)
```bash
cd backend
cp .env.example .env
# Edit .env with your n8n Cloud webhook URLs (or leave blank to use the built-in local ML synthesis)
npm start
```

### 3. Start the Frontend Storefront (`http://localhost:5173`)
```bash
cd "../front end"
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/recommend` | Scores client profile (`season`, `texture`, `vibe`, `tier`, `persona`, `memory`, `fabric`) via the Kaggle ML engine, composes a 3-part narrative via **n8n Workflow 5**, and logs telemetry to **Supabase** (`recommendation_events`). |
| `POST` | `/api/chat` | Powers **Layla Noor** (`chatInput`, `sessionId`, `reset`, `mlConstraints`), persisting session memory in **Supabase** (`chat_sessions`) and logging recommended bottles (`recommendation_events`). |
| `POST` | `/api/orders` | Saves completed storefront orders (`order_code`, customer details, shipping, items JSONB, and `grand_total`) into **Supabase** (`public.orders`) and automatically dispatches a personalized confirmation email via **n8n Workflow 7**. |
| `GET` | `/api/orders` | Retrieves the most recent orders from **Supabase** (`public.orders`). |
| `POST` | `/api/emails` | Triggers **n8n Workflow 7 (`maison-noir-emails`)** with `{ recipients: [{ name, email, notes }] }` to compose personalized HTML emails with Gemini and send them from `muhamedgad444@gmail.com` to any client email address. |

---

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **Backend & ML:** Node.js (ESM), Custom TF-IDF & Cosine Similarity Recommender, Kaggle Fragrance Persona Profiles
- **Database:** Supabase (PostgreSQL 17 with Row-Level Security) — `orders`, `chat_sessions`, `recommendation_events`
- **AI & Automation:** n8n Cloud, Google Gemini 2.0 Flash, LangChain Agent & Window Buffer Memory, SMTP Error Alerting
