# Data Agents

Data Agents are AI-powered autonomous or semi-autonomous software entities that can understand, discover, transform, govern, analyze, and manage data using natural language, reasoning, tools, and workflows.

Think of them as the evolution:

```text
SQL Scripts
    ↓
ETL Jobs
    ↓
Data Pipelines
    ↓
Data Products
    ↓
Data Services
    ↓
Data Agents
```

A Data Agent combines:

* Data Engineering
* Data Governance
* Data Quality
* Analytics
* AI Reasoning
* Workflow Automation

into a single intelligent capability.

> **Two distinct ideas, two distinct numbering schemes.** This document uses *agent **types*** (the Taxonomy below — Query Agent, Analytics Agent, … — capabilities, unnumbered) and *maturity **stages*** (the Maturity Model — L0–L5 — how far an organisation has progressed). They are not the same axis. The single canonical L0–L9 ladder that reconciles every model lives in **[gap-closure-plan.md](gap-closure-plan.md)**.

---

## Why Data Agents Exist

Traditional Data Platforms require:

```text
Business User
    ↓
Analyst
    ↓
Data Engineer
    ↓
Platform Team
    ↓
Database
```

Data Agents reduce the layers:

```text
Business User
    ↓
Data Agent
    ↓
Data Platform
```

Example:

User asks:

> "Show me customer churn by region for the last 12 months and explain anomalies."

Agent performs:

1. Dataset discovery
2. Metadata lookup
3. Query generation
4. Data quality checks
5. Statistical analysis
6. Visualization
7. Narrative explanation

without human intervention.

---

## Data Agent Reference Architecture

```text
┌───────────────────────────────┐
│ Human / Application           │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Agent Interface Layer         │
│ Chat · API · Voice            │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Agent Orchestrator            │
│ Planner · Coordinator         │
└──────────────┬────────────────┘
               │
 ┌─────────────┼──────────────┐
 │             │              │
 ▼             ▼              ▼

Metadata    Data       Governance
Agent       Agent      Agent

 │             │              │
 └─────────────┼──────────────┘
               │
               ▼

        Data Platform

    Warehouse · Lakehouse
```

---

## Enterprise Data Agent Taxonomy

These entries catalog Data Agent **types** by capability. They are *not* maturity levels — an organisation typically introduces them in roughly the order shown, but the numbering of the [Maturity Model](#data-agent-maturity-model) is a separate axis.

### Query Agent

Converts natural language into queries.

Example:

```text
User:
Top customers by revenue

Agent:
SQL Generated
```

Capabilities:

* SQL generation
* Query optimization
* Result explanation

Tools:

* OpenAI
* LangChain
* LlamaIndex

---

### Analytics Agent

Performs analysis.

Tasks:

* Trend analysis
* Forecasting
* Segmentation
* Root cause analysis

Example:

```text
Why did sales drop?
```

Agent:

* Retrieves data
* Performs analysis
* Explains causes

---

### Data Engineering Agent

Automates data engineering.

Tasks:

```text
Source Discovery
Pipeline Creation
Schema Mapping
Transformation Design
Pipeline Testing
Deployment
```

Example:

```text
Connect Salesforce to Snowflake
```

Agent creates:

* ingestion pipeline
* mapping rules
* transformations

---

### Data Quality Agent

Monitors and remediates quality issues.

Checks:

* Missing values
* Duplicates
* Schema drift
* Freshness
* Data contracts

Actions:

```text
Detect
Investigate
Fix
Validate
```

---

### Data Governance Agent

Enforces governance.

Responsibilities:

* Classification
* Lineage
* Compliance
* Privacy
* Retention

Example:

Detects PII and automatically applies masking.

---

### Metadata Agent

Maintains enterprise knowledge.

Responsibilities:

* Cataloging
* Discovery
* Semantic relationships
* Documentation

Acts as enterprise data librarian.

---

### Data Steward Agent

Business-facing governance.

Responsibilities:

* Business glossary
* KPI definitions
* Data ownership
* Data policies

Bridges business and engineering.

---

### Data Product Agent

Manages data products.

Tasks:

```text
Design
Publish
Version
Monitor
Retire
```

Supports Data Mesh architectures.

---

### Autonomous Data Platform Agent

Operates the platform itself.

Responsibilities:

* Cost optimization
* Capacity planning
* Workload balancing
* Auto scaling

Example:

Automatically moves cold data to cheaper storage.

---

## Multi-Agent Data Ecosystem

```text
                    User
                      │
                      ▼
              Data Concierge
                  Agent
                      │
 ┌────────────────────┼────────────────────┐
 │                    │                    │

Metadata         Analytics         Governance
Agent             Agent              Agent

 │                    │                    │

 └─────────────┬──────┴──────┬────────────┘
               │             │

          Engineering     Quality
             Agent         Agent

               │
               ▼

       Enterprise Data Platform
```

---

## Agentic Data Platform Layers

### Layer 1: Data Sources

* ERP
* CRM
* SaaS
* APIs
* IoT
* Documents

---

### Layer 2: Data Fabric

Provides:

* Discovery
* Virtualization
* Federation

Examples:

* Denodo
* IBM Data Fabric

---

### Layer 3: Knowledge Layer

Components:

* Metadata graph
* Lineage graph
* Ontologies
* Semantic models

Tools:

* Neo4j
* DataHub

---

### Layer 4: Agent Layer

Specialized agents:

```text
Query Agent
Engineering Agent
Governance Agent
Quality Agent
Analytics Agent
```

---

### Layer 5: Agent Mesh

Coordinates agents.

Functions:

* Discovery
* Routing
* Collaboration
* Delegation

Similar to:

```text
Service Mesh
for
Agents
```

but with reasoning and planning capabilities.

---

## Data Agent Capability Model

```text
Observe
    ↓
Understand
    ↓
Reason
    ↓
Plan
    ↓
Act
    ↓
Learn
    ↓
Optimize
```

---

## Data Agent Maturity Model

A coarse, organisation-level view of how far Data Agent adoption has progressed. (For the detailed, canonical **L0–L9** ladder used across this folder, see **[gap-closure-plan.md](gap-closure-plan.md)**.)

### Stage 0 — Traditional

```text
Manual SQL
```

---

### Stage 1 — AI Assisted

```text
Text → SQL
```

---

### Stage 2 — Workflow Agent

```text
Query
Analyze
Explain
```

---

### Stage 3 — Autonomous Data Agent

```text
Discover
Transform
Validate
Deploy
```

---

### Stage 4 — Multi-Agent Data Platform

```text
Agent Collaboration
```

---

### Stage 5 — Self-Driving Data Platform

```text
Self-Healing
Self-Governing
Self-Optimizing
```

---

## Enterprise Gaps Preventing Full Data-Agent Adoption

1. Semantic Understanding Gap
2. Metadata Quality Gap
3. Data Lineage Gap
4. Governance Automation Gap
5. Trust & Explainability Gap
6. Cross-System Context Gap
7. Deterministic Execution Gap
8. Agent Coordination Gap
9. Cost Control Gap
10. Enterprise Security Gap

> Each of these gaps is mapped to a concrete closure action in **[gap-closure-plan.md](gap-closure-plan.md)**.

---

## Future State: Agentic Data Mesh

```text
                 Business Domains

      Sales      Finance      HR      Supply Chain
         │           │          │           │

         ▼           ▼          ▼           ▼

      Data Product Agents (Domain Agents)

         │           │          │           │

         └───────────┼──────────┘

                     ▼

              Agent Mesh

                     ▼

          Enterprise Knowledge Graph

                     ▼

              Autonomous Platform
```

The likely evolution path:

```text
ETL
  ↓
Data Warehouse
  ↓
Data Lake
  ↓
Lakehouse
  ↓
DataOps
  ↓
Data Mesh
  ↓
AI-Assisted Data Platform
  ↓
Multi-Agent Data Platform
  ↓
Autonomous Data Platform
  ↓
Self-Driving Enterprise Data Ecosystem
```

Within a broader Enterprise Architect → AI Architect → Quantum Architect roadmap, Data Agents are one of the foundational agent domains — alongside Platform Agents, Security Agents, FinOps Agents, DevOps Agents, Enterprise Architecture Agents, and Knowledge Agents — all coordinated through an enterprise Agent Mesh and Knowledge Graph.
