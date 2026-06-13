# Performance Test Plan — AI Evolution & Maturity Platform

## 1. Overview

Performance testing validates that the AI platform meets latency, throughput, and resilience NFRs under realistic and peak load conditions. AI systems have unique performance characteristics — LLM latency variability, token budget impacts, and agent loop overhead — that require specialist test design.

---

## 2. Performance Test Objectives

| Objective | Success Criteria |
|---|---|
| Validate latency NFRs under normal load | P95 latency within NFR targets per phase |
| Validate throughput capacity | Platform handles peak load (2x expected) |
| Validate autoscaling | Agent pods scale out within 60 seconds under surge |
| Validate LLM provider fallback under load | Failover adds < 2s additional latency |
| Validate cost model | Token consumption matches estimate within 110% |
| Identify bottlenecks | No single component saturates before others at target load |

---

## 3. Load Profiles

### 3.1 Normal Load

Expected steady-state production traffic per phase:

| Phase | Sessions/Min | Concurrent Sessions | LLM Requests/Min |
|---|---|---|---|
| Phase 1 | 5 | 25 | 5 |
| Phase 2 | 10 | 50 | 15 |
| Phase 3 | 15 | 75 | 25 |
| Phase 4 | 20 | 100 | 40 |
| Phase 5 | 30 | 150 | 70 |
| Phase 6 | 50 | 250 | 120 |
| Phase 7 | 80 | 400 | 200 |
| Phase 8 | 120 | 600 | 300 |
| Phase 9 | 150 | 750 | 380 |

### 3.2 Peak Load (2x Normal)

All performance tests must pass at 2x normal load.

### 3.3 Spike Test (10x for 5 minutes)

Tests autoscaling and graceful degradation under sudden traffic burst.

### 3.4 Soak Test (24-hour sustained normal load)

Tests memory leaks, connection pool exhaustion, and gradual degradation.

---

## 4. Performance NFRs (from NFRS.md)

| Metric | Phase 1–3 | Phase 4–7 | Phase 8–10 |
|---|---|---|---|
| Chat response first token (P95) | < 800ms | < 600ms | < 500ms |
| Chat response complete (P95) | < 5s | < 4s | < 3s |
| RAG retrieval latency (P95) | < 500ms | < 300ms | < 200ms |
| Tool call latency (P95) | N/A | < 2s | < 1s |
| Agent task complete (P95) | N/A | < 30s | < 20s |
| Error rate at peak load | < 0.1% | < 0.1% | < 0.1% |
| Autoscale response time | < 120s | < 90s | < 60s |

---

## 5. Test Scenarios

### 5.1 Scenario 1: Standard Chat Load

```python
# locustfile.py
class ChatUser(HttpUser):
    wait_time = between(10, 30)  # realistic think time

    @task(5)
    def faq_query(self):
        self.client.post("/v1/agents/cs-agent/invoke", json={
            "input": random.choice(FAQ_QUERIES),
            "sessionId": str(uuid4()),
            "userId": f"perf-user-{random.randint(1, 1000)}"
        }, timeout=10)

    @task(2)
    def order_status(self):
        self.client.post("/v1/agents/cs-agent/invoke", json={
            "input": f"Where is my order ORD-{random.randint(10000, 99999)}?",
            "sessionId": str(uuid4()),
            "userId": f"perf-user-{random.randint(1, 1000)}"
        }, timeout=15)

    @task(1)
    def refund_request(self):
        self.client.post("/v1/agents/refund-agent/invoke", json={
            "input": f"I want to return order ORD-{random.randint(10000, 99999)}",
            "sessionId": str(uuid4()),
            "userId": f"perf-user-{random.randint(1, 1000)}"
        }, timeout=60)
```

### 5.2 Scenario 2: RAG-Heavy Load

Focuses on vector retrieval performance — 80% of requests trigger RAG.

### 5.3 Scenario 3: Multi-Agent Orchestration Load

Tests Supervisor Agent routing under concurrent load — all 5 agent types active.

### 5.4 Scenario 4: LLM Provider Failover Under Load

```
1. Run at 80% of peak load
2. At T+2min: inject failure on primary LLM provider (block endpoint)
3. Measure:
   - Time to failover (target: < 30s)
   - Latency increase during failover (target: < 2s)
   - Error rate during failover (target: < 1%)
4. At T+7min: restore primary provider
5. Measure: time to switch back (target: < 60s)
```

### 5.5 Scenario 5: Autoscaling Spike

```
1. Start at 10% of peak load
2. Ramp to 5x normal in 30 seconds (simulating viral event)
3. Measure:
   - Time for HPA to trigger (target: < 30s)
   - Time for new pods to be ready (target: < 90s)
   - Request error rate during scale-up (target: < 1%)
4. Hold at 5x for 5 minutes
5. Ramp down; measure scale-in behaviour
```

---

## 6. Performance Monitoring During Tests

Real-time metrics captured during all tests:

| Metric | Tool | Alert Threshold |
|---|---|---|
| Response time P50/P95/P99 | Grafana / k6 | P95 > NFR target → fail test |
| Error rate | Grafana / k6 | > 0.1% → fail test |
| LLM Gateway throughput | Prometheus | Saturation > 80% → investigate |
| Agent pod CPU | Kubernetes metrics | > 85% → verify HPA triggering |
| Agent pod memory | Kubernetes metrics | > 90% → memory leak risk |
| Kafka consumer lag | Prometheus | > 1000 msgs → investigate |
| Vector DB query latency | Pinecone metrics | > 300ms P95 → investigate |
| Redis hit rate | Redis metrics | < 70% → cache config issue |
| Token consumption rate | LLM Gateway metrics | > 110% of estimate → investigate |

---

## 7. Performance Test Environment

| Requirement | Specification |
|---|---|
| Environment | Dedicated performance environment (mirrors production sizing) |
| Data volume | 100K synthetic customers; 1M synthetic orders; 50K documents indexed |
| LLM provider | Production API (not mocked) — realistic latency essential |
| External APIs | Sandbox APIs with realistic latency simulation |
| Isolation | No shared environment; dedicated K8s cluster |
| Observability | Full OTel instrumentation (same as production) |

---

## 8. Acceptance Criteria Summary

| Test | Pass Criteria |
|---|---|
| Normal load | All NFR latency targets met; error rate < 0.1% |
| Peak load (2x) | All NFR latency targets met; error rate < 0.1% |
| Spike (10x, 5 min) | Error rate < 1% during scale-up; recovers within 3 min |
| Soak (24h) | No memory leaks; no latency degradation > 10% over time |
| Failover | < 2s latency increase; < 1% errors during failover |
| Autoscaling | New pods ready within 90s; no request loss during scale-out |
| Cost model | Token consumption within 110% of estimate |

**A performance test failure is a go-live blocker. No exceptions.**

---

## 9. Performance Test Schedule

| Phase | Performance Test Window | Scope |
|---|---|---|
| Phase 1 | Week 10 (2 weeks before go-live) | Chat + RAG load |
| Phase 2 | Week 22 | + RAG-heavy scenarios |
| Phase 3 | Week 34 | + Tool call load |
| Phase 4 | Week 46 | + Workflow load |
| Phase 5 | Week 60 | + Agent loop scenarios; autoscaling |
| Phase 6 | Week 76 | + Multi-agent orchestration |
| Phase 7+ | 3 weeks before each go-live | Full platform load |

**Regression performance test:** Run on every release candidate to catch regressions.
