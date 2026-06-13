# Decision Log — AI Evolution & Maturity Platform

Architectural, technical, and strategic decisions are recorded here with context, alternatives considered, and rationale. This log is maintained throughout the program.

---

## Decision Template

| Field | Value |
|---|---|
| **ID** | DEC-XXX |
| **Date** | YYYY-MM-DD |
| **Status** | Proposed / Accepted / Superseded |
| **Deciders** | List of decision-makers |
| **Context** | Why this decision was needed |
| **Decision** | What was decided |
| **Alternatives** | Options that were considered |
| **Rationale** | Why this option was chosen |
| **Consequences** | Impacts and trade-offs |
| **Superseded By** | DEC-XXX (if applicable) |

---

## DEC-001: Primary LLM Provider — Anthropic Claude

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | CTO, AI CoE Lead, Solution Architect |
| **Context** | Program requires a primary LLM for all agent interactions. Multiple enterprise-grade providers available. |
| **Decision** | Anthropic Claude (claude-sonnet-4-6 as primary; claude-haiku-4-5 for cost-optimised tasks) |
| **Alternatives** | OpenAI GPT-4o; Google Gemini 1.5 Pro; AWS Bedrock Llama 3 |
| **Rationale** | Claude demonstrates superior instruction-following and safety alignment critical for customer-facing AI. Enterprise agreement provides data processing agreement and zero-data-retention option. Constitutional AI approach aligns with responsible AI policy. |
| **Consequences** | Provider dependency risk mitigated by fallback to OpenAI GPT-4o. Cost slightly higher than GPT-4o-mini but lower than GPT-4o at equivalent quality. |

---

## DEC-002: LLM Gateway as Abstraction Layer

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | Solution Architect, Platform Engineering |
| **Context** | Agents must not be directly coupled to LLM providers to enable provider switching, cost routing, and audit. |
| **Decision** | Centralised LLM Gateway with provider adapters. All LLM calls route through the gateway. |
| **Alternatives** | Direct provider SDK calls from each agent; LiteLLM as OSS gateway |
| **Rationale** | Custom gateway gives full control over routing logic, token budget enforcement, audit logging, and fallback. LiteLLM considered but customisation limitations for enterprise audit requirements. |
| **Consequences** | Additional engineering work (~3 weeks); ongoing maintenance. Trade-off accepted for vendor independence and audit capability. |

---

## DEC-003: Agent Framework — LangGraph

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | Solution Architect, AI CoE Lead, Platform Engineering |
| **Context** | Agents require stateful, cyclical execution (reason → act → observe loop) with persistence and human-in-loop support. |
| **Decision** | LangGraph for agent orchestration and workflow |
| **Alternatives** | AutoGen; CrewAI; custom agent runtime; Semantic Kernel |
| **Rationale** | LangGraph provides production-grade stateful agent graphs with built-in persistence (LangGraph Cloud or self-hosted), human-in-loop interrupts, and streaming. Actively maintained; enterprise support available. |
| **Consequences** | Dependency on LangChain/LangGraph ecosystem. If LangGraph is deprecated, migration to custom runtime required. Mitigation: agent interfaces are abstracted — framework change would not affect agent logic. |

---

## DEC-004: Vector Database — Pinecone (Primary) with pgvector Fallback

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | Platform Engineering, Data Engineering |
| **Context** | RAG pipeline requires high-performance vector search with multi-tenant namespace isolation and managed operations. |
| **Decision** | Pinecone Serverless as primary; pgvector as fallback/alternative for data residency requirements |
| **Alternatives** | Weaviate Cloud; Qdrant; Milvus; pure pgvector |
| **Rationale** | Pinecone Serverless eliminates index management overhead; excellent performance at scale; strong multi-tenancy via namespaces; well-documented. pgvector retained as fallback for regions where Pinecone is not available or for strict data residency. |
| **Consequences** | External SaaS dependency (Pinecone). Egress cost for data transfer. pgvector requires more operational overhead but keeps data within managed Postgres. |

---

## DEC-005: Event-Driven Agent Communication (Kafka)

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | Solution Architect, Platform Engineering |
| **Context** | Multi-agent systems require reliable, decoupled communication. Synchronous gRPC would couple agents tightly. |
| **Decision** | Apache Kafka (via Azure Event Hubs Premium) for async agent-to-agent and agent-to-system events. gRPC retained for latency-sensitive direct calls. |
| **Alternatives** | RabbitMQ; AWS SQS/SNS; direct REST; pure gRPC |
| **Rationale** | Kafka provides durable, ordered, at-least-once delivery with replay capability. Audit trail from Kafka is valuable. Azure Event Hubs gives managed Kafka without operational overhead. |
| **Consequences** | Added complexity vs REST. Message ordering guaranteed per partition. Exactly-once requires additional design (idempotent consumers). |

---

## DEC-006: GitOps Deployment with ArgoCD

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | DevOps Engineering |
| **Context** | Rapid deployment cadence across multiple environments requires automated, auditable deployment pipeline. |
| **Decision** | ArgoCD for GitOps-driven Kubernetes deployments |
| **Alternatives** | Flux; Jenkins X; manual kubectl; Helm-only |
| **Rationale** | ArgoCD provides visual diff, automated sync, rollback, and audit trail of all Kubernetes changes. Git is the single source of truth. Strong RBAC for approval gates per environment. |
| **Consequences** | ArgoCD operational overhead. Platform team must manage ArgoCD. Application teams benefit from self-service deployment visibility. |

---

## DEC-007: Prompt Versioning in Git + Database

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | AI CoE Lead, Agent Development |
| **Context** | Prompt templates must be versioned, reviewed, tested, and rolled back independently of agent code. |
| **Decision** | Prompts versioned in Git (YAML files); mirrored to PostgreSQL for runtime access. Deployment via GitOps. |
| **Alternatives** | Prompts in code (strings); external prompt management SaaS (PromptLayer); database only |
| **Rationale** | Git provides full history, review/approval via PRs, and rollback. PostgreSQL gives fast runtime read access. Separation of prompt from code allows prompt engineers to iterate without code deployments. |
| **Consequences** | Two sources of truth must be kept in sync (Git → DB sync job). Accepted: sync is simple and failure is detectable. |

---

## DEC-008: Human-in-the-Loop Threshold — $500

| Field | Value |
|---|---|
| **Date** | 2026-07-01 |
| **Status** | Accepted |
| **Deciders** | CFO, Legal, VP Customer Experience, AI CoE Lead |
| **Context** | Fully automated refunds are efficient but carry financial risk. Threshold must balance automation benefit vs control. |
| **Decision** | Refund processing is fully automated up to $500. Above $500 requires human approval within 4 hours. |
| **Alternatives** | $0 (all manual); $100; $200; $1,000; fully automated |
| **Rationale** | $500 covers > 85% of standard refund cases without human involvement. Reduces automation benefit minimally while providing meaningful financial control. Legal confirmed $500 is within autonomous AI action policy. |
| **Consequences** | 15% of refunds require human approval. Approval queue monitored; SLA: 4 hours. Reviewed quarterly — may increase as agent trust is established. |

---

## DEC-009: MCP (Model Context Protocol) for Tool Standardisation

| Field | Value |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted |
| **Deciders** | Solution Architect, Platform Engineering |
| **Context** | Tool definitions for agents need to be versioned, discoverable, and interoperable across agent frameworks. |
| **Decision** | MCP as the standard protocol for all tool definitions and exposure |
| **Alternatives** | OpenAI function calling format; custom tool schema; LangChain Tool class |
| **Rationale** | MCP is the emerging industry standard (supported by Anthropic, adopted widely). Interoperable across frameworks. Versioned schemas. Strong tooling ecosystem. |
| **Consequences** | Emerging standard — some tooling still maturing. Mitigation: MCP server is internal; format can be adapted if standard evolves. |

---

## DEC-010: EU AI Act Risk Classification — Limited Risk

| Field | Value |
|---|---|
| **Date** | 2026-07-15 |
| **Status** | Accepted (pending legal review) |
| **Deciders** | Legal Counsel, Chief AI Officer, Compliance |
| **Context** | EU AI Act requires risk classification of all AI systems. Classification determines compliance obligations. |
| **Decision** | Customer Support AI classified as Limited Risk (not High Risk) |
| **Alternatives** | High Risk (full Art. 9–15 obligations); Minimal Risk |
| **Rationale** | Customer support AI does not make consequential decisions about individuals (employment, credit, essential services). AI assists — humans can always escalate. Transparency (Art. 52) obligations apply: disclose AI interaction. |
| **Consequences** | Transparency obligations met by AI disclosure in chat. Human escalation always available. Classification reviewed annually or when use case changes. |
