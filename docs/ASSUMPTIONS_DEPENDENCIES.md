# Assumptions & Dependencies Log — AI Evolution & Maturity Platform

## 1. Assumptions

### 1.1 Technical Assumptions

| ID | Assumption | Impact if Wrong | Phase |
|---|---|---|---|
| A-T-01 | Anthropic API will remain commercially available and stable throughout the program | P1 — must source alternative primary LLM provider | All |
| A-T-02 | CRM (Salesforce) API version remains stable (no major breaking changes) | Rework of API adapters; 2–4 weeks delay | P3+ |
| A-T-03 | ERP (SAP) provides a stable REST API endpoint for order management | Major delay to Phase 3; may need custom integration | P3+ |
| A-T-04 | Cloud provider (Azure) SLA of 99.9%+ maintained for AKS, PostgreSQL, Storage | DR may be invoked more frequently | All |
| A-T-05 | Pinecone vector database can sustain 100M+ vectors per tenant within budget | Need to re-evaluate vector DB vendor | P2+ |
| A-T-06 | LangGraph framework is production-stable and maintained | May need to migrate to alternative (CrewAI, custom) | P5+ |
| A-T-07 | MCP (Model Context Protocol) adoption continues and remains compatible | Tool registry requires rework | P3+ |
| A-T-08 | Existing knowledge base documents are in machine-readable format (PDF, HTML, DOCX) | Significant manual digitisation effort required | P2 |
| A-T-09 | Internal network connectivity to SAP is available from Azure private network | VPN/ExpressRoute setup required; 6-week lead time | P3 |
| A-T-10 | Kubernetes (AKS) supports all required node types in target Azure regions | May need region fallback or instance substitution | All |

---

### 1.2 Business Assumptions

| ID | Assumption | Impact if Wrong | Phase |
|---|---|---|---|
| A-B-01 | Executive sponsorship remains stable across program duration (38 months) | Program may be paused or descoped | All |
| A-B-02 | Business SMEs available for knowledge curation at 20% of their time | Phase 2 delayed; knowledge quality impacted | P2 |
| A-B-03 | Agent redeployment policy (no redundancies from AI) is approved and communicated before Phase 1 | Change resistance may derail adoption | P1 |
| A-B-04 | Current support volume (500 sessions/day) remains within ±50% during AI rollout | Infrastructure scaling and cost model recalibration needed | All |
| A-B-05 | CSAT measurement methodology remains consistent to allow baseline comparison | KPI tracking becomes unreliable | All |
| A-B-06 | Business process ownership for each workflow is clearly assigned before Phase 4 | Workflow design stalls; scope disputes | P4 |
| A-B-07 | UAT resources (business users) available for 2-week windows per phase | Go-live delays per phase | All |
| A-B-08 | Enterprise AI usage policy permits agentic autonomy up to $500 per transaction without manual approval | Approval policy requires renegotiation; reduces automation benefit | P4+ |
| A-B-09 | International expansion is a Year 2 priority (to realise 24/7 global coverage benefit) | Phase 9 benefits deferred | P8+ |

---

### 1.3 Compliance & Legal Assumptions

| ID | Assumption | Impact if Wrong | Phase |
|---|---|---|---|
| A-C-01 | EU AI Act risk classification for customer support AI is "Limited Risk" (not High Risk) | Full High Risk compliance obligations apply; significant re-architecture | All |
| A-C-02 | Anthropic's Enterprise Agreement covers GDPR data processing requirements | Alternative DPA negotiation required; potential data residency changes | P1 |
| A-C-03 | Automated refund processing up to $500 is legally permissible without explicit human sign-off | Hard cap reduced; less automation; reduced benefit | P4+ |
| A-C-04 | SOC 2 Type II audit scope can be incrementally extended per phase (not a full audit per phase) | Audit cost and timeline significantly increase | All |
| A-C-05 | Data residency in primary Azure region meets all customer contractual requirements | Significant re-architecture for multi-region data segregation | All |

---

### 1.4 People & Organisation Assumptions

| ID | Assumption | Impact if Wrong | Phase |
|---|---|---|---|
| A-P-01 | 4 internal AI Platform engineers can be hired/identified within Month 1 | Phase 1 delayed; more SI dependency | P1 |
| A-P-02 | SI partner is selected within 4 weeks of program start (RFP complete) | Phase 1 delayed by 4–6 weeks | P1 |
| A-P-03 | Internal engineers have baseline Python proficiency (no LLM experience required) | Extended training period; slower initial velocity | P1 |
| A-P-04 | Security team can dedicate 1 FTE to AI security reviews for duration | Security reviews become bottleneck; phase delays | All |
| A-P-05 | Legal/Compliance team can review AI governance outputs within 2 weeks per phase | Phase gates delayed | All |

---

## 2. Dependencies

### 2.1 Internal Dependencies

| ID | Dependency | Description | Required By | Risk |
|---|---|---|---|---|
| D-I-01 | Cloud account setup and networking | Azure subscription provisioned; VNet, subnets, private endpoints configured | Phase 1, Week 2 | Low |
| D-I-02 | Identity provider (Azure AD) integration | Service principals and OIDC configuration for platform | Phase 1, Week 3 | Low |
| D-I-03 | Salesforce API access | Service account provisioned; API documentation provided; sandbox environment available | Phase 3, Month 7 | Medium |
| D-I-04 | SAP API access | RFC or REST endpoint configured; sandbox available; documentation provided | Phase 3, Month 7 | High |
| D-I-05 | Payment gateway sandbox | Sandbox credentials; webhook endpoint registration | Phase 3, Month 8 | Low |
| D-I-06 | Knowledge base access | Read access to Confluence, SharePoint, PDF repositories | Phase 2, Month 4 | Medium |
| D-I-07 | Firewall rules approved | Internal security team approval for service-to-service network paths | Per phase, 2 weeks | Medium |
| D-I-08 | Data classification exercise | All data in scope classified before ingestion pipelines built | Phase 2, Month 4 | Medium |
| D-I-09 | AI Governance Policy approved | Board-level approval required before agent autonomy enabled | Phase 5, Month 13 | Medium |
| D-I-10 | Enterprise token budget approved | Finance sign-off on monthly LLM API spend caps | Phase 1, Month 1 | Low |

---

### 2.2 External Dependencies

| ID | Dependency | Provider | Required By | Risk |
|---|---|---|---|---|
| D-E-01 | Anthropic Enterprise Agreement | Anthropic | Phase 1, Month 1 | Low |
| D-E-02 | OpenAI fallback API access | OpenAI | Phase 1, Month 1 | Low |
| D-E-03 | Pinecone account and index provisioning | Pinecone | Phase 2, Month 4 | Low |
| D-E-04 | LangGraph / LangSmith enterprise licence | LangChain | Phase 5, Month 13 | Low |
| D-E-05 | Neo4j Enterprise licence | Neo4j | Phase 7, Month 21 | Low |
| D-E-06 | Langfuse cloud account | Langfuse | Phase 1, Month 1 | Low |
| D-E-07 | HashiCorp Vault Enterprise licence | HashiCorp | Phase 1, Month 2 | Low |
| D-E-08 | External penetration test firm engaged | TBD | Phase 3, Month 9 | Medium |
| D-E-09 | Logistics carrier API access (FedEx, UPS, DHL) | Carriers | Phase 3, Month 7 | Medium |

---

### 2.3 Dependency Map by Phase

| Phase | Blocking Dependencies |
|---|---|
| Phase 1 | D-I-01, D-I-02, D-I-10, D-E-01, D-E-06, A-P-01, A-P-02 |
| Phase 2 | D-I-06, D-I-08, D-E-03, A-B-02 |
| Phase 3 | D-I-03, D-I-04, D-I-05, D-I-07, D-E-08, D-E-09 |
| Phase 4 | D-I-06 (refreshed), A-B-06, A-B-08 |
| Phase 5 | D-I-09, D-E-04, A-C-01, A-C-03 |
| Phase 6 | All Phase 5 dependencies met |
| Phase 7 | D-E-05, A-B-06 (all domains) |
| Phase 8 | A-B-09, A-P-04 (AI CoE hired) |
| Phase 9 | All prior dependencies met; autonomous action policy approved |

---

## 3. Assumption Validation Plan

| ID | Validation Method | Responsible | Target Date |
|---|---|---|---|
| A-T-03 | SAP API technical spike — call test endpoint | Platform Eng | Month 1, Week 3 |
| A-T-08 | Knowledge base audit — format and quality assessment | Data Eng | Month 1, Week 4 |
| A-C-01 | EU AI Act risk assessment (legal review) | Legal + AI CoE | Month 2 |
| A-B-03 | HR policy communication drafted and reviewed | CHRO | Month 1 |
| A-B-06 | Business process ownership workshop | BA | Month 9 |
| A-P-01 | Hiring pipeline launched | CHRO | Month 1, Week 1 |
