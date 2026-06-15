# Context Diagram — AI Evolution & Maturity Platform

## System Context

The AI Evolution Platform is an enterprise capability that sits between business users, customers, and the underlying AI/data infrastructure. It evolves across 11 maturity levels — each level expanding the system boundary to include more autonomous, intelligent capabilities.

---

## Level 0–2 Context (Traditional → Prompt Engineering)

```mermaid
flowchart LR
  Cust["Customer<br/>(Web / App)"]
  subgraph EB["ENTERPRISE BOUNDARY"]
    App["Customer Support App<br/>(Chat / Portal / Email)"]
    Data["CRM · ERP · DB"]
  end
  LLM["LLM Provider (External)<br/>OpenAI · Anthropic · Azure · Bedrock"]
  Cust <--> App
  App <--> Data
  App --> LLM
```

---

## Level 3–5 Context (RAG → Workflow AI)

```mermaid
flowchart TD
  Cust["Customer / Agent"]
  subgraph Platform["AI-Augmented Support Platform"]
    PE["Prompt Engine"]
    RAG["RAG Pipeline"]
    WF["Workflow Orchestrator"]
  end
  LLM["LLM Provider<br/>(External)"]
  VDB["Vector DB<br/>Pinecone / Weaviate"]
  KB["Knowledge Base<br/>Confluence"]
  API["External APIs<br/>Order Mgmt · Payment · CRM"]
  EDIL["Enterprise Data &amp; Identity Layer<br/>AD/SSO · Data Lake · Kafka · API Gateway"]
  Cust <--> Platform
  PE --> LLM
  RAG --> VDB
  RAG --> KB
  WF --> API
  Platform --> EDIL
```

---

## Level 6–7 Context (Single Agent → Multi-Agent)

```mermaid
flowchart TD
  User["Customer /<br/>Internal User"]
  subgraph AOL["Agent Orchestration Layer"]
    Sup["Supervisor Agent"]
    CS["CS Agent"]
    RF["Refund Agent"]
    SH["Shipping Agent"]
    FR["Fraud Agent"]
    KN["Knowledge Agent"]
    Sup --> CS & RF & SH & FR & KN
  end
  Mem["Agent Memory<br/>Short / Long-Term Store"]
  Tool["Tool Layer<br/>MCP / API Registry"]
  Ext["External Systems<br/>CRM · ERP · Payment · Logistics · Fraud DB"]
  User <--> Sup
  AOL --> Mem
  AOL --> Tool
  Tool --> Ext
```

---

## Level 8–10 Context (Agentic Enterprise → Autonomous Enterprise)

```mermaid
flowchart TD
  Ext["External World<br/>Customers · Partners · Regulators"]
  CP["Enterprise AI Control Plane<br/>Policy · Governance · CoE"]
  subgraph WF["AI Workforce Platform"]
    direction LR
    S["Sales<br/>Agents"]
    SV["Service<br/>Agents"]
    F["Finance<br/>Agents"]
    H["HR<br/>Agents"]
    R["Risk &amp;<br/>Compliance"]
  end
  subgraph FN["Foundation"]
    direction LR
    AP["AI Platform<br/>LLM GW · Registry"]
    DF["Data Fabric<br/>Lake / Mesh"]
    AO["AgentOps /<br/>Observability"]
    KG["Knowledge Graph<br/>Ontology + Semantic"]
  end
  Ext <--> CP
  CP --> WF
  WF --> FN
```

---

## External Actors & Systems

| Actor / System | Type | Interaction |
|---|---|---|
| End Customer | Human | Chat, Email, Portal, Voice |
| Enterprise Employee | Human | Internal tooling, dashboards |
| LLM Provider | External SaaS | API calls (OpenAI, Anthropic, Bedrock) |
| Vector Database | External/Internal | Embedding storage & retrieval |
| CRM (Salesforce etc.) | Internal System | Customer data read/write |
| ERP (SAP etc.) | Internal System | Order, inventory, finance data |
| Payment Gateway | External | Refund/payment processing |
| Identity Provider (AD/SSO) | Internal | AuthN/AuthZ |
| Event Bus (Kafka) | Internal | Async messaging between agents |
| Monitoring Platform | Internal | Logs, traces, metrics |
| Regulatory Bodies | External | Compliance reporting |
| AI Model Registry | Internal | Model versioning and promotion |
