# Non-Functional Requirements — AI Evolution & Maturity Platform

## 1. Overview

This document defines the measurable non-functional requirements (NFRs) for the AI Evolution Platform, organised by quality attribute. Requirements are mapped to maturity levels where applicable — earlier phases have relaxed targets that tighten as the platform matures.

---

## 2. Performance

### 2.1 Latency

| Requirement | L1–3 Target | L4–7 Target | L8–10 Target | Measurement Point |
|---|---|---|---|---|
| Chat response first token | < 800ms | < 600ms | < 500ms | API Gateway egress |
| Chat response complete (P95) | < 5s | < 4s | < 3s | API Gateway egress |
| RAG retrieval latency (P95) | < 500ms | < 300ms | < 200ms | Vector DB response |
| Tool call latency (P95) | N/A | < 2s | < 1s | Tool Router response |
| Agent task complete (P95) | N/A | < 30s | < 20s | Session close |
| Workflow end-to-end (P95) | N/A | < 5 min | < 3 min | Workflow completion event |
| LLM Gateway routing overhead | < 50ms | < 30ms | < 20ms | Gateway internal |

### 2.2 Throughput

| Requirement | L1–3 Target | L4–7 Target | L8–10 Target |
|---|---|---|---|
| Concurrent active sessions | 100 | 1,000 | 10,000 |
| LLM requests per second | 10 | 100 | 500 |
| Document ingestion rate | 50 docs/hr | 500 docs/hr | 5,000 docs/hr |
| Agent task executions per minute | N/A | 100 | 1,000 |
| Tool calls per second | N/A | 200 | 2,000 |

---

## 3. Availability & Reliability

| Requirement | Target | Notes |
|---|---|---|
| Platform availability (SLA) | 99.9% (L1–7) / 99.95% (L8–10) | Measured monthly, excluding planned maintenance |
| LLM Gateway availability | 99.95% | Multi-provider failover provides headroom |
| Agent service availability | 99.9% per agent type | Each agent type independently available |
| Vector DB availability | 99.99% | Pinecone managed SLA |
| Data Lake availability | 99.99% | Cloud object storage SLA |
| Mean Time Between Failures (MTBF) | > 720 hours | Per critical service |
| Mean Time to Recovery (MTTR) | < 15 minutes | Automated rollback target |
| Planned maintenance window | < 4 hours/month | Out-of-hours, with advance notice |
| Zero-downtime deployments | Required (L4+) | Blue-green or rolling deployments |

---

## 4. Scalability

| Requirement | Specification |
|---|---|
| Horizontal scaling | All stateless services scale horizontally via HPA |
| Scale-up time | Agent pods: cold start < 60s; warm < 10s |
| Elastic burst capacity | Handle 10x normal load for up to 30 minutes |
| Multi-tenancy | Support up to 100 enterprise tenants on shared infrastructure |
| Data volume | Vector store: up to 100M vectors per tenant |
| Knowledge base size | Up to 1M documents per tenant |
| Agent registry | Up to 1,000 registered agent types |

---

## 5. Security

| Requirement | Specification |
|---|---|
| Authentication | All APIs require OAuth 2.0 / OIDC; no anonymous access |
| Authorisation | RBAC enforced at API Gateway + Tool layer; ABAC for data |
| Transport encryption | TLS 1.3 (external); mTLS 1.3 (internal service mesh) |
| Data at rest | AES-256 for all persistent stores |
| Secrets management | No secrets in code, config, or environment variables |
| PII handling | Detected and masked before any LLM call; 99.5% detection rate |
| Audit logging | All AI actions logged immutably within 1 second |
| Prompt injection detection | 99% detection rate on known injection patterns |
| Penetration testing | Annual external pentest + quarterly internal scans |
| Vulnerability patching | Critical: < 24h; High: < 7 days; Medium: < 30 days |
| MFA | Required for all human access to production systems |
| Session token TTL | API: 1 hour; Agent tokens: 15 minutes |

---

## 6. Disaster Recovery

| Requirement | Specification |
|---|---|
| Recovery Time Objective (RTO) | 15 minutes (automated failover); 60 minutes (manual) |
| Recovery Point Objective (RPO) | 5 minutes (streaming replication); 1 hour (snapshots) |
| Backup frequency | Databases: continuous streaming; snapshots every 6 hours |
| Backup retention | 30 days rolling; monthly archive for 7 years |
| DR test frequency | Quarterly full DR exercise; monthly partial test |
| Cross-region replication | Active-passive (L1–7); Active-active (L8–10) |
| Data loss tolerance | Zero tolerance for financial transaction data |

---

## 7. Compliance & Governance

| Requirement | Specification |
|---|---|
| Audit log retention | 7 years (immutable WORM storage) |
| Data residency | Tenant data must not leave designated cloud region |
| GDPR compliance | Right to erasure within 30 days of request |
| SOC 2 Type II | Annual audit; continuous control monitoring |
| AI Act (EU) compliance | Human oversight, transparency, and risk classification documented |
| Model card availability | Required for every model deployed to production |
| Bias audit frequency | Quarterly evaluation of model outputs per demographic |
| Change management | All production changes require approved change request |

---

## 8. Observability

| Requirement | Specification |
|---|---|
| Log retention (operational) | 90 days hot; 1 year warm; 7 years cold |
| Trace retention | 30 days |
| Metrics retention | 13 months (for year-on-year comparison) |
| Alert response SLA (P1) | Acknowledged within 5 minutes; resolved within 1 hour |
| Alert response SLA (P2) | Acknowledged within 30 minutes; resolved within 4 hours |
| Dashboard refresh rate | Real-time operational: 15s; business: 5 minutes |
| Agent session replay | Available within 60 seconds of session end |
| LLM evaluation results | Available within 5 minutes of session end (async) |

---

## 9. Cost Efficiency

| Requirement | Specification |
|---|---|
| Cost per resolved support case | < $0.10 (L4); < $0.05 (L7+) |
| LLM cost per session | < $0.05 (standard); < $0.20 (complex multi-agent) |
| Token budget per request | Hard cap enforced in LLM Gateway |
| Semantic cache hit rate | > 30% for common queries |
| Model tiering | Simple requests use Haiku; complex use Sonnet; critical use Opus |
| Monthly budget alerts | Alert at 80% of monthly budget; hard cap at 110% |
| Cost attribution | Per tenant, per agent, per model — daily granularity |

---

## 10. Usability & Developer Experience

| Requirement | Specification |
|---|---|
| New agent onboarding time | < 2 days from approved design to deployed to staging |
| Prompt deployment time | < 1 hour from merged to production (via GitOps) |
| API documentation | OpenAPI spec auto-generated and published |
| Local dev environment setup | < 30 minutes from clone to running locally |
| Agent debugging | Session replay available in developer portal |

---

## 11. NFR Acceptance Criteria Summary

| Category | Gate | Who Signs Off |
|---|---|---|
| Performance | Load tests pass at 2x expected peak | Platform Engineering |
| Availability | 99.9% in staging over 30-day soak | SRE |
| Security | Pentest clean; no critical/high findings | CISO |
| Compliance | All controls evidenced | Compliance Officer |
| DR | RTO/RPO targets met in DR drill | SRE + Business |
| Cost | Within 110% of modelled estimate | FinOps + CTO |
