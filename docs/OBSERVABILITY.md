# Observability Architecture — AI Evolution & Maturity Platform

## 1. Overview

AI systems require observability far beyond traditional application monitoring. In addition to the standard three pillars (logs, metrics, traces), an AI platform needs **AgentOps** — the ability to observe, evaluate, and improve AI-specific behaviour: reasoning quality, tool usage patterns, memory effectiveness, and cost efficiency.

---

## 2. Observability Pillars

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI Observability Platform                      │
│                                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │    Logs    │  │  Metrics   │  │   Traces   │  │ AgentOps   │ │
│  │            │  │            │  │            │  │            │ │
│  │ Structured │  │ Prometheus │  │ OpenTel.   │  │ LLM Evals  │ │
│  │ JSON logs  │  │ + Grafana  │  │ Jaeger /   │  │ Langfuse / │ │
│  │ (ELK/OTEL) │  │            │  │ Tempo      │  │ Arize      │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Unified Observability Store                      │ │
│  │         (OpenTelemetry Collector → Backend)                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Structured Logging

### 3.1 Log Schema

All services emit structured JSON logs via OpenTelemetry. Every log entry carries the full correlation context.

```json
{
  "timestamp": "2026-06-12T10:23:45.123Z",
  "level": "INFO",
  "service": "cs-agent",
  "version": "1.1.0",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "tenantId": "acme-corp",
  "sessionId": "sess_abc123",
  "userId": "usr_xyz789",
  "agentId": "cs-agent-v2",
  "event": "tool_call_executed",
  "tool": "get_order_status",
  "input": {"order_id": "ORD-12345"},
  "output_summary": "Order status: shipped",
  "latency_ms": 342,
  "success": true
}
```

### 3.2 Log Taxonomy

| Log Event | Level | Description |
|---|---|---|
| `llm_request` | INFO | Every LLM call with model, tokens, latency |
| `llm_response` | INFO | Response with content summary (no PII) |
| `tool_call_started` | INFO | Tool invocation initiated |
| `tool_call_executed` | INFO | Tool result received |
| `tool_call_failed` | ERROR | Tool execution error with details |
| `agent_iteration` | DEBUG | Each think-act-observe cycle |
| `agent_escalated` | WARN | Agent escalated to human |
| `agent_completed` | INFO | Agent task finished |
| `memory_write` | DEBUG | Memory store operation |
| `prompt_injection_detected` | WARN | Security event — attempted injection |
| `pii_detected` | WARN | PII found in input (masked before LLM) |
| `budget_exceeded` | ERROR | Token or cost budget hit |

---

## 4. Metrics

### 4.1 LLM Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `llm_request_total` | Counter | model, agent, tenant | Total LLM API calls |
| `llm_request_latency_ms` | Histogram | model, agent | End-to-end LLM latency |
| `llm_tokens_total` | Counter | model, agent, type (input/output) | Token consumption |
| `llm_cost_usd_total` | Counter | model, agent, tenant | Estimated cost |
| `llm_error_total` | Counter | model, error_type | LLM errors by type |
| `llm_fallback_total` | Counter | from_model, to_model | Provider fallback events |
| `llm_cache_hit_total` | Counter | agent | Semantic cache hits |

### 4.2 Agent Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `agent_task_total` | Counter | agent, outcome | Tasks by outcome (success/fail/escalate) |
| `agent_task_duration_ms` | Histogram | agent | End-to-end task duration |
| `agent_iterations_total` | Histogram | agent | Iterations per task |
| `agent_tool_calls_total` | Counter | agent, tool | Tool invocations by agent |
| `agent_memory_ops_total` | Counter | agent, op (read/write) | Memory operations |
| `agent_queue_depth` | Gauge | agent | Pending tasks in queue |
| `agent_active_sessions` | Gauge | agent | Concurrent active sessions |

### 4.3 RAG Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `rag_query_total` | Counter | namespace | Total RAG queries |
| `rag_retrieval_latency_ms` | Histogram | namespace | Vector search latency |
| `rag_chunks_retrieved` | Histogram | namespace | Chunks returned per query |
| `rag_rerank_score` | Histogram | namespace | Reranker confidence scores |
| `rag_empty_result_total` | Counter | namespace | Queries with no results |

### 4.4 Business Metrics

| Metric | Type | Description |
|---|---|---|
| `support_ticket_resolved_total` | Counter | Tickets resolved by AI (no escalation) |
| `support_escalation_total` | Counter | Cases escalated to human |
| `support_resolution_time_ms` | Histogram | Time from request to resolution |
| `refund_processed_total` | Counter | Refunds processed by agent |
| `csat_score` | Gauge | Customer satisfaction score (from feedback) |
| `ai_containment_rate` | Gauge | % of cases handled end-to-end by AI |

---

## 5. Distributed Tracing

### 5.1 Trace Architecture

Every user request generates a root trace span that propagates through all services:

```
User Request (traceId: abc123)
│
├── API Gateway span (5ms)
│
├── Agent Supervisor span (12ms)
│   └── Intent classification LLM call (8ms)
│
├── CS Agent span (2800ms)
│   ├── Memory read span (3ms)
│   ├── LLM think span (450ms)
│   ├── Tool: get_order_status span (342ms)
│   ├── LLM think span (380ms)
│   ├── Tool: process_refund span (1200ms)
│   ├── LLM think span (290ms)
│   └── Memory write span (4ms)
│
└── Response sent (total: 2850ms)
```

### 5.2 Span Attributes (AI-Specific)

```python
span.set_attribute("llm.model", "claude-sonnet-4-6")
span.set_attribute("llm.input_tokens", 1240)
span.set_attribute("llm.output_tokens", 387)
span.set_attribute("llm.cost_usd", 0.0042)
span.set_attribute("agent.id", "cs-agent-v2")
span.set_attribute("agent.iteration", 3)
span.set_attribute("tool.name", "process_refund")
span.set_attribute("tool.success", True)
span.set_attribute("rag.chunks_retrieved", 3)
span.set_attribute("rag.top_score", 0.87)
```

---

## 6. AgentOps — AI-Specific Observability

### 6.1 LLM Evaluation Pipeline

Continuous, automated evaluation of LLM outputs against quality criteria:

```
Agent Response
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│              Evaluation Pipeline (async)                 │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Faithfulness│  │  Relevancy   │  │  Tone &      │  │
│  │  Evaluator   │  │  Evaluator   │  │  Safety      │  │
│  │  (LLM-as-   │  │  (LLM-as-   │  │  Evaluator   │  │
│  │   judge)     │  │   judge)     │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  Tool Usage  │  │  Cost        │                     │
│  │  Evaluator   │  │  Efficiency  │                     │
│  │  (rule-based)│  │  Evaluator   │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
      │
      ▼
Scores stored in Langfuse / Arize → Dashboard + Alerts
```

### 6.2 Evaluation Dimensions

| Dimension | Method | Target Score |
|---|---|---|
| Faithfulness | LLM judge vs source documents | > 0.85 |
| Answer Relevancy | Semantic similarity to intent | > 0.80 |
| Completeness | All required actions taken | 100% |
| Tone & Empathy | LLM judge on conversation quality | > 0.75 |
| Tool Efficiency | Tools called / minimum tools needed | < 1.5x |
| Safety | No harmful/policy-violating content | 100% |
| Hallucination Rate | Claims not grounded in context | < 2% |

### 6.3 Session Replay

Every agent session can be fully replayed for debugging:

```
Session Replay Record:
  sessionId: sess_abc123
  timeline:
    t=0ms:    User input received
    t=12ms:   Intent classified: refund_request
    t=14ms:   Memory loaded (2 past interactions)
    t=466ms:  LLM thought: "Need order details first"
    t=808ms:  Tool called: get_order_status(ORD-12345)
    t=1150ms: Tool result: order_status=delivered, eligible=true
    t=1532ms: LLM thought: "Eligible. Process refund."
    t=2732ms: Tool called: process_refund(ORD-12345, amount=49.99)
    t=2800ms: Refund confirmed: REF-78901
    t=3100ms: Response sent to user
    t=3104ms: Memory updated
  evaluation:
    faithfulness: 0.92
    relevancy: 0.88
    tool_efficiency: 1.0
    cost_usd: 0.0051
```

---

## 7. Dashboards

### 7.1 Executive Dashboard

| Panel | Metric | Target |
|---|---|---|
| AI Containment Rate | % cases resolved by AI | > 80% |
| Customer Satisfaction | CSAT from post-interaction survey | > 4.2/5 |
| Average Resolution Time | Time from request to close | < 3 min |
| Cost per Resolution | LLM + infra cost per resolved case | < $0.05 |
| Escalation Rate | % handed to human | < 20% |

### 7.2 Operations Dashboard

- Agent error rate by agent type (last 24h)
- LLM latency P50/P95/P99 by model
- Token consumption by tenant (daily budget vs actual)
- Tool call success/failure rates
- RAG retrieval quality scores over time
- Active agent sessions (real-time)

### 7.3 AI Quality Dashboard

- Evaluation scores per agent (rolling 7-day average)
- Prompt regression pass/fail trend (per CI run)
- Hallucination rate trend
- Safety violation incidents
- Memory utilisation by namespace

---

## 8. Alerting

| Alert | Condition | Severity | Action |
|---|---|---|---|
| High error rate | Agent failure > 5% (5min window) | P1 | Page on-call |
| LLM provider down | Gateway fallback triggered > 10x/min | P1 | Page on-call |
| Budget overrun | Token spend > 120% of daily budget | P2 | Alert team |
| Low faithfulness | Eval score < 0.70 (rolling hour) | P2 | Alert AI team |
| Injection detected | Any prompt injection event | P2 | Alert security |
| High escalation | Escalation rate > 40% (1h window) | P3 | Alert ops |
| Memory quota | Namespace at 80% capacity | P3 | Alert platform |

---

## 9. Observability by Maturity Level

| Level | Key Observability Addition |
|---|---|
| L1–2 | LLM request/response logging + basic latency metrics |
| L3 | RAG retrieval quality metrics + chunk relevance scoring |
| L4 | Tool call audit logging + tool success rate dashboards |
| L5 | Workflow step tracing + state transition visibility |
| L6 | Full agent session replay + iteration-level tracing |
| L7 | Cross-agent trace correlation + supervisor routing metrics |
| L8 | Business process SLA monitoring + end-to-end flow dashboards |
| L9 | AI workforce KPI dashboards + SLA breach alerting |
| L10 | Autonomous decision audit trail + self-optimisation visibility |
