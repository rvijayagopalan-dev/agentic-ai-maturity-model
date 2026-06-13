# Cost Estimation — AI Evolution & Maturity Platform

## 1. Cost Categories

| Category | Description |
|---|---|
| **People** | Internal FTE, SI partner, contractors |
| **LLM API** | Anthropic, OpenAI, AWS Bedrock usage |
| **Cloud Infrastructure** | Compute, storage, networking, managed services |
| **Tooling & Licences** | SaaS tools, observability, secrets management |
| **Training & Change Management** | External training, change management activities |

---

## 2. LLM API Cost Model

### 2.1 Model Pricing (as of 2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $0.80 | $4.00 |
| Claude Opus 4.8 | $15.00 | $75.00 |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |

### 2.2 Token Usage Assumptions

| Parameter | Value | Basis |
|---|---|---|
| Average input tokens per session | 2,000 | System prompt + RAG context + history |
| Average output tokens per session | 500 | Agent response |
| Sessions per day (Phase 1) | 500 | 10% of current volume automated |
| Sessions per day (Phase 7) | 5,000 | 70% automated |
| Sessions per day (Phase 10) | 10,000 | 90%+ automated |
| Model split: Haiku | 60% | Simple queries, classification |
| Model split: Sonnet | 35% | Standard agent interactions |
| Model split: Opus | 5% | Complex, high-stakes decisions |
| Semantic cache hit rate | 30% | Repeat query deflection |

### 2.3 Monthly LLM Cost by Phase

| Phase | Daily Sessions | Monthly Tokens (M) | Monthly LLM Cost |
|---|---|---|---|
| Phase 1 (L1–2) | 500 | 37.5M | $2,500 |
| Phase 2 (L3) | 1,000 | 75M | $5,000 |
| Phase 3 (L4) | 1,500 | 112.5M | $7,500 |
| Phase 4 (L5) | 2,000 | 150M | $10,000 |
| Phase 5 (L6) | 3,000 | 225M | $15,000 |
| Phase 6 (L7) | 5,000 | 375M | $25,000 |
| Phase 7 (L8) | 7,000 | 525M | $35,000 |
| Phase 8 (L9) | 9,000 | 675M | $45,000 |
| Phase 9 (L10) | 10,000 | 750M | $50,000 |

*Blended model cost ~$0.05/session average across Haiku/Sonnet/Opus split*
*Cache hit rate reduces effective cost by ~30%*

---

## 3. Cloud Infrastructure Cost

### 3.1 Kubernetes Cluster (Azure AKS — Primary Region)

| Node Pool | Instance | Count (avg) | Monthly Cost |
|---|---|---|---|
| system | Standard_D4s_v5 (4 vCPU, 16GB) | 3 | $600 |
| ai-platform | Standard_D8s_v5 (8 vCPU, 32GB) | 5 | $1,500 |
| ai-agents | Standard_D4s_v5 (4 vCPU, 16GB) | 10–50 | $2,000–10,000 |
| monitoring | Standard_D4s_v5 | 3 | $600 |
| **Base cluster (excl. agent scaling)** | | | **~$5,000/month** |

### 3.2 Managed Services

| Service | Tier | Monthly Cost (Phase 7 steady state) |
|---|---|---|
| PostgreSQL (Azure DB) | GP v5, 8 vCores | $800 |
| Redis Cache | P2 (13GB) | $600 |
| Kafka (Azure Event Hubs Premium) | 8 PUs | $1,200 |
| Vector DB (Pinecone Serverless) | Pay-per-use | $400–2,000 |
| Data Lake (Azure ADLS Gen2) | 10TB | $200 |
| Container Registry (ACR Premium) | — | $100 |
| API Gateway (Kong) | Professional | $500 |
| CDN + WAF | — | $300 |
| Key Vault | Standard | $100 |
| Load Balancer + networking | — | $500 |
| **Managed services total** | | **~$5,000–7,000/month** |

### 3.3 Observability Stack

| Tool | Monthly Cost |
|---|---|
| Datadog (infrastructure) | $1,500 |
| Langfuse (AgentOps) | $500 |
| Log storage (30-day hot tier) | $300 |
| Trace storage | $200 |
| **Observability total** | **~$2,500/month** |

### 3.4 DR / Secondary Region

| Component | Monthly Cost |
|---|---|
| Secondary AKS (warm standby — scaled to 0) | $300 |
| Cross-region DB replica | $400 |
| Kafka MirrorMaker | $200 |
| Cross-region data transfer | $150 |
| **DR total** | **~$1,050/month** |

---

## 4. Total Infrastructure Cost by Phase

| Phase | Compute | Managed Svcs | Observability | DR | LLM API | **Monthly Total** |
|---|---|---|---|---|---|---|
| Phase 1 | $3,000 | $2,500 | $1,500 | $500 | $2,500 | **$10,000** |
| Phase 2 | $4,000 | $3,500 | $1,800 | $600 | $5,000 | **$14,900** |
| Phase 3 | $5,000 | $4,000 | $2,000 | $700 | $7,500 | **$19,200** |
| Phase 4 | $5,500 | $4,500 | $2,200 | $800 | $10,000 | **$23,000** |
| Phase 5 | $7,000 | $5,500 | $2,500 | $1,000 | $15,000 | **$31,000** |
| Phase 6 | $9,000 | $6,000 | $2,500 | $1,000 | $25,000 | **$43,500** |
| Phase 7 | $12,000 | $7,000 | $2,500 | $1,050 | $35,000 | **$57,550** |
| Phase 8 | $14,000 | $7,000 | $2,500 | $1,050 | $45,000 | **$69,550** |
| Phase 9 | $15,000 | $7,000 | $2,500 | $1,050 | $50,000 | **$75,550** |

*Steady-state annual run cost at Phase 9: ~$907K/year*

---

## 5. People Cost

### 5.1 Internal FTE Cost

| Role | Avg Annual Cost (fully loaded) | FTE Count (Phase 7+) | Annual Cost |
|---|---|---|---|
| Program Director | $180,000 | 1 | $180,000 |
| AI CoE Lead | $170,000 | 1 | $170,000 |
| AI Platform Engineer | $150,000 | 4 | $600,000 |
| Agent Developer | $140,000 | 4 | $560,000 |
| DevOps / SRE | $145,000 | 2 | $290,000 |
| Data Engineer | $140,000 | 2 | $280,000 |
| Security Engineer | $155,000 | 1 | $155,000 |
| Solution Architect | $175,000 | 1 | $175,000 |
| Business Analyst | $110,000 | 2 | $220,000 |
| Change Manager | $120,000 | 1 | $120,000 |
| QA Engineer | $120,000 | 2 | $240,000 |
| **Total Internal** | | **21** | **$2,990,000** |

### 5.2 SI Partner Cost

| Phase | Months | FTE | Rate (blended) | Cost |
|---|---|---|---|---|
| Phase 1–2 | 6 | 4 | $180/hr | $1,036,800 |
| Phase 3–4 | 6 | 4 | $180/hr | $1,036,800 |
| Phase 5–6 | 8 | 3 | $180/hr | $1,036,800 |
| Phase 7 | 6 | 2 | $180/hr | $518,400 |
| Phase 8 | 6 | 1 | $180/hr | $259,200 |
| Phase 9 | 6 | 0 | — | $0 |
| **Total SI** | | | | **$3,888,000** |

---

## 6. Tooling & Licence Cost

| Tool | Annual Cost |
|---|---|
| GitHub Actions (CI minutes) | $12,000 |
| HashiCorp Vault Enterprise | $36,000 |
| Neo4j Enterprise (Phase 7+) | $60,000 |
| Langfuse Cloud | $6,000 |
| Security scanning (Snyk / Semgrep) | $12,000 |
| **Total tooling** | **$126,000/year** |

---

## 7. Training & Change Management

| Activity | Cost |
|---|---|
| External AI training (team; Year 1) | $45,000 |
| Change management programme | $60,000 |
| User adoption materials | $20,000 |
| Hypercare support (per phase) | $15,000 × 9 = $135,000 |
| **Total** | **$260,000** |

---

## 8. 3-Year Total Cost Summary

| Category | Year 1 | Year 2 | Year 3 | Total |
|---|---|---|---|---|
| Internal people | $2,200,000 | $2,600,000 | $2,990,000 | $7,790,000 |
| SI Partner | $2,073,600 | $1,814,400 | $0 | $3,888,000 |
| Cloud infrastructure | $252,000 | $540,000 | $810,600 | $1,602,600 |
| LLM API | $75,000 | $216,000 | $570,000 | $861,000 |
| Tooling & licences | $80,000 | $126,000 | $126,000 | $332,000 |
| Training & change | $200,000 | $45,000 | $15,000 | $260,000 |
| **Total** | **$4,880,600** | **$5,341,400** | **$4,511,600** | **$14,733,600** |

*Note: Business Case (BUSINESS_CASE.md) shows $6.21M investment figure — that represents direct program budget excluding base internal FTE cost (which is an existing cost). The above includes fully loaded people costs for completeness.*

---

## 9. Cost Optimisation Levers

| Lever | Potential Saving | Effort |
|---|---|---|
| Semantic caching (30% cache hit) | $180K/year on LLM API | Low |
| Model tiering (Haiku for simple tasks) | $120K/year | Low |
| Spot instances for agent pods | $80K/year | Medium |
| Reserved instances (1-year) for base infra | $60K/year | Low |
| Fine-tuned small model for classification | $40K/year | High |
| Prompt compression (fewer tokens) | $30K/year | Medium |
| **Total potential savings** | **~$510K/year** | |
