# Integration Architecture — AI Evolution & Maturity Platform

## 1. Integration Principles

| Principle | Description |
|---|---|
| API-First | All integrations via versioned APIs; no direct database-to-database |
| Async by Default | Prefer event-driven integration; synchronous only for latency-sensitive flows |
| Contract-Driven | Schemas defined in Schema Registry; breaking changes require version bump |
| Idempotent | All message consumers handle duplicate delivery safely |
| Circuit Breaker | All outbound integrations wrapped with circuit breaker + retry |
| No Shared Secrets | Each integration has dedicated credentials; rotated independently |

---

## 2. Integration Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                    AI Platform Integration Hub                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       API Gateway                                │   │
│  │   Inbound: Auth · Rate limit · Transform · Route                │   │
│  │   Outbound: Circuit breaker · Retry · Timeout · Audit           │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
│  ┌───────────────────────────────▼──────────────────────────────────┐  │
│  │                     Event Bus (Kafka)                             │  │
│  │   Topics: ai.agent.* · business.order.* · business.customer.*    │  │
│  │           ai.tool.* · platform.audit.* · integration.events.*    │  │
│  └───────────────────────────────┬───────────────────────────────── ┘  │
│                                  │                                       │
│       ┌──────────────────────────┼──────────────────────┐               │
│       ▼                          ▼                        ▼               │
│  ┌──────────┐             ┌──────────┐             ┌──────────┐         │
│  │  CRM     │             │  ERP     │             │ Payment  │         │
│  │ Adapter  │             │ Adapter  │             │ Adapter  │         │
│  └──────────┘             └──────────┘             └──────────┘         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. System Integrations

### 3.1 CRM Integration (Salesforce)

**Purpose:** Customer profile, case management, interaction history

**Pattern:** Bidirectional sync + real-time event streaming

```
Direction: Inbound (AI reads)
  Endpoint: GET /services/data/v59.0/sobjects/Contact/{id}
  Trigger: Agent needs customer context
  Auth: OAuth 2.0 client credentials
  Latency SLA: < 500ms

Direction: Outbound (AI writes)
  Endpoint: POST /services/data/v59.0/sobjects/Case
  Trigger: Agent creates/updates support case
  Auth: OAuth 2.0 client credentials
  Idempotency: External_Case_ID__c field (agent session ID)

Event Streaming (Salesforce → Kafka):
  Topic: business.customer.updated
  Topic: business.case.status_changed
  Protocol: Salesforce Platform Events → Kafka Connect
```

**MCP Tool Mapping:**

| Tool | Salesforce API | Method |
|---|---|---|
| `get_customer_profile` | `/sobjects/Contact/{id}` | GET |
| `get_case_history` | `/sobjects/Case?filter=ContactId={id}` | GET |
| `create_case` | `/sobjects/Case` | POST |
| `update_case` | `/sobjects/Case/{id}` | PATCH |

---

### 3.2 ERP Integration (SAP)

**Purpose:** Order management, inventory, finance

**Pattern:** Synchronous REST for reads; async for writes

```
Direction: Inbound (AI reads)
  Endpoint: GET /sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('{orderId}')
  Trigger: Agent needs order details
  Auth: Basic auth (service account) over TLS
  Latency SLA: < 1s

Direction: Outbound (AI writes)
  Endpoint: POST /sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder
  Trigger: Agent creates/modifies order
  Pattern: Request → Kafka queue → SAP adapter → SAP API
  Idempotency: External reference number in request header
```

**MCP Tool Mapping:**

| Tool | SAP API | Method |
|---|---|---|
| `get_order_status` | `A_SalesOrder('{id}')` | GET |
| `get_order_items` | `A_SalesOrderItem?filter=SalesOrder eq '{id}'` | GET |
| `cancel_order` | `A_SalesOrder('{id}')` | PATCH (status=CANCELLED) |
| `get_inventory` | `A_ProductPlant('{sku}', '{plant}')` | GET |

---

### 3.3 Payment Gateway Integration

**Purpose:** Refund processing, payment status

**Pattern:** Synchronous with async confirmation webhook

```
Refund Flow:
  1. Agent calls tool: process_refund(order_id, amount)
  2. Tool Router validates: human approval if amount > $500
  3. API Adapter sends: POST /v1/refunds (Stripe / Adyen)
  4. Response: refund_id, status=pending
  5. Webhook received: POST /webhooks/payment/refund-confirmed
  6. Event published: business.payment.refund_completed
  7. Agent notified via event (if still active) or stored for retrieval

Security:
  - HMAC signature verification on all webhooks
  - IP allowlist for webhook source IPs
  - Idempotency key: order_id + timestamp (24h dedup window)
```

**MCP Tool Mapping:**

| Tool | Payment API | Notes |
|---|---|---|
| `get_payment_status` | `GET /v1/payment_intents/{id}` | |
| `process_refund` | `POST /v1/refunds` | Requires human approval > $500 |
| `get_refund_status` | `GET /v1/refunds/{id}` | |

---

### 3.4 Identity Provider Integration (Azure AD / Okta)

**Purpose:** Authentication, authorisation, user profile

**Pattern:** OIDC for human auth; JWT validation for API auth

```
Human Authentication Flow:
  Browser → API Gateway → OIDC redirect → Azure AD
  → Auth code → API Gateway → Token exchange
  → JWT (claims: user_id, tenant_id, roles, email)
  → Stored in session; passed as Bearer token

Agent Authentication:
  Agent start → Vault → Agent JWT (signed, scoped, 15min TTL)
  → API Gateway validates JWT signature + claims
  → Forwarded as X-Agent-Identity header to services

Token Validation:
  All services validate JWT locally using JWKS endpoint
  JWKS cached with 1-hour TTL
  Clock skew tolerance: 30 seconds
```

---

### 3.5 Logistics / Shipping Integration

**Purpose:** Shipment tracking, delivery status

**Pattern:** Synchronous polling (no push available on all carriers)

```
Carrier APIs:
  FedEx: GET /track/v1/trackingnumbers/{trackingNumber}
  UPS: GET /api/track/v1/details/{inquiryNumber}
  DHL: GET /tracking/v2/shipments?trackingNumber={n}

Abstraction Layer:
  Unified ShipmentStatus schema normalised from carrier responses
  Carrier selection based on shipment metadata
  Cache TTL: 5 minutes (tracking data changes infrequently)
  Circuit breaker: open after 5 failures; retry after 60s

MCP Tool:
  track_shipment(tracking_number, carrier?) → ShipmentStatus
```

---

### 3.6 LLM Provider Integration

**Pattern:** Abstracted through LLM Gateway

```
Providers:
  Anthropic (Claude)   → claude-sonnet-4-6, claude-haiku-4-5
  OpenAI               → gpt-4o, gpt-4o-mini (fallback)
  AWS Bedrock          → claude-sonnet via Bedrock (regional)
  Azure OpenAI         → gpt-4o (enterprise data boundary option)

Routing Logic (LLM Gateway):
  1. Check model preference in request
  2. Check provider health (cached 30s)
  3. Route to primary → on 429/503 → route to fallback
  4. Apply token budget cap
  5. Log request + response (tokens, latency, cost)

Rate Limit Handling:
  Exponential backoff: 1s, 2s, 4s (max 3 retries)
  Parallel provider switch if primary rate-limited > 10s
```

---

## 4. Event Schema Catalogue (Avro)

### 4.1 Agent Action Event

```json
{
  "type": "record",
  "name": "AgentActionEvent",
  "namespace": "ai.agent",
  "fields": [
    {"name": "traceId", "type": "string"},
    {"name": "agentId", "type": "string"},
    {"name": "tenantId", "type": "string"},
    {"name": "sessionId", "type": "string"},
    {"name": "action", "type": "string"},
    {"name": "tool", "type": ["null", "string"]},
    {"name": "input", "type": {"type": "map", "values": "string"}},
    {"name": "outcome", "type": {"type": "enum", "symbols": ["SUCCESS", "FAILURE", "ESCALATED"]}},
    {"name": "latencyMs", "type": "long"},
    {"name": "timestamp", "type": "long", "logicalType": "timestamp-millis"}
  ]
}
```

### 4.2 Business Order Event

```json
{
  "type": "record",
  "name": "OrderStatusChangedEvent",
  "namespace": "business.order",
  "fields": [
    {"name": "orderId", "type": "string"},
    {"name": "customerId", "type": "string"},
    {"name": "previousStatus", "type": "string"},
    {"name": "newStatus", "type": "string"},
    {"name": "changedBy", "type": "string"},
    {"name": "reason", "type": ["null", "string"]},
    {"name": "timestamp", "type": "long", "logicalType": "timestamp-millis"}
  ]
}
```

---

## 5. Error Handling & Resilience

| Pattern | Implementation | When Used |
|---|---|---|
| Retry with backoff | 3 retries: 1s, 2s, 4s | Transient errors (429, 503, timeout) |
| Circuit Breaker | Open after 5 failures in 60s; half-open after 60s | All external integrations |
| Dead Letter Queue | Failed Kafka messages → DLQ topic | Event processing failures |
| Compensating Transaction | Publish reversal event on partial saga failure | Multi-step business flows |
| Idempotency Keys | UUID per logical operation; 24h dedup window | All write operations |
| Timeout | Per integration (see SLAs above); never unbounded | All outbound calls |

---

## 6. Integration Monitoring

| Metric | Alert Threshold |
|---|---|
| Integration error rate | > 1% over 5 minutes |
| Integration latency P95 | > 2× SLA target |
| Circuit breaker open | Any circuit breaker open > 60s |
| DLQ depth | > 100 messages |
| Kafka consumer lag | > 10,000 messages per topic |
| Webhook delivery failure | > 5 consecutive failures |
