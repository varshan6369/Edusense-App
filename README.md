# EduSense AI Student Analytics — Setup & Handoff Manual

This repository contains the complete **EduSense AI Student Analytics** web application built with React, Vite, TypeScript, Tailwind CSS (v4), and Gemini AI integration.

---

## 🚀 How to Transfer & Open on a New Device / IDE

### Option 1: Direct Import via Git (Recommended)

1. Open your terminal or IDE (Cursor, VS Code, Antigravity, Replit, bolt.new, etc.) on the new device.
2. Clone the repository:
   ```bash
   git clone https://github.com/varshan6369/edusense-ai-student-analytics.git
   ```
3. Navigate into the folder:
   ```bash
   cd edusense-ai-student-analytics
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Launch the local development server:
   ```bash
   npm run dev
   ```
6. Open your browser to `http://localhost:3000`.

---

### Option 2: Giving Instructions to an AI Assistant on Your New Device

If you open an AI Coding Assistant (e.g. Antigravity, Claude, ChatGPT, Cursor AI, Replit Agent) on your new device, copy and paste this exact prompt to hand off the project:

> **AI Prompt to paste into your new device:**
>
> *"Please clone and set up the EduSense AI Student Analytics codebase from the following GitHub repository: `https://github.com/varshan6369/edusense-ai-student-analytics.git`. Run `npm install` and verify the app builds with `npm run build`. Start the dev server with `npm run dev` and ensure all light-mode 3D Glassmorphism & Claymorphism UI components render properly."*

---

## 🛠️ Project Stack & Architecture Overview

- **Frontend Core:** React 18, Vite, TypeScript
- **Styling & Aesthetics:** Light Mode Glassmorphism & Claymorphism via Tailwind CSS v4 (`src/index.css`)
- **Visuals:** Custom 3D Glassmorphic Portal Orb, dynamic Recharts area & radar charts, Lucide Icons
- **Key Modules:**
  - `StudentDashboard.tsx`: Primary student overview (KPIs, Study Hours, Focus Score, Charts)
  - `TeacherDashboard.tsx`: Class roster, risk prediction table, attendance heatmap
  - `AIStudyPlanner.tsx`: AI-generated study schedule & goal checklist
  - `WhatIfSimulator.tsx`: Interactive score prediction simulator
  - `SmartNotes.tsx`: Note summary, glossary, quiz & flashcard generator
  - `ReportGenerator.tsx`: Printable/Exportable academic PDF generator
  - `AICopilotDrawer.tsx`: Embedded Gemini RAG assistant

---

## 📦 How to Save & Push Changes Back to GitHub

Whenever you finish working on the new device, save and export your progress by running:

```bash
git add .
git commit -m "feat: complete feature implementation"
git push origin master
```

---

*Repository Link:* [https://github.com/varshan6369/edusense-ai-student-analytics.git](https://github.com/varshan6369/edusense-ai-student-analytics.git)
