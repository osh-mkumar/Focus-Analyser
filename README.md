# 🧠 Focus Analyzer

Focus Analyzer is a **privacy-first Chrome extension + web app** that helps users understand **why their focus breaks**, not just how much time they spend online.
It analyzes **tab-switching behavior** and explains attention patterns using **behavioral reasoning and AI**.

---

## 🚩 Problem

Most productivity tools only show **screen time statistics**.
They fail to explain the **behavioral reasons** behind loss of focus, frequent context switching, and mental fatigue.

Users are left with numbers — not understanding.

---

## 💡 Solution

Focus Analyzer observes **high-level browsing behavior** and identifies patterns such as:

* 🟢 Deep work periods
* 🔴 Fragmented attention
* 🔁 Repeated switching loops

It then uses AI reasoning to **explain these patterns in probabilistic, non-judgmental language**, helping users build awareness instead of guilt.

---

## 🧩 How It Works

### 1. Chrome Extension (Data Collection)

* Tracks **active tab domains and timestamps only**
* No keystrokes, no content inspection
* Manual **Start Tracking** control
* Data stored locally until user submits

### 2. Backend (Pattern Detection)

* Groups activity into focus vs fragmented periods
* Detects repeated domain-switching loops
* Prepares structured behavioral signals

### 3. AI Reasoning Layer (Gemini)

* Uses Gemini to explain *why* patterns likely occurred
* Uses probabilistic language (e.g., “likely suggests”, “may indicate”)
* Never diagnoses or judges the user

### 4. Frontend (User Experience)

* Clean dashboard with timelines and summaries
* Zen / Drill personality modes (tone only)
* Confidence level instead of certainty
* Light & Dark mode support

---

## 🛡️ Privacy & Ethics (Core Design Choice)

* No reminders, blocking, or punishment
* No background surveillance
* No personal data or content tracking
* Explicit user consent
* Ethical, explainability-first AI

> The goal is **self-awareness**, not control.

---

## ⚠️ Gemini Availability Note

Gemini access depends on project-level API permissions and network conditions.
To ensure reliability, the system is designed to **degrade gracefully** when the AI model is unavailable — never crashing or hallucinating results.

This reflects **real-world AI reliability constraints**.

---

## 🧪 Tech Stack

* **Frontend:** React + Vite
* **Backend:** Node.js + Express
* **AI:** Google Gemini (Generative Language API)
* **Extension:** Chrome Extension (Manifest V3)
* **Styling:** CSS Variables (Light/Dark Mode)

---

## 🚀 Running Locally

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🔮 Future Scope

* Personalized focus insights
* Accessibility-friendly explanations (parents, elderly users)
* ADHD-aware productivity tools
* Workplace focus analytics (privacy-safe)
* Cross-device behavioral summaries

---

## 🏆 Why This Matters

Focus Analyzer doesn’t tell users *what to do*.
It helps them understand **what happened and why** — responsibly, ethically, and transparently.

