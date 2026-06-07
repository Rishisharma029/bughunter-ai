# BugHunter AI

<p align="center">
  <img src="https://img.shields.io/badge/Status-Under%20Active%20Development-orange?style=for-the-badge&logo=github" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-blue?style=for-the-badge&logo=node.js" alt="Node" />
  <img src="https://img.shields.io/badge/React-2026-blueviolet?style=for-the-badge&logo=react" alt="React" />
</p>

### **AI-powered Code Review, Security Analysis, and Repository Intelligence Platform.**

BugHunter AI helps engineering teams, security researchers, and developers automatically audit source code, identify critical flaws, remediate vulnerabilities with AI-generated recommendations, and track security compliance scorecards.

---

## 🔎 Overview

BugHunter AI helps developers identify:
* **Security vulnerabilities** (OWASP Top 10, credentials leakage)
* **Code quality issues** (Style smells, dead code, memory leaks)
* **Performance bottlenecks** (Inefficient loops, heavy database operations)
* **Dependency risks** (Typosquatting, dependency confusion, known CVEs)
* **Architecture problems** (SOLID violations, tight component coupling)

using a cooperative **multi-agent AI analysis system**.

---

## ✨ Features

### 📦 Repository Scanning
* **GitHub repository import**: Import and track public or private repositories.
* **Branch scanning**: Audits multiple branches to check target code states.
* **Commit analysis**: Full history risk profiling and regressions tracking.
* **Pull request analysis**: Evaluates incoming PR changes before merge.

### 🤖 Multi-Agent Analysis
Coordinated consensus sweeps driven by seven specialized AI agents:
* **Hunter Agent**: Isolates bugs, syntax flaws, logic errors, and memory leaks.
* **Security Agent**: Audits OWASP Top 10 vulnerabilities and hardcoded credentials.
* **Performance Agent**: Detects resource leaks, infinite loops, and heavy processes.
* **Architecture Agent**: Evaluates SOLID design rules and coupling metrics.
* **Compliance Agent**: Validates standards mapping to SOC2, ISO 27001, and NIST frameworks.
* **Skeptic Agent**: Audits all agent findings to filter false positives.
* **Judge Agent**: Assigns final grades, CVSS severity, and maps CWE tags.

### 🛡️ Security
* **OWASP Top 10 detection**: Automatic checks for SQLi, XSS, Path Traversal, and weak crypto.
* **Secret scanning**: Discovers exposed private keys, auth tokens, and database passwords.
* **CVE intelligence**: Evaluates dependency files (`package.json`, `requirements.txt`) for vulnerability CVE records.
* **Dependency analysis**: Scans third-party code for supply chain risks.

### 💡 AI Features
* **AI Fix Suggestions**: Direct side-by-side diff remedies with copy hooks.
* **Architecture Review**: Comprehensive SOLID class couplings audits.
* **Technical Debt Analysis**: Computes technical debt runway in hours and refactor costs.
* **Risk Scoring**: Visualizes security score dials and regression probabilities.

### 📊 Reporting
* **PDF Reports**: Generates professional executive summaries and audits.
* **Executive Dashboard**: Unified view for MTTR, team comparisons, and security posture.
* **Compliance Reports**: Standard compliance scorecards (SOC2, ISO 27001, NIST).

---

## 🏗️ Architecture

```
       Frontend (React)
              │
              ▼
  Backend (Node.js + Express)
              │
              ▼
      Multi-Agent Engine
              │
              ▼
       SQLite Database
```

---

## 🛠️ Tech Stack

### Frontend
* **React**
* **Vite**
* **TypeScript**
* **HSL-tailored Glassmorphism CSS**

### Backend
* **Node.js**
* **Express**

### Database
* **SQLite**

### Security
* **JWT** (JSON Web Tokens)
* **Helmet** (HTTP Security Headers)
* **Rate Limiting** (DDOS mitigation)

### DevOps
* **Docker**
* **GitHub Actions**

---

## 🗺️ Roadmap

### 🏁 Version 1
* [x] Core Repository Crawler & Scanner
* [x] Security Scanner Node
* [x] Live HSL Analytics Dashboard
* [x] Executive PDF Report Exporter

### 🛡️ Version 2
* [x] SOC Heatmaps & Telemetry Dashboard
* [x] Compliance Center (SOC2, ISO 27001, NIST)
* [x] Commit Risk & Regression Timeline

### 💎 Version 3
* [x] AI Refactoring & Technical Debt Calculator
* [x] Supply Chain Security (Typosquatting, Dependency Confusion, Malicious Packages)
* [x] Cloud Security (Docker, Terraform, Kubernetes configurations scanners)

---

## 💾 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bughunter-ai.git
cd bughunter-ai
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run Standalone App (Production Build)
To compile the frontend and run the complete application on a single port (**5050**):
```bash
# Build the frontend assets
cd frontend
npm run build

# Start the unified backend server
cd ../backend
$env:PORT=5050; npm start
```
*Open your browser and navigate to **[http://localhost:5050](http://localhost:5050)**.*

### 4. Run in Development Mode (Hot Reload)
To run hot-reloading servers:

* **Backend Server**: Run `npm run dev` inside `backend/` (default port `5050`).
* **Frontend Dev Server**: Run `npm run dev` inside `frontend/` (default port `5173`, proxying backend).

---

## 🧪 Verification & Testing
To execute backend automated tests verifying scanner logic:
```bash
cd backend
npm test
```

---

## 🚦 Status

🚧 **Under Active Development**

---

## 📄 License

This project is licensed under the **MIT License**.
