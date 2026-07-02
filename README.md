<div align="center">

# 🛡️ Aethel

### Autonomous AI SRE Engineer

**Detect • Investigate • Reason • Recover • Learn**

An autonomous AI Site Reliability Engineer that detects production incidents, analyzes their root causes using a Neo4j Knowledge Graph, generates recovery strategies with Gemini AI, and produces production-grade postmortems.

Built for modern cloud-native infrastructure.

---

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TanStack](https://img.shields.io/badge/TanStack-Start-orange)
![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB-008CC1?logo=neo4j)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 🚀 Overview

**Aethel** is an **Autonomous AI Site Reliability Engineer** designed to assist DevOps and SRE teams during production incidents.

Instead of acting like a chatbot, Aethel behaves like an experienced on-call engineer.

It continuously reasons over infrastructure knowledge stored in **Neo4j AuraDB**, analyzes incidents using **Google Gemini**, and presents actionable insights including:

- Root Cause Analysis
- Service Dependency Graphs
- Historical Incident Similarity
- AI Incident Investigation
- Autonomous Recovery Planning
- Blameless Postmortem Generation

---

# ✨ Features

## 🧠 AI Incident Investigation

- Ask natural language questions
- AI explains failures
- Uses Google Gemini 2.5 Flash

---

## 🌐 Neo4j Knowledge Graph

Models production infrastructure as a graph.

Includes

- Services
- Incidents
- Deployments
- Evidence
- Dependencies
- Historical failures

---

## 🔍 Similar Incident Search

Searches historical incidents stored inside Neo4j to identify recurring failures and suggest previously successful recovery strategies.

---

## 🌳 Causal Graph

Visualizes

```
Deployment
      ↓
Memory Leak
      ↓
OOMKilled
      ↓
Database Exhaustion
      ↓
Retry Storm
      ↓
Customer Impact
```

---

## 📊 Service Dependency Map

Interactive service topology showing relationships between

- Checkout API
- Cart Service
- Payment Gateway
- PostgreSQL
- Kubernetes

---

## 📄 Autonomous Postmortem

Automatically generates production-grade postmortems including

- Timeline
- Root Cause
- Customer Impact
- Recovery Actions
- Lessons Learned
- Preventive Measures

---

## 🤖 Ask Aethel

Chat with the autonomous SRE.

Example questions

- Why did checkout fail?
- What caused the retry storm?
- Which deployment introduced the bug?
- Show evidence for the root cause.
- Was Stripe actually down?

---

# 🏗 Architecture

```
                    User
                     │
                     ▼
              React Dashboard
                     │
                     ▼
          TanStack Start API Routes
          ┌───────────────┬──────────────┐
          │               │              │
          ▼               ▼              ▼
     Gemini AI      Neo4j AuraDB    Incident Engine
          │               │
          └───────Knowledge Graph──────┘
                     │
                     ▼
          AI Grounded Responses
```

---

# 🛠 Tech Stack

## Frontend

- React 19
- TanStack Start
- TypeScript
- Tailwind CSS
- Framer Motion

---

## Backend

- TanStack Server Functions
- Node.js

---

## AI

- Google Gemini 2.5 Flash
- AI SDK

---

## Database

- Neo4j AuraDB
- Cypher

---

## Infrastructure

- Docker
- Neo4j
- Prometheus
- Grafana
- Loki
- Jaeger

---

# ⚡ Getting Started

Clone the repository

```bash
git clone https://github.com/Anushka-Btech/Aethel--Autonomous-AI-SRE-Engineer.git

cd aethel-sre
```

Install dependencies

```bash
npm install
```

---

Create a `.env`

```env
GEMINI_API_KEY=YOUR_GEMINI_KEY

NEO4J_URI=neo4j+s://YOUR_INSTANCE.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=YOUR_PASSWORD
NEO4J_DATABASE=neo4j
```

---

Seed the Knowledge Graph

```bash
npm run db:seed
```

---

Run locally

```bash
npm run dev
```

Open

```
http://localhost:8080
```

---

# 🧩 Knowledge Graph Schema

The graph contains

- Incident
- Service
- Deployment
- Evidence
- Engineer
- Pull Request
- Root Cause
- Recovery Plan

Relationships include

- CAUSED_BY
- DEPENDS_ON
- AFFECTS
- SIMILAR_TO
- FIXED_BY
- OBSERVED_IN

---

# 💡 Example Workflow

1. Production deployment occurs
2. Memory leak detected
3. Neo4j identifies affected services
4. Gemini analyzes graph context
5. Aethel generates recovery plan
6. Operator reviews recommendations
7. Postmortem automatically generated

---

# 🎯 Why Neo4j?

Production incidents are naturally graphs.

Traditional databases struggle to represent

- Service dependencies
- Cascading failures
- Historical relationships
- Incident similarity

Neo4j enables fast traversal across interconnected systems, making root cause analysis significantly more intuitive.

---

# 🌟 Future Work

- GitHub PR Automation
- Kubernetes Rollback Execution
- Slack Integration
- PagerDuty Integration
- GraphRAG
- Multi-cluster Support
- AI Runbooks

---

# 👨‍💻 Author

**Anushka Chhoker**

---

# 📜 License

MIT License