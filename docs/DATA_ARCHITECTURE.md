# Data Architecture & Flow Diagram — AI Evolution & Maturity Platform

## 1. Data Architecture Principles

| Principle | Description |
|---|---|
| Data as a Product | Every dataset has an owner, schema, SLA, and consumers |
| Privacy by Design | PII classified and controlled at point of ingestion |
| Federated Governance | Central policy, domain ownership |
| Single Source of Truth | No duplicated master data — operational systems are authoritative |
| AI-Ready by Default | All data pipelines output AI-consumable formats |

---

## 2. Data Domains

```mermaid
flowchart LR
  subgraph Row1[" "]
    direction LR
    CUS["<b>Customer Domain</b><br/>Profile · History · Preferences · CSAT"]
    OPS["<b>Operations Domain</b><br/>Orders · Inventory · Shipments · Payments"]
    KNW["<b>Knowledge Domain</b><br/>Policies · FAQs · Procedures · Product docs"]
  end
  subgraph Row2[" "]
    direction LR
    AIP["<b>AI Platform Domain</b><br/>Prompts · Embeddings · Agent traces · Eval scores"]
    ANL["<b>Analytics Domain</b><br/>Agent KPIs · Cost data · CSAT trends · Forecasts"]
    GOV["<b>Governance Domain</b><br/>Audit logs · Policy rules · Model cards · Compliance"]
  end
```

---

## 3. Master Data Flow

### 3.1 Ingestion Flow

```mermaid
flowchart LR
  subgraph Sources["External Sources"]
    P1["Customer Portal · CRM · ERP · Email/Voice"]
    P2["Knowledge Base · Policy Docs · Confluence · SharePoint"]
    P3["Agent Traces · LLM Logs · Eval Results"]
  end
  APIGW["API Gateway +<br/>Event Streaming (Kafka)"]
  ETL["ETL / Ingestion Service<br/>chunking · embedding · PII masking"]
  P1 --> APIGW
  P2 --> ETL
  P3 --> ETL
  APIGW --> OPS["Operational Store (Postgres)"]
  ETL --> VEC["Vector Store"]
  ETL --> DL["Data Lake (Parquet)"]
  ETL --> KG["Knowledge Graph"]
```

### 3.2 RAG Data Flow

```mermaid
flowchart TD
  DS["Document Source"]
  DL["Document Loader<br/>(PDF, HTML, Markdown, API)"]
  PP["Pre-processor<br/>Strip HTML · Fix encoding · Normalise"]
  PD["PII Detector<br/>Tag: NAME, EMAIL, PHONE, ID, ACCOUNT"]
  PM["PII Masker<br/>Replace with tokens: [NAME_1], [ACCT_2]"]
  CH["Chunker<br/>Semantic chunks + overlap; metadata"]
  EM["Embedding Svc<br/>text-embedding-3-large / claude-embedding"]
  VS["Vector Store (Pinecone)<br/>namespace: tenant/domain/doc_type · cosine · 1536-dim"]
  DS --> DL --> PP --> PD --> PM --> CH --> EM --> VS
```

### 3.3 Agent Data Flow (Runtime)

```mermaid
flowchart TD
  UI["User Input"]
  ISL["Input Security Layer<br/>(PII mask · injection scan)"]
  PA["Prompt Assembly"]
  GW["LLM Gateway → LLM Provider"]
  OSL["Output Security Layer<br/>(content filter · PII detokenise)"]
  Resp["Response to User"]
  UI --> ISL
  ISL -. read .-> SS["Session Store (Redis)"]
  ISL -. read .-> LT["Long-Term Memory (Vector)"]
  ISL -. read .-> RAG["RAG Pipeline"]
  ISL --> PA --> GW --> OSL
  OSL -. write .-> SS
  OSL -. write .-> LT
  OSL -. write .-> AUD["Audit Log (immutable)"]
  OSL -. write .-> AN["Analytics Store (Data Lake)"]
  OSL --> Resp
```

---

## 4. Data Classification

| Classification | Description | Examples | Controls |
|---|---|---|---|
| **Confidential** | Highest sensitivity — regulatory impact | Payment card data, SSN, health info | Encrypted at rest + in transit; no LLM exposure; audit on every access |
| **Private** | Personal or business-sensitive | Customer name, email, order history | PII masking before LLM; tenant namespace isolation |
| **Internal** | Non-public business data | Agent traces, cost data, model configs | Role-based access; not exposed externally |
| **Public** | Safe to share externally | Product docs, published FAQs, policies | No restrictions; safe for LLM context |

---

## 5. Data Storage Architecture

| Store | Technology | Data | Retention | Encryption |
|---|---|---|---|---|
| Operational DB | PostgreSQL (HA) | Customers, orders, payments, tickets | Indefinite | AES-256 |
| Vector Store | Pinecone | Document embeddings (per tenant namespace) | Until document deleted | AES-256 |
| Short-term Memory | Redis Cluster | Conversation context, session state | 30 minutes TTL | In-transit TLS |
| Long-term Memory | Pinecone (separate index) | User entity memory, preferences | 12 months rolling | AES-256 |
| Knowledge Graph | Neo4j | Entity relationships, ontology | Indefinite | AES-256 |
| Data Lake | S3 / ADLS (Parquet) | Agent traces, eval results, LLM logs | 7 years | SSE-KMS |
| Prompt Store | PostgreSQL + Git | Prompt templates, versions | Indefinite (versioned) | AES-256 |
| Audit Log | Immutable Object Storage | All AI actions, tool calls, auth events | 7 years WORM | AES-256 |
| Analytics Warehouse | Snowflake / BigQuery | Aggregated KPIs, cost reports | 3 years | Platform-native |

---

## 6. Data Lineage

```mermaid
flowchart TD
  SD["Source Document<br/>ingested 2026-01-15T10:00Z · doc_id: DOC-001"]
  CK["Chunk<br/>chunk_id: CHUNK-001-3 · tokens: 487"]
  EM["Embedding<br/>text-embedding-3-large · dim 1536"]
  VS["Vector Store<br/>namespace: acme/policy/refund · vector_id: VEC-001-3"]
  RQ["Retrieved in Query<br/>query_id: Q-abc123 · score 0.87"]
  LC["LLM Context<br/>prompt_id: PROMPT-cs-1.1.0 · trace_id: T-xyz789"]
  RS["Response<br/>session_id: S-def456 · eval_score 0.91"]
  SD --> CK --> EM --> VS --> RQ --> LC --> RS
```

Every step is recorded in the Data Lake with full lineage metadata — supporting audit, debugging, and model improvement.

---

## 7. Data Quality

| Dimension | Control | Threshold |
|---|---|---|
| Completeness | Required fields validated at ingestion | 100% |
| Freshness | Document TTL alerts for stale knowledge | > 90 days → alert |
| Embedding Coverage | % of documents with valid embeddings | > 99% |
| Retrieval Quality | RAGAS context precision score | > 0.75 |
| PII Detection Rate | % of PII correctly identified | > 99.5% |
| Duplicate Detection | Cosine similarity dedup at ingestion | Threshold > 0.98 → deduplicate |

---

## 8. Data Governance

| Control | Implementation |
|---|---|
| Data Catalogue | All datasets registered with owner, schema, sensitivity, consumers |
| Access Control | Column-level security on operational DB; namespace isolation on vector store |
| Right to Erasure | API to delete all user data across all stores (GDPR Article 17) |
| Data Residency | Tenant namespace pinned to cloud region; cross-region replication opt-in only |
| Schema Registry | All Kafka events use Avro schema with compatibility checks |
| Data Retention Policies | Automated lifecycle rules per store (S3 lifecycle, Redis TTL, PostgreSQL partitioning) |
