# Reference Architecture — AI Evolution & Maturity Platform

## 1. Purpose

This document is the canonical reference architecture for deploying an enterprise AI platform that evolves through the 10-level AI maturity model. It is intended for solution architects, AI CoE leads, and platform engineers to use as the definitive blueprint when designing, evaluating, or extending AI capabilities within the enterprise.

---

## 2. The Complete Reference Architecture

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                        ENTERPRISE AI PLATFORM — REFERENCE ARCHITECTURE           ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                            CHANNEL LAYER                                    │ ║
║  │   Web Chat    Mobile App    Voice/IVR    Email     API (B2B)    Employee UI  │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                         API GATEWAY & SECURITY                               │ ║
║  │     WAF · TLS · Auth (OIDC) · Rate Limiting · PII Masking · Audit Log       │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                       ORCHESTRATION LAYER                                    │ ║
║  │                                                                               │ ║
║  │    ┌─────────────────────┐        ┌──────────────────────────────────────┐  │ ║
║  │    │   Intent Router     │        │         Supervisor Agent              │  │ ║
║  │    │   (classify &       │───────▶│   (routes to specialist agents,      │  │ ║
║  │    │    dispatch)        │        │    aggregates results)                │  │ ║
║  │    └─────────────────────┘        └──────────────────────────────────────┘  │ ║
║  │                                                    │                          │ ║
║  │    ┌──────────────────────────────────────────────────────────────────────┐ │ ║
║  │    │                    Workflow Engine (LangGraph / Temporal)             │ │ ║
║  │    │    Multi-step coordination · State persistence · Human approval gates │ │ ║
║  │    └──────────────────────────────────────────────────────────────────────┘ │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                          AGENT LAYER                                         │ ║
║  │                                                                               │ ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ ║
║  │  │    CS    │ │  Refund  │ │ Shipping │ │  Fraud   │ │    Knowledge     │  │ ║
║  │  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │     Agent        │  │ ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │ ║
║  │                                                                               │ ║
║  │  ┌──────────────────────────────────────────────────────────────────────┐   │ ║
║  │  │          Agent Runtime  (Reason → Act → Observe loop)                │   │ ║
║  │  │          Agent Registry · Agent Identity · Reflection Engine         │   │ ║
║  │  └──────────────────────────────────────────────────────────────────────┘   │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                       INTELLIGENCE LAYER                                     │ ║
║  │                                                                               │ ║
║  │  ┌──────────────────────────────────────────┐  ┌───────────────────────┐    │ ║
║  │  │              LLM Gateway                  │  │     RAG Pipeline      │    │ ║
║  │  │  Primary: Claude Sonnet                   │  │  Query Rewriter       │    │ ║
║  │  │  Fallback: Claude Haiku / GPT-4o          │  │  Embedding Service    │    │ ║
║  │  │  Cost routing · Audit logging             │  │  Vector Search        │    │ ║
║  │  └──────────────────────────────────────────┘  │  Reranker             │    │ ║
║  │                                                  └───────────────────────┘    │ ║
║  │  ┌──────────────────────────────────────────┐                                │ ║
║  │  │            Prompt Engine                  │                                │ ║
║  │  │  Template library · Versioning · A/B test │                                │ ║
║  │  └──────────────────────────────────────────┘                                │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                        TOOL & ACTION LAYER                                   │ ║
║  │                                                                               │ ║
║  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  │ ║
║  │  │  MCP Server   │  │  Tool Router  │  │Function Regist│  │ API Adapters │  │ ║
║  │  │  (tool defns) │  │  + Auth check │  │(schema, auth) │  │(CRM/ERP/Pay) │  │ ║
║  │  └───────────────┘  └───────────────┘  └───────────────┘  └──────────────┘  │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                           DATA LAYER                                         │ ║
║  │                                                                               │ ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ ║
║  │  │ Vector   │ │Knowledge │ │  Redis   │ │Data Lake │ │ Operational DBs  │  │ ║
║  │  │   DB     │ │  Graph   │ │ (Memory) │ │(Analytics│ │ CRM · ERP · OMS  │  │ ║
║  │  │(Pinecone)│ │ (Neo4j)  │ │          │ │ /Fine-T.)│ │                  │  │ ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                         │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                    PLATFORM & INFRASTRUCTURE                                 │ ║
║  │                                                                               │ ║
║  │   Kubernetes (AKS/EKS)  ·  Kafka (Event Bus)  ·  Terraform (IaC)           │ ║
║  │   HashiCorp Vault (Secrets)  ·  Istio (mTLS)  ·  ArgoCD (GitOps)           │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐ ║
║  │                   CROSS-CUTTING CONCERNS (horizontal)                        │ ║
║  │                                                                               │ ║
║  │  Security          Observability         Governance          AgentOps        │ ║
║  │  (Zero Trust ·     (OTel · Langfuse ·    (Policy engine ·   (Evals ·        │ ║
║  │   PII masking ·     Grafana · Alerts)     AI Act comply ·    Session replay · │ ║
║  │   Audit logs)                             HITL gates)        Cost tracking)  │ ║
║  └─────────────────────────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Maturity-Gated Adoption Map

The reference architecture is implemented incrementally. Teams activate new components as they advance maturity levels.

```
PHASE 1 — Foundation (L1–L2)
═══════════════════════════════
Activate:  API Gateway · LLM Gateway · Prompt Engine
Milestone: AI-powered chat assistant live
KPI:       Customer query deflection rate > 30%

         ↓

PHASE 2 — Knowledge (L3)
════════════════════════
Activate:  RAG Pipeline · Vector DB · Document ingestion
Milestone: Grounded answers from enterprise knowledge base
KPI:       Hallucination rate < 5% · CSAT > 4.0

         ↓

PHASE 3 — Action (L4)
══════════════════════
Activate:  MCP Server · Tool Registry · API Adapters
Milestone: AI executes actions in CRM, OMS, and payment systems
KPI:       Task automation rate > 50%

         ↓

PHASE 4 — Process (L5)
═══════════════════════
Activate:  Workflow Engine · State Manager · Human approval gates
Milestone: End-to-end business processes automated
KPI:       Process cycle time reduced > 60%

         ↓

PHASE 5 — Agents (L6)
══════════════════════
Activate:  Agent Runtime · Memory Store · Reflection Engine
Milestone: Autonomous agents handle complex, multi-step requests
KPI:       AI containment rate > 70% · Escalation < 30%

         ↓

PHASE 6 — Multi-Agent (L7)
═══════════════════════════
Activate:  Supervisor Agent · Agent Registry · Cross-agent tracing
Milestone: Specialised agents collaborate on complex cases
KPI:       First-contact resolution > 80%

         ↓

PHASE 7 — Enterprise AI (L8–L9)
════════════════════════════════
Activate:  Knowledge Graph · Domain agent ecosystems · AI Workforce Platform
Milestone: Entire business domain managed by agent ecosystem
KPI:       Cost per case < $0.05 · AI SLA adherence > 99%

         ↓

PHASE 8 — Autonomous Enterprise (L10)
══════════════════════════════════════
Activate:  Autonomous optimisation loop · AI CoE Platform · Policy-as-code
Milestone: Self-healing, self-optimising AI operating system
KPI:       System self-corrects within 5 minutes · Zero human intervention for L1 issues
```

---

## 4. Technology Selection Guide

### 4.1 LLM Selection by Use Case

| Use Case | Recommended Model | Rationale |
|---|---|---|
| Simple FAQ / classification | Claude Haiku 4.5 | Fast, cheap, sufficient |
| Complex reasoning / planning | Claude Sonnet 4.6 | Balance of cost and capability |
| High-stakes decisions | Claude Opus 4.8 | Maximum reasoning depth |
| Real-time voice | GPT-4o mini | Low latency |
| Sensitive/regulated | On-premise Llama 3 | Data residency |
| Fine-tuned domain tasks | Custom fine-tuned | Domain-specific accuracy |

### 4.2 Vector Database Selection

| Requirement | Recommended | Alternative |
|---|---|---|
| Managed, scalable, cloud-native | Pinecone | Weaviate Cloud |
| Existing PostgreSQL stack | pgvector | — |
| On-premise / air-gapped | Weaviate (self-hosted) | Qdrant |
| High-throughput, low-latency | Qdrant | Redis Vector |
| Metadata filtering + vectors | Weaviate | Pinecone |

### 4.3 Agent Framework Selection

| Requirement | Recommended |
|---|---|
| Complex stateful workflows | LangGraph |
| Multi-agent + human-in-loop | LangGraph + LangSmith |
| Enterprise, .NET / Java | Semantic Kernel |
| Research / rapid prototyping | CrewAI |
| Production, code-first | Custom runtime on top of Anthropic SDK |

---

## 5. Integration Patterns

### 5.1 Synchronous (Low-latency, real-time)

```
UI ──HTTP──▶ API GW ──gRPC──▶ Agent Service ──HTTP──▶ LLM GW
                                    │
                                    ──gRPC──▶ Tool Service ──HTTP──▶ External API
```

Use for: Chat interactions, real-time query-answer, tool calls with < 5s SLA

### 5.2 Asynchronous (Long-running, background)

```
Trigger ──▶ Event Bus (Kafka) ──▶ Workflow Service ──▶ Agent Pool
                                         │
                                         ──▶ Callback / Webhook when done
```

Use for: Refund processing, document analysis, batch knowledge ingestion

### 5.3 Streaming (Progressive response)

```
UI ──SSE/WebSocket──▶ API GW ──▶ Agent Service
                                      │
                                      ──stream──▶ LLM GW ──▶ LLM (token stream)
                                      ──chunk──▶ API GW
                                      ──chunk──▶ UI
```

Use for: Chat UI, long-form generation, real-time reasoning display

---

## 6. Non-Functional Requirements

| NFR | Target | Mechanism |
|---|---|---|
| Chat response latency (P95) | < 3 seconds | Streaming + async tool calls |
| Agent task latency (P95) | < 30 seconds | Parallel tool execution |
| LLM Gateway availability | 99.9% | Multi-provider failover |
| Platform availability | 99.95% | Multi-AZ Kubernetes |
| RAG retrieval latency | < 200ms | Dedicated vector DB cluster |
| Token cost per session | < $0.10 | Model tiering + semantic caching |
| Data residency | Regional | Cloud region locks + on-prem option |
| Audit log retention | 7 years | Immutable object storage (WORM) |
| Recovery Time Objective | < 15 minutes | GitOps + automated rollback |
| Recovery Point Objective | < 5 minutes | Event sourcing + streaming backup |

---

## 7. AI Centre of Excellence (AI CoE) Operating Model

At Level 9–10, the platform requires a governing AI CoE:

```
┌──────────────────────────────────────────────────────────────┐
│                    AI CoE Structure                           │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  AI Platform   │  │  AI Governance │  │  AI Products   │  │
│  │  Engineering   │  │  & Risk        │  │  (Domain teams)│  │
│  │                │  │                │  │                │  │
│  │  LLM GW        │  │  Policy engine │  │  CS Agents     │  │
│  │  Agent runtime │  │  Model cards   │  │  Finance Agents│  │
│  │  RAG/Vector    │  │  Bias audits   │  │  HR Agents     │  │
│  │  AgentOps      │  │  Compliance    │  │  Sales Agents  │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                AI Review Board                            │ │
│  │  CTO · CISO · CDO · Chief AI Officer · Legal · Compliance│ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**AI CoE Responsibilities:**
- Agent onboarding standards and review process
- LLM provider SLA management and cost governance
- Responsible AI policy enforcement
- Quarterly maturity level assessments
- Incident response for AI failures
- Model card authoring and maintenance

---

## 8. Document Index

| Document | Description |
|---|---|
| [Context Diagram](CONTEXT_DIAGRAM.md) | System context at each maturity range |
| [HLD](HLD.md) | High-level architecture, layers, technology stack |
| [LLD](LLD.md) | Component specs, APIs, data models, sequence diagrams |
| [Security](SECURITY.md) | Threat model, IAM, AI-specific controls, compliance |
| [DevOps](DEVOPS.md) | CI/CD, container platform, IaC, AI quality gates |
| [Observability](OBSERVABILITY.md) | Logs, metrics, traces, AgentOps, dashboards |
| [Reference Architecture](REFERENCE_ARCHITECTURE.md) | This document — canonical blueprint |
