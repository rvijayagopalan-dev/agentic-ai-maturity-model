# Risk Register — AI Evolution & Maturity Platform

## Risk Rating Scale

| Score | Likelihood | Impact |
|---|---|---|
| 1 | Rare (< 10%) | Negligible |
| 2 | Unlikely (10–30%) | Minor |
| 3 | Possible (30–50%) | Moderate |
| 4 | Likely (50–70%) | Significant |
| 5 | Almost certain (> 70%) | Critical |

**Risk Score = Likelihood × Impact**
- 1–6: Low | 7–12: Medium | 13–19: High | 20–25: Critical

---

## Risk Register

### Technical Risks

| ID | Risk | Category | L | I | Score | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|---|---|
| T-01 | LLM provider outage causes service degradation | Technical | 3 | 4 | 12 | **Medium** | Multi-provider fallback in LLM Gateway (Anthropic → OpenAI → Bedrock); tested monthly | Platform Eng |
| T-02 | Agent produces hallucinated/incorrect output at scale | Technical | 3 | 5 | 15 | **High** | RAG grounding; faithfulness evaluation; human-in-loop for financial actions; output content filter | AI CoE |
| T-03 | Prompt injection attack bypasses safety controls | Technical | 2 | 5 | 10 | **Medium** | Injection scanner; prompt hardening; output filter; security testing per phase | Security |
| T-04 | Vector database performance degrades at scale | Technical | 2 | 3 | 6 | **Low** | Load testing per phase; index partitioning; Pinecone managed SLA; pgvector fallback plan | Platform Eng |
| T-05 | Agent iteration loops / runaway token consumption | Technical | 3 | 3 | 9 | **Medium** | Max iteration limits; token budget hard cap; LLM Gateway cost circuit breaker | Platform Eng |
| T-06 | Integration API changes break agent tools | Technical | 3 | 3 | 9 | **Medium** | API version pinning; contract tests; change notification SLA with CRM/ERP teams | Integration |
| T-07 | Knowledge base becomes stale / outdated | Technical | 4 | 3 | 12 | **Medium** | Document freshness monitoring; 90-day alert; automated re-ingestion triggers | Data Eng |
| T-08 | Multi-agent deadlock or circular delegation | Technical | 2 | 3 | 6 | **Low** | Supervisor timeout; max delegation depth limit; traced and alerted | Platform Eng |
| T-09 | Model quality degrades after LLM provider update | Technical | 3 | 4 | 12 | **Medium** | Model version pinning; regression suite on every model update; staged rollout | AI CoE |
| T-10 | Memory poisoning via malicious user input | Technical | 2 | 4 | 8 | **Medium** | Memory input validation; namespace isolation; TTL enforcement; anomaly detection | Security |

---

### Project / Delivery Risks

| ID | Risk | Category | L | I | Score | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|---|---|
| P-01 | Key AI engineering talent unavailable / attrition | Project | 3 | 4 | 12 | **Medium** | Competitive compensation; knowledge transfer; SI backup capacity; documentation standards | CHRO |
| P-02 | SAP ERP test environment unavailable on time | Project | 4 | 3 | 12 | **Medium** | 8-week lead time in project plan; parallel development with mock; escalation path to SAP | Program Dir |
| P-03 | Business SME unavailability for knowledge curation | Project | 4 | 3 | 12 | **Medium** | Dedicated SME allocation (20% time); curation tool to reduce effort; incentivise participation | BA |
| P-04 | Phase scope creep extends timelines | Project | 4 | 3 | 12 | **Medium** | Phase gate criteria enforced; change control board; scope freeze 2 weeks before phase end | Program Dir |
| P-05 | UAT sign-off delays go-live | Project | 3 | 2 | 6 | **Low** | UAT kick-off 2 weeks before scheduled end; pre-UAT walkthroughs; escalation path | BA |
| P-06 | SI partner delivery quality below expectations | Project | 2 | 4 | 8 | **Medium** | Code review gates; quality KPIs in contract; right-to-audit; backup SI identified | Program Dir |
| P-07 | Cloud infrastructure provisioning delays | Project | 2 | 3 | 6 | **Low** | 4-week lead time in plan; pre-approved cloud budget; IaC automated provisioning | DevOps |
| P-08 | Program loses executive sponsorship mid-way | Project | 2 | 5 | 10 | **Medium** | Steering committee with CTO + CFO; monthly ROI reporting; named successor sponsor | Program Dir |

---

### Security & Compliance Risks

| ID | Risk | Category | L | I | Score | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|---|---|
| S-01 | PII leak via LLM context or response | Security | 2 | 5 | 10 | **Medium** | PII detection + masking pipeline; output filter; no PII in long-term memory; regular audits | Security |
| S-02 | LLM provider data breach (training data exposure) | Security | 1 | 5 | 5 | **Low** | Enterprise data processing agreement; zero-retention API option; evaluate on-prem for sensitive data | CISO |
| S-03 | Agent performs unauthorised actions (tool abuse) | Security | 2 | 5 | 10 | **Medium** | Agent RBAC (tool allowlist); human approval for financial/destructive actions; audit every tool call | Security |
| S-04 | GDPR right-to-erasure not fulfilled within 30 days | Compliance | 2 | 4 | 8 | **Medium** | Erasure API covering all stores; tested per phase; GDPR DPO signoff before production | Legal |
| S-05 | EU AI Act high-risk classification triggers obligations | Compliance | 3 | 4 | 12 | **Medium** | Risk classification per agent use case; model cards; human oversight for high-risk; legal review | AI CoE |
| S-06 | SOC 2 audit finding causes customer concern | Compliance | 2 | 3 | 6 | **Low** | Continuous control monitoring; pre-audit readiness assessment; remediation SLA | Compliance |
| S-07 | API key compromise (LLM provider) | Security | 2 | 4 | 8 | **Medium** | Keys stored in Vault only; rotation every 30 days; anomalous usage alerts; revocation < 15 min | Security |

---

### Business / Strategic Risks

| ID | Risk | Category | L | I | Score | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|---|---|
| B-01 | Agent quality below expectations → customer complaints | Business | 3 | 4 | 12 | **Medium** | CSAT monitoring; 10% traffic canary; human fallback always available; phased rollout | Product |
| B-02 | Employee resistance to AI adoption | Business | 4 | 3 | 12 | **Medium** | Early stakeholder engagement; redeployment not redundancy messaging; training programme | Change Mgr |
| B-03 | Regulatory change invalidates AI use case | Business | 2 | 4 | 8 | **Medium** | Legal monitoring; AI Act compliance; flexible agent config; modular architecture | Legal |
| B-04 | LLM pricing increase makes cost model unviable | Business | 3 | 3 | 9 | **Medium** | Multi-provider fallback; model tiering; cost monitoring with hard caps; vendor contract review | FinOps |
| B-05 | Competitors launch AI capabilities first | Business | 3 | 3 | 9 | **Medium** | Phased delivery — Phase 1 in 3 months; prioritise customer-facing milestones; comms plan | CTO |
| B-06 | ROI below forecast — program funding withdrawn | Business | 2 | 5 | 10 | **Medium** | Monthly KPI reporting; conservative scenario still ROI-positive; pivot plan per phase | CFO + CTO |
| B-07 | Agent makes financially incorrect decision at scale | Business | 2 | 5 | 10 | **Medium** | Human approval for > $500 refunds; daily reconciliation; transaction limits; rollback capability | Finance |

---

## Risk Summary Dashboard

| Rating | Count | IDs |
|---|---|---|
| Critical (20–25) | 0 | — |
| High (13–19) | 1 | T-02 |
| Medium (7–12) | 17 | T-01, T-03, T-05, T-06, T-07, T-09, T-10, P-01, P-02, P-03, P-04, P-06, P-08, S-01, S-03, S-05, B-01, B-02, B-06, B-07 |
| Low (1–6) | 8 | T-04, T-08, P-05, P-07, S-02, S-06, B-03, B-04, B-05 |

---

## Top 5 Risks to Monitor

| Rank | ID | Risk | Mitigating Action |
|---|---|---|---|
| 1 | T-02 | Agent hallucination at scale | Faithfulness eval + RAG + HITL for financial actions |
| 2 | P-01 | AI talent attrition | Retention plan + SI backup capacity |
| 3 | S-01 | PII leak via LLM | PII masking pipeline + output filter + audits |
| 4 | B-01 | Agent quality below expectations | Canary rollout + CSAT monitoring + human fallback |
| 5 | B-06 | ROI below forecast | Monthly KPI reporting + conservative scenario planning |

---

## Review Cadence

| Review | Frequency | Participants |
|---|---|---|
| Risk register update | Monthly | Program Director + team leads |
| Top risk deep-dive | Monthly | Steering committee |
| New risk identification | Per phase kickoff | Full program team |
| Risk audit (external) | Annual | External auditor |
