# Reference Architecture — AI Evolution & Maturity Platform

## 1. Purpose

This document is the canonical reference architecture for deploying an enterprise AI platform that evolves through the 10-level AI maturity model. It is intended for solution architects, AI CoE leads, and platform engineers to use as the definitive blueprint when designing, evaluating, or extending AI capabilities within the enterprise.

---

## 2. The Complete Reference Architecture

```mermaid
flowchart TD
  CH["<b>CHANNEL LAYER</b><br/>Web Chat · Mobile · Voice/IVR · Email · API (B2B) · Employee UI"]
  GW["<b>API GATEWAY &amp; SECURITY</b><br/>WAF · TLS · Auth (OIDC) · Rate Limiting · PII Masking · Audit Log"]
  subgraph ORCH["ORCHESTRATION LAYER"]
    IR["Intent Router<br/>(classify &amp; dispatch)"] --> SUP["Supervisor Agent<br/>(route + aggregate)"]
    WE["Workflow Engine (LangGraph / Temporal)<br/>Multi-step · State persistence · Approval gates"]
  end
  subgraph AGENTS["AGENT LAYER"]
    AG["CS · Refund · Shipping · Fraud · Knowledge Agents"]
    RT["Agent Runtime (Reason → Act → Observe)<br/>Registry · Identity · Reflection Engine"]
  end
  subgraph INTEL["INTELLIGENCE LAYER"]
    LG["LLM Gateway<br/>Primary: Sonnet · Fallback: Haiku/GPT-4o · Cost routing"]
    RG["RAG Pipeline<br/>Query Rewriter · Embedding · Vector Search · Reranker"]
    PE["Prompt Engine<br/>Template library · Versioning · A/B test"]
  end
  subgraph TOOLS["TOOL &amp; ACTION LAYER"]
    TL["MCP Server · Tool Router (+Auth) · Function Registry · API Adapters (CRM/ERP/Pay)"]
  end
  subgraph DATA["DATA LAYER"]
    DL["Vector DB (Pinecone) · Knowledge Graph (Neo4j) · Redis · Data Lake · Operational DBs"]
  end
  PI["<b>PLATFORM &amp; INFRASTRUCTURE</b><br/>Kubernetes · Kafka · Terraform · Vault · Istio (mTLS) · ArgoCD"]
  XC["<b>CROSS-CUTTING</b> · Security · Observability · Governance · AgentOps"]
  CH --> GW --> ORCH --> AGENTS --> INTEL --> TOOLS --> DATA --> PI --> XC
```

---

## 3. Maturity-Gated Adoption Map

The reference architecture is implemented incrementally. Teams activate new components as they advance maturity levels.

```mermaid
flowchart TD
  P1["<b>Phase 1 — Foundation (L1–L2)</b><br/>Activate: API GW · LLM GW · Prompt Engine<br/>KPI: deflection rate &gt; 30%"]
  P2["<b>Phase 2 — Knowledge (L3)</b><br/>Activate: RAG · Vector DB · Doc ingestion<br/>KPI: hallucination &lt; 5% · CSAT &gt; 4.0"]
  P3["<b>Phase 3 — Action (L4)</b><br/>Activate: MCP · Tool Registry · API Adapters<br/>KPI: task automation &gt; 50%"]
  P4["<b>Phase 4 — Process (L5)</b><br/>Activate: Workflow Engine · State · Approval gates<br/>KPI: cycle time −60%"]
  P5["<b>Phase 5 — Agents (L6)</b><br/>Activate: Agent Runtime · Memory · Reflection<br/>KPI: containment &gt; 70% · escalation &lt; 30%"]
  P6["<b>Phase 6 — Multi-Agent (L7)</b><br/>Activate: Supervisor · Registry · Cross-agent tracing<br/>KPI: FCR &gt; 80%"]
  P7["<b>Phase 7 — Enterprise AI (L8–L9)</b><br/>Activate: Knowledge Graph · Domain ecosystems · Workforce<br/>KPI: cost/case &lt; $0.05 · SLA &gt; 99%"]
  P8["<b>Phase 8 — Autonomous Enterprise (L10)</b><br/>Activate: Optimisation loop · AI CoE · Policy-as-code<br/>KPI: self-corrects &lt; 5 min"]
  P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8
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

```mermaid
flowchart LR
  UI --HTTP--> GW["API GW"] --gRPC--> AS["Agent Service"] --HTTP--> LLM["LLM GW"]
  AS --gRPC--> TS["Tool Service"] --HTTP--> EXT["External API"]
```

Use for: Chat interactions, real-time query-answer, tool calls with < 5s SLA

### 5.2 Asynchronous (Long-running, background)

```mermaid
flowchart LR
  T["Trigger"] --> EB["Event Bus (Kafka)"] --> WS["Workflow Service"] --> AP["Agent Pool"]
  WS --> CB["Callback / Webhook when done"]
```

Use for: Refund processing, document analysis, batch knowledge ingestion

### 5.3 Streaming (Progressive response)

```mermaid
flowchart LR
  UI -- SSE/WebSocket --> GW["API GW"] --> AS["Agent Service"]
  AS -- stream --> LLM["LLM GW"] --> M["LLM (token stream)"]
  AS -- chunk --> GW
  GW -- chunk --> UI
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

```mermaid
flowchart TD
  RB["<b>AI Review Board</b><br/>CTO · CISO · CDO · Chief AI Officer · Legal · Compliance"]
  ENG["<b>AI Platform Engineering</b><br/>LLM GW · Agent runtime · RAG/Vector · AgentOps"]
  GOV["<b>AI Governance &amp; Risk</b><br/>Policy engine · Model cards · Bias audits · Compliance"]
  PRD["<b>AI Products (Domain teams)</b><br/>CS · Finance · HR · Sales Agents"]
  RB --> ENG
  RB --> GOV
  RB --> PRD
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
