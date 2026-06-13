# API Specifications — AI Evolution & Maturity Platform

## 1. Overview

All platform capabilities are exposed as versioned REST APIs. This document defines the canonical API contracts. OpenAPI 3.1 YAML specs are auto-generated from code and published to the developer portal.

**Base URL:** `https://api.ai-platform.example.com`
**Auth:** Bearer JWT (OAuth 2.0 / OIDC) | Header: `Authorization: Bearer <token>`
**Tenant:** `X-Tenant-Id: <tenantId>` (required on all requests)
**Tracing:** `X-Trace-Id: <uuid>` (optional; generated if absent)

---

## 2. Agent API

### 2.1 Invoke Agent

```
POST /v1/agents/{agentId}/invoke
```

**Request:**
```json
{
  "input": "Cancel my order ORD-12345 and process a refund",
  "sessionId": "sess_abc123",
  "userId": "usr_xyz789",
  "context": {
    "channel": "chat",
    "locale": "en-US",
    "customFields": {}
  },
  "options": {
    "stream": false,
    "maxTokens": 2000,
    "humanApprovalWebhook": "https://app.example.com/webhooks/approval"
  }
}
```

**Response 200:**
```json
{
  "output": "I've successfully cancelled order ORD-12345 and initiated a refund of $49.99...",
  "sessionId": "sess_abc123",
  "traceId": "trace_4bf92f35",
  "agentId": "cs-agent",
  "agentVersion": "1.1.0",
  "toolsUsed": ["get_order", "cancel_order", "process_refund"],
  "metadata": {
    "tokensUsed": 1240,
    "latencyMs": 2800,
    "iterations": 3,
    "model": "claude-sonnet-4-6",
    "ragChunksUsed": 2
  }
}
```

**Response 202 (Human Approval Required):**
```json
{
  "status": "pending_approval",
  "approvalId": "appr_789xyz",
  "traceId": "trace_4bf92f35",
  "pendingAction": {
    "tool": "process_refund",
    "input": {"orderId": "ORD-12345", "amount": 49.99},
    "reason": "Amount exceeds $500 auto-approval threshold"
  },
  "expiresAt": "2026-06-12T11:30:00Z"
}
```

**Response 400:**
```json
{
  "error": "INVALID_INPUT",
  "message": "sessionId is required",
  "traceId": "trace_4bf92f35"
}
```

**Response 429:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Retry after 60 seconds.",
  "retryAfter": 60,
  "traceId": "trace_4bf92f35"
}
```

---

### 2.2 Stream Agent Response

```
POST /v1/agents/{agentId}/invoke/stream
Content-Type: application/json
Accept: text/event-stream
```

**SSE Events:**
```
event: thought
data: {"iteration": 1, "thought": "Customer wants order cancelled. Let me check eligibility."}

event: tool_call
data: {"tool": "get_order", "input": {"order_id": "ORD-12345"}}

event: tool_result
data: {"tool": "get_order", "result": {"status": "processing", "cancellable": true}}

event: token
data: {"token": "I've"}

event: token
data: {"token": " successfully"}

event: done
data: {"traceId": "trace_4bf92f35", "tokensUsed": 1240, "latencyMs": 2800}
```

---

### 2.3 Get Session History

```
GET /v1/sessions/{sessionId}/messages
```

**Response 200:**
```json
{
  "sessionId": "sess_abc123",
  "agentId": "cs-agent",
  "status": "resolved",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Cancel my order ORD-12345",
      "timestamp": "2026-06-12T10:23:40Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "I've successfully cancelled your order...",
      "timestamp": "2026-06-12T10:23:43Z",
      "metadata": {"tokensUsed": 1240, "toolsUsed": ["cancel_order"]}
    }
  ],
  "createdAt": "2026-06-12T10:23:40Z",
  "resolvedAt": "2026-06-12T10:23:43Z"
}
```

---

## 3. RAG API

### 3.1 Query Knowledge Base

```
POST /v1/rag/query
```

**Request:**
```json
{
  "query": "What is the return policy for electronics?",
  "namespace": "policy",
  "topK": 3,
  "filters": {
    "document_type": "policy",
    "last_updated_after": "2025-01-01"
  }
}
```

**Response 200:**
```json
{
  "answer": "Electronics can be returned within 30 days of purchase...",
  "sources": [
    {
      "documentId": "DOC-POLICY-001",
      "documentTitle": "Returns & Refunds Policy",
      "chunk": "Electronics may be returned within 30 days...",
      "score": 0.92,
      "url": "https://kb.example.com/policy/returns"
    }
  ],
  "traceId": "trace_abc123",
  "retrievalLatencyMs": 142,
  "generationLatencyMs": 843
}
```

### 3.2 Ingest Document

```
POST /v1/rag/documents
Content-Type: multipart/form-data
```

**Request fields:**
- `file`: Document file (PDF, DOCX, HTML, TXT, MD)
- `namespace`: Target namespace (e.g., `policy`, `product`)
- `metadata`: JSON metadata object

**Response 202:**
```json
{
  "ingestionId": "ing_xyz789",
  "status": "processing",
  "estimatedCompletionSeconds": 30,
  "documentId": "DOC-2026-06-12-001"
}
```

---

## 4. Workflow API

### 4.1 Trigger Workflow

```
POST /v1/workflows/{workflowId}/trigger
```

**Request:**
```json
{
  "input": {
    "orderId": "ORD-12345",
    "customerId": "CUST-789",
    "reason": "defective_product"
  },
  "callbackUrl": "https://app.example.com/webhooks/workflow",
  "priority": "normal"
}
```

**Response 202:**
```json
{
  "executionId": "wf-exec-abc123",
  "workflowId": "refund-workflow",
  "status": "running",
  "startedAt": "2026-06-12T10:23:40Z",
  "estimatedCompletionSeconds": 45
}
```

### 4.2 Get Workflow Status

```
GET /v1/workflows/executions/{executionId}
```

**Response 200:**
```json
{
  "executionId": "wf-exec-abc123",
  "workflowId": "refund-workflow",
  "status": "completed",
  "steps": [
    {"name": "validate_order", "status": "completed", "latencyMs": 342},
    {"name": "check_eligibility", "status": "completed", "latencyMs": 281},
    {"name": "process_refund", "status": "completed", "latencyMs": 1204},
    {"name": "send_confirmation", "status": "completed", "latencyMs": 156}
  ],
  "output": {"refundId": "REF-78901", "amount": 49.99},
  "startedAt": "2026-06-12T10:23:40Z",
  "completedAt": "2026-06-12T10:23:42Z"
}
```

---

## 5. Memory API

### 5.1 Write Memory

```
POST /v1/memory/{namespace}/write
```

**Request:**
```json
{
  "key": "user_preference_contact",
  "value": "Prefers email over phone",
  "entityId": "usr_xyz789",
  "ttlSeconds": 2592000
}
```

### 5.2 Read Memory

```
GET /v1/memory/{namespace}/search?query=contact+preference&entityId=usr_xyz789&topK=3
```

**Response 200:**
```json
{
  "results": [
    {
      "key": "user_preference_contact",
      "value": "Prefers email over phone",
      "score": 0.94,
      "createdAt": "2026-06-01T09:00:00Z"
    }
  ]
}
```

---

## 6. Admin API

### 6.1 List Agents

```
GET /v1/admin/agents
```

**Response 200:**
```json
{
  "agents": [
    {
      "id": "cs-agent",
      "name": "Customer Service Agent",
      "version": "1.1.0",
      "status": "active",
      "model": "claude-sonnet-4-6",
      "tools": ["get_order", "get_customer", "create_ticket"],
      "stats": {
        "tasksToday": 4821,
        "successRate": 0.94,
        "avgLatencyMs": 2800
      }
    }
  ]
}
```

### 6.2 Health Check

```
GET /v1/health
```

**Response 200:**
```json
{
  "status": "healthy",
  "version": "2.3.1",
  "components": {
    "llmGateway": "healthy",
    "ragPipeline": "healthy",
    "agentRuntime": "healthy",
    "vectorDb": "healthy",
    "redis": "healthy",
    "kafka": "healthy"
  },
  "activeProviders": ["anthropic", "openai"],
  "timestamp": "2026-06-12T10:23:40Z"
}
```

---

## 7. Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `INVALID_INPUT` | 400 | Request body validation failed |
| `AGENT_NOT_FOUND` | 404 | Agent ID does not exist |
| `SESSION_NOT_FOUND` | 404 | Session ID not found |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT but insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests; back off |
| `BUDGET_EXCEEDED` | 429 | Token budget exhausted for this tenant/session |
| `AGENT_TIMEOUT` | 504 | Agent did not complete within timeout |
| `LLM_UNAVAILABLE` | 503 | All LLM providers unavailable |
| `TOOL_EXECUTION_FAILED` | 500 | Tool call returned an error |
| `HUMAN_APPROVAL_REQUIRED` | 202 | Action pending human approval |

---

## 8. Rate Limits

| Tier | Requests/min | Concurrent Sessions | Token Budget/day |
|---|---|---|---|
| Standard | 60 | 10 | 1M tokens |
| Professional | 300 | 50 | 5M tokens |
| Enterprise | 1,000 | 200 | 20M tokens |
| Internal | Unlimited | Unlimited | Monitored |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1749726300
```
