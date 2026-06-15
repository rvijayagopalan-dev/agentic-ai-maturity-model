# Low-Level Design — AI Evolution & Maturity Platform

## 1. Component Specifications

### 1.1 LLM Gateway

**Responsibility:** Abstract all LLM provider calls behind a single, consistent interface.

```mermaid
flowchart TD
  RP["Request Parser"] --> RT["Router<br/>(model select)"] --> RF["Retry &amp; Fallback Engine"] --> AL["Audit Logger"]
  RF --> AN["Anthropic Adapter"]
  RF --> OAI["OpenAI Adapter"]
  RF --> BR["Bedrock Adapter"]
```

**API Contract:**

```typescript
interface LLMRequest {
  model?: string;            // defaults to configured primary model
  messages: Message[];
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  budgetTokens?: number;     // hard cap on total tokens
  tenantId: string;
  traceId: string;
}

interface LLMResponse {
  content: string | ContentBlock[];
  model: string;             // actual model used (may differ due to fallback)
  usage: TokenUsage;
  toolCalls?: ToolCall[];
  traceId: string;
}
```

**Routing Logic:**

```
1. Parse request model preference
2. Check model availability (health check cache, 30s TTL)
3. If primary unavailable → route to fallback chain
4. Apply token budget check
5. Forward to provider adapter
6. On 429/503 → exponential backoff + retry (max 3)
7. Log request/response to audit store
8. Return normalised response
```

---

### 1.2 RAG Pipeline

**Ingestion Flow:**

```mermaid
flowchart LR
  Src["Source Documents"]
  Load["Document Loader<br/>PDF / HTML / Confluence"]
  Chunk["Chunker<br/>semantic / recursive"]
  Embed["Embedding Service<br/>(batch)"]
  VS["Vector Store + Metadata<br/>namespace · doc_id · ts"]
  Src --> Load --> Chunk --> Embed --> VS
```

**Query Flow:**

```mermaid
flowchart TD
  Q["User Query"]
  RW["Query Rewriter<br/>HyDE / multi-query expansion"]
  EM["Embedding Service"]
  VS["Vector Search<br/>top-K=10 · threshold 0.75"]
  RR["Reranker<br/>cross-encoder · top-K=3"]
  CA["Context Assembly<br/>with source citations"]
  PC["LLM Prompt Construction"]
  GR["Grounded Response"]
  Q --> RW --> EM --> VS --> RR --> CA --> PC --> GR
```

**Chunking Strategy:**

| Document Type | Strategy | Chunk Size | Overlap |
|---|---|---|---|
| Policy docs | Semantic (sentence boundary) | 512 tokens | 50 tokens |
| FAQs | Fixed paragraph | 256 tokens | 0 |
| Product manuals | Hierarchical (section → subsection) | 1024 tokens | 100 tokens |
| Emails | Full document | N/A | N/A |

---

### 1.3 Agent Runtime

**Agent Loop:**

```mermaid
flowchart TD
  Recv["Receive Task"]
  Mem{"Check Memory"}
  Load["Load Context from Memory"]
  Think["Think / Plan<br/>(LLM Reasoning)"]
  Select["Select Tool / Action"]
  Exec["Execute Tool<br/>(with timeout)"]
  Obs["Observe Result"]
  Done{"Task Done?"}
  Finish["Write Memory<br/>Emit Event<br/>Return Result"]
  Recv --> Mem
  Mem -->|No| Load --> Think
  Mem -->|Yes| Think
  Think --> Select --> Exec
  Exec -->|Error| Think
  Exec --> Obs --> Done
  Done -->|No| Think
  Done -->|Yes| Finish
```

**Agent Data Model:**

```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  tools: string[];           // tool IDs from Function Registry
  memoryConfig: {
    shortTermTTL: number;    // seconds
    longTermEnabled: boolean;
    namespace: string;
  };
  escalationPolicy: {
    confidenceThreshold: number;
    maxIterations: number;
    humanApprovalRequired: boolean;
  };
  metadata: {
    version: string;
    tenantId: string;
    domain: string;
  };
}
```

---

### 1.4 Supervisor Agent (Multi-Agent Routing)

**Routing Decision Flow:**

```mermaid
flowchart TD
  Req["Incoming Request"]
  IC["Intent Classifier<br/>(LLM-based, few-shot)"]
  RT{"Routing Table"}
  Sel["Agent Selected<br/>→ Invoke via gRPC / Event Bus"]
  Await["Await Response<br/>(timeout + fallback)"]
  Agg["Aggregate / Compose Reply"]
  Req --> IC --> RT
  RT -->|refund.*| Sel
  RT -->|shipping.*| Sel
  RT -->|fraud.*| Sel
  RT -->|knowledge.*| Sel
  RT -->|escalation.*| Human["Human Queue"]
  RT -->|* default| Sel
  Sel --> Await --> Agg
```

---

### 1.5 Memory Architecture

```mermaid
flowchart TD
  subgraph MS["Memory System"]
    ST["<b>Short-Term Memory</b> (Redis / In-proc)<br/>Key: session_id · TTL: 30 mins<br/>Conversation history · Scratch pad · Tool-call history"]
    LT["<b>Long-Term Memory</b> (Vector Store)<br/>Namespace: user_id<br/>Entity · Preference · Episodic · Semantic memory"]
  end
  OPS["<b>Memory Operations</b><br/>write(key, value, namespace, ttl?)<br/>read(key, namespace) → value<br/>search(query, namespace, topK) → chunks[]<br/>forget(key, namespace)"]
  OPS --> ST
  OPS --> LT
```

---

### 1.6 Tool / Function Registry

**Tool Definition Schema (MCP-compatible):**

```json
{
  "name": "get_order_status",
  "description": "Retrieve the current status of a customer order by order ID",
  "inputSchema": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "The unique order identifier"
      }
    },
    "required": ["order_id"]
  },
  "metadata": {
    "domain": "order_management",
    "requiresAuth": true,
    "humanApproval": false,
    "timeout_ms": 5000,
    "rateLimit": "100/min"
  }
}
```

**Tool Execution Pipeline:**

```mermaid
flowchart TD
  TC["LLM Tool Call (JSON)"]
  SV["Schema Validator<br/>(validate input vs schema)"]
  AC["Auth Check<br/>(agent authorised for tool?)"]
  HA["Human Approval?<br/>(metadata + confidence)"]
  RL["Rate Limit Check"]
  EX["Execute via Adapter<br/>→ REST / gRPC / DB query"]
  EV["Emit Tool Event<br/>(audit + observability)"]
  Ret["Return Result to Agent"]
  TC --> SV --> AC --> HA --> RL --> EX --> EV --> Ret
```

---

## 2. Data Models

### 2.1 Conversation

```typescript
interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  sessionId: string;
  channel: 'chat' | 'email' | 'voice' | 'api';
  messages: ConversationMessage[];
  agentId: string;
  workflowId?: string;
  status: 'active' | 'resolved' | 'escalated' | 'abandoned';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  timestamp: Date;
  traceId: string;
}
```

### 2.2 Agent Execution Trace

```typescript
interface AgentTrace {
  traceId: string;
  agentId: string;
  conversationId: string;
  iterations: AgentIteration[];
  totalTokens: number;
  totalLatencyMs: number;
  outcome: 'success' | 'failure' | 'escalated' | 'timeout';
  cost: number;
}

interface AgentIteration {
  iterationNumber: number;
  thought: string;
  action: string;
  observation: string;
  toolsCalled: ToolCall[];
  tokensUsed: number;
  latencyMs: number;
}
```

---

## 3. API Specifications

### 3.1 Agent Invocation API

```
POST /v1/agents/{agentId}/invoke
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
X-Trace-Id: <traceId>

{
  "input": "Cancel my order ORD-12345 and process a refund",
  "sessionId": "sess_abc123",
  "userId": "usr_xyz789",
  "context": {
    "channel": "chat",
    "locale": "en-US"
  }
}

Response 200:
{
  "output": "I've cancelled order ORD-12345...",
  "traceId": "trace_...",
  "agentId": "cs-agent-v2",
  "toolsUsed": ["get_order", "cancel_order", "process_refund"],
  "tokensUsed": 1240,
  "latencyMs": 2800
}
```

### 3.2 Workflow Trigger API

```
POST /v1/workflows/{workflowId}/trigger
{
  "input": { "orderId": "ORD-12345", "reason": "defective" },
  "callbackUrl": "https://app.example.com/webhooks/workflow"
}

Response 202:
{
  "executionId": "wf-exec-...",
  "status": "running",
  "estimatedDurationSeconds": 45
}
```

---

## 4. Sequence Diagrams

### 4.1 RAG Query (Level 3)

```mermaid
sequenceDiagram
  participant U as User
  participant GW as API GW
  participant RAG as RAG Svc
  participant VDB as Vector DB
  participant LLM as LLM GW
  U->>GW: Query
  GW->>RAG: Query
  RAG->>VDB: Embed Query
  VDB-->>RAG: Vectors
  RAG->>VDB: Search
  VDB-->>RAG: Top-K Chunks
  RAG->>LLM: Rerank
  LLM-->>RAG: Ranked Chunks
  RAG->>LLM: Build Prompt + Generate
  LLM-->>RAG: Response
  RAG-->>GW: Response
  GW-->>U: Response
```

### 4.2 Multi-Agent Execution (Level 7)

```mermaid
sequenceDiagram
  participant U as User
  participant S as Supervisor
  participant CS as CS Agent
  participant RF as Refund Agent
  participant PAY as Payment API
  U->>S: Request
  S->>CS: classify
  CS-->>S: intent
  S->>RF: route
  RF->>PAY: get_order
  PAY-->>RF: order_data
  RF->>PAY: process_refund
  PAY-->>RF: refund_id
  RF-->>S: result
  S-->>U: Response
```

---

## 5. Error Handling

| Error Type | Strategy | User Impact |
|---|---|---|
| LLM timeout | Retry x3 → fallback model → error message | Minor delay |
| Tool execution failure | Retry x2 → log → inform agent | Agent replans |
| Agent iteration limit | Force stop → escalate to human | Escalation |
| RAG retrieval empty | Proceed without context + caveat in response | Potentially less accurate |
| Memory write failure | Log warning, continue (non-blocking) | None |
| Auth failure | Reject immediately + audit log | Hard stop |
| Budget exceeded | Stop generation + partial response | Truncated response |
