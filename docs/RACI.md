# RACI Matrix — AI Evolution & Maturity Platform

**R** = Responsible (does the work)
**A** = Accountable (owns the outcome; signs off)
**C** = Consulted (input sought; two-way communication)
**I** = Informed (kept up to date; one-way communication)

---

## 1. Program-Level Activities

| Activity | Exec Sponsor | Program Dir | AI CoE Lead | Solution Arch | Platform Eng | Agent Dev | DevOps | Security | Data Eng | BA | Change Mgr | Legal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Program charter approval | **A** | R | C | C | I | I | I | I | I | I | I | C |
| Phase gate go/no-go | **A** | R | C | C | C | C | C | C | C | C | C | C |
| Budget approval | **A** | R | C | I | I | I | I | I | I | I | I | I |
| Steering committee | **A** | R | C | I | I | I | I | I | I | C | I | I |
| Vendor selection (SI partner) | C | **A** | C | C | I | I | I | I | I | I | I | C |
| Stakeholder reporting | I | **A/R** | C | I | I | I | I | I | I | R | I | I |
| Risk escalation | **A** | R | C | C | C | C | C | C | C | C | C | C |
| ROI tracking | C | **A** | I | I | I | I | I | I | I | R | I | I |

---

## 2. Architecture & Design

| Activity | Program Dir | AI CoE Lead | Solution Arch | Platform Eng | Agent Dev | DevOps | Security | Data Eng | BA |
|---|---|---|---|---|---|---|---|---|---|
| HLD design | I | C | **A/R** | C | C | C | C | C | C |
| LLD design | I | C | **A** | R | C | C | C | C | I |
| ADR authoring | I | C | **A/R** | C | C | C | C | C | I |
| NFR definition | C | C | **A** | C | C | C | C | C | R |
| Security architecture review | I | C | C | C | I | C | **A/R** | I | I |
| Data architecture design | I | C | C | C | I | C | C | **A/R** | C |
| Integration design | I | C | **A** | R | C | C | C | C | C |
| Architecture governance | I | **A** | R | C | I | I | C | C | I |

---

## 3. Platform Engineering

| Activity | Solution Arch | Platform Eng | Agent Dev | DevOps | Security | Data Eng |
|---|---|---|---|---|---|---|
| LLM Gateway build | C | **A/R** | I | C | C | I |
| RAG pipeline build | C | **A/R** | C | C | C | R |
| Agent Runtime build | C | **A/R** | C | C | C | I |
| Workflow Engine setup | C | **A/R** | C | C | I | I |
| Memory Service build | C | **A/R** | C | C | C | I |
| Tool Registry / MCP build | C | **A/R** | R | C | C | I |
| API Gateway config | C | R | I | **A/R** | C | I |
| Performance optimisation | C | **A** | C | R | I | C |

---

## 4. Agent Development

| Activity | AI CoE Lead | Solution Arch | Agent Dev | Platform Eng | Security | BA | QA |
|---|---|---|---|---|---|---|---|
| Agent system prompt design | **A** | C | R | C | C | C | I |
| Agent tool wiring | C | C | **A/R** | C | C | I | I |
| Agent regression test suite | C | I | **A/R** | I | I | C | R |
| Agent quality evaluation | **A** | I | C | I | I | I | R |
| Bias evaluation | **A/R** | I | C | I | I | C | C |
| Agent deployment to staging | I | I | C | **A** | C | I | R |
| Agent production rollout | C | C | C | **A** | C | C | R |

---

## 5. Integration

| Activity | Solution Arch | Platform Eng | Agent Dev | DevOps | Security | Data Eng | BA |
|---|---|---|---|---|---|---|---|
| CRM integration (Salesforce) | C | **A/R** | C | C | C | I | C |
| ERP integration (SAP) | C | **A/R** | C | C | C | I | C |
| Payment gateway integration | C | **A/R** | C | C | **A/R** | I | C |
| Identity provider integration | C | R | I | C | **A** | I | I |
| Event bus (Kafka) setup | C | **A/R** | I | R | I | C | I |
| Schema registry | C | **A/R** | I | R | I | R | I |
| Integration testing | I | **A** | C | C | C | C | R |

---

## 6. Security & Compliance

| Activity | AI CoE Lead | Platform Eng | DevOps | Security | Legal | Compliance | BA |
|---|---|---|---|---|---|---|---|
| PII detection pipeline | I | C | I | **A/R** | C | C | I |
| Prompt injection controls | **A** | C | I | R | I | I | I |
| RBAC configuration | I | C | C | **A/R** | I | C | I |
| mTLS service mesh | I | I | **A/R** | C | I | I | I |
| Secrets management | I | C | **A/R** | C | I | I | I |
| Audit logging | I | C | C | **A/R** | C | C | I |
| Pen test coordination | I | C | C | **A** | I | I | I |
| GDPR erasure API | I | R | I | C | **A** | C | I |
| SOC 2 evidence collection | I | C | C | R | I | **A** | I |
| EU AI Act assessment | **A/R** | I | I | C | C | C | I |

---

## 7. Data & Knowledge Management

| Activity | AI CoE Lead | Platform Eng | Data Eng | Security | BA | Business SME |
|---|---|---|---|---|---|---|
| Knowledge base content audit | C | I | R | I | **A** | R |
| Document ingestion pipeline | I | C | **A/R** | C | I | I |
| Vector DB management | I | C | **A/R** | C | I | I |
| Knowledge refresh process | **A** | I | R | I | C | R |
| Data quality monitoring | I | I | **A/R** | C | C | I |
| Data catalogue | I | I | **A/R** | C | C | I |
| Data Lake management | I | C | **A/R** | C | I | I |

---

## 8. Testing & Quality

| Activity | Program Dir | Solution Arch | Platform Eng | Agent Dev | QA | BA | Security |
|---|---|---|---|---|---|---|---|
| Test strategy | C | C | C | C | **A/R** | C | C |
| Unit tests | I | I | R | R | **A** | I | I |
| Integration tests | I | C | R | C | **A/R** | I | I |
| AI quality gates | C | I | C | R | **A/R** | I | I |
| Performance testing | I | C | C | I | **A/R** | I | I |
| UAT facilitation | C | I | I | I | C | **A/R** | I |
| UAT sign-off | I | I | I | I | C | C | I |
| Security test | I | I | C | I | C | I | **A/R** |

---

## 9. DevOps & Infrastructure

| Activity | Platform Eng | DevOps | Security | Data Eng |
|---|---|---|---|---|
| Kubernetes cluster setup | C | **A/R** | C | I |
| Helm chart library | C | **A/R** | I | I |
| CI/CD pipelines | C | **A/R** | C | I |
| Terraform IaC | C | **A/R** | C | C |
| GitOps (ArgoCD) | C | **A/R** | I | I |
| DR setup | C | **A/R** | C | C |
| Cost management | **A** | R | I | I |

---

## 10. Change Management & Training

| Activity | Program Dir | AI CoE Lead | BA | Change Mgr | Business SME |
|---|---|---|---|---|---|
| Stakeholder comm plan | C | I | C | **A/R** | I |
| User training (agents) | I | I | C | **A** | R |
| Developer training | C | R | I | **A** | I |
| Manager dashboard training | I | I | R | **A** | C |
| Adoption tracking | C | I | R | **A** | I |
| Hypercare coordination | C | I | C | **A/R** | C |

---

## 11. AI Governance

| Activity | Exec Sponsor | AI CoE Lead | Solution Arch | Security | Legal | Compliance |
|---|---|---|---|---|---|---|
| AI Governance Policy | C | **A/R** | C | C | C | C |
| Model cards | I | **A** | C | C | I | I |
| AI Review Board (chair) | C | **A** | C | C | C | C |
| Bias audit process | I | **A/R** | I | C | C | C |
| Responsible AI training | I | **A** | I | C | C | I |
| AI CoE operating model | **A** | R | I | I | I | I |
| Regulatory monitoring | I | C | I | I | **A** | R |
