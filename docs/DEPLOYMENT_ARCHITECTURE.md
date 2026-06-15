# Deployment Architecture — AI Evolution & Maturity Platform

## 1. Cloud Topology

### 1.1 Primary Region Architecture (Active)

```mermaid
flowchart TD
  subgraph PR["PRIMARY REGION (e.g. East US 2)"]
    subgraph PUB["Public Zone"]
      CDN["CDN + WAF<br/>(Cloudflare / Front Door)"]
      APIGW["API Gateway Cluster<br/>(Kong / Azure APIM — 3 replicas)"]
      CDN --> APIGW
    end
    subgraph PRIV["Private Zone — AZ 1 · AZ 2 · AZ 3"]
      subgraph K8S["Kubernetes Cluster (AKS / EKS)"]
        NSP["ns: ai-platform<br/>LLM GW (3) · RAG Svc (2) · Supervisor · Workflow Engine"]
        NSA["ns: ai-agents<br/>CS (5-20) · Refund · Shipping Agents"]
        NST["ns: ai-tools<br/>Tool Registry · API Adapters"]
      end
      DataStores["Vector DB (Pinecone/pgvector) · Redis (3) · Kafka (3 brokers) · Neo4j"]
      Persist["PostgreSQL HA (Primary + 2 Read Replicas) · Data Lake (S3/ADLS, Hot/Warm/Cold)"]
    end
    APIGW -->|Private network only| K8S
    K8S --> DataStores
    K8S --> Persist
  end
```

### 1.2 Secondary Region Architecture (Passive / Active-Active for L8+)

```mermaid
flowchart TD
  SEC["<b>SECONDARY REGION (e.g. West US 2)</b><br/>K8s warm standby (stateless scaled to 0, &lt; 5 min failover)<br/>PostgreSQL read replica · Redis async repl · Kafka MirrorMaker2<br/>Vector DB replicated index · Data Lake geo-replication"]
  PRI["<b>PRIMARY REGION</b>"]
  PRI <-->|"DNS failover<br/>(Traffic Manager / Route 53 health checks)"| SEC
```

---

## 2. Network Architecture

```mermaid
flowchart LR
  subgraph VPC["VPC / VNet"]
    PubS["<b>Public Subnet</b><br/>API Gateway · NAT Gateway · Load Balancer"]
    AppS["<b>Private App Subnet</b><br/>K8s node pools · Service mesh · Kafka · Redis (cache)"]
    DataS["<b>Data Subnet</b><br/>Databases · Vector DB · Redis · Neo4j"]
    PubS --> AppS --> DataS
  end
  PE["<b>Private Endpoints</b><br/>LLM Provider APIs · Key Vault · Container Registry · Data Lake"]
  AppS -.-> PE
```

> **Network Policies (Kubernetes):** Default deny-all ingress + egress · explicit allow rules per service pair · no direct pod-to-internet (egress via approved proxy only).

---

## 3. Kubernetes Cluster Design

### 3.1 Node Pool Strategy

| Node Pool | Instance Type | Min/Max Nodes | Purpose |
|---|---|---|---|
| system | Standard_D4s_v5 | 3/3 | K8s system components (fixed) |
| ai-platform | Standard_D8s_v5 | 3/10 | LLM GW, RAG, Supervisor |
| ai-agents | Standard_D4s_v5 | 2/50 | Agent pods (HPA-driven) |
| ai-data | Standard_D8s_v5 | 2/6 | Vector DB operators, Kafka |
| gpu (optional) | Standard_NC6s_v3 | 0/4 | Local embedding models |
| monitoring | Standard_D4s_v5 | 2/4 | Observability stack |

### 3.2 Resource Quotas per Namespace

| Namespace | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---|---|---|---|---|
| ai-platform | 8 cores | 32 cores | 16Gi | 64Gi |
| ai-agents | 4 cores | 100 cores | 8Gi | 200Gi |
| ai-tools | 2 cores | 8 cores | 4Gi | 16Gi |
| ai-monitoring | 4 cores | 8 cores | 8Gi | 16Gi |

---

## 4. Multi-Tenancy Architecture

```
Tenant: Acme Corp                    Tenant: Beta Inc
──────────────                       ──────────────
K8s Namespace: acme/                 K8s Namespace: beta/
Vector Index Namespace: acme/*       Vector Index Namespace: beta/*
Kafka Topic Prefix: acme.*           Kafka Topic Prefix: beta.*
Redis Key Prefix: acme:              Redis Key Prefix: beta:
Data Lake Path: s3://dl/acme/        Data Lake Path: s3://dl/beta/
Audit Log Partition: tenant=acme     Audit Log Partition: tenant=beta

Shared (single-instance, logical isolation):
  - LLM Gateway (tenant header routing)
  - API Gateway (tenant JWT claims)
  - Observability (tenant label filtering)
```

---

## 5. External Service Connectivity

| Service | Connectivity | Authentication |
|---|---|---|
| Anthropic API | Private endpoint / internet with IP allowlist | API key (Vault) |
| OpenAI API | Internet with TLS + IP allowlist | API key (Vault) |
| AWS Bedrock | VPC endpoint | IAM role (IRSA) |
| Pinecone | Internet with TLS | API key (Vault) |
| Salesforce CRM | Site-to-site VPN or private link | OAuth client credentials |
| SAP ERP | VPN / ExpressRoute | Service account |
| Payment Gateway | Internet with TLS + IP allowlist | API key + HMAC signing |

---

## 6. CI/CD Deployment Flow

```mermaid
flowchart TD
  SRC["GitHub / Azure DevOps"]
  CI["GitHub Actions<br/>(CI: test · build · scan)"]
  CR["Container Registry (ACR / ECR)<br/>← signed images"]
  ARGO["ArgoCD (GitOps controller)<br/>watches Helm values repo"]
  Dev["Dev"]
  Stg["Staging"]
  UAT["UAT"]
  Can["Canary<br/>(10% traffic split via Ingress)"]
  Prod["Production (100%)"]
  SRC --> CI --> CR --> ARGO
  ARGO --> Dev
  ARGO --> Stg
  Dev -->|manual promotion| UAT
  UAT -->|approval gate| Can
  Can -->|auto-promote after 30 min if healthy| Prod
```

---

## 7. Observability Infrastructure Deployment

```mermaid
flowchart TD
  subgraph OBS["Observability Namespace"]
    direction LR
    OTel["OTel Collector<br/>(DaemonSet)"]
    Prom["Prometheus + Thanos"]
    Graf["Grafana (dashboards)"]
    Jaeger["Jaeger / Tempo (traces)"]
    LF["Langfuse (AgentOps)"]
    AM["AlertManager + PagerDuty"]
    ELK["ELK Stack / OpenSearch<br/>centralised log aggregation"]
  end
```

---

## 8. Secrets Management

```mermaid
flowchart LR
  V["HashiCorp Vault<br/>(or Azure Key Vault)"]
  V --> DS["Dynamic secrets<br/>DB credentials (rotated 24h)"]
  V --> SS["Static secrets<br/>LLM API keys (rotated monthly)"]
  V --> PKI["PKI<br/>mTLS certs (rotated 90 days)"]
  V --> EK["Encryption keys<br/>AES-256 per tenant"]
  V --> K8S["K8s Integration<br/>Vault Sidecar / External Secrets Operator<br/>mounted as files · never env vars · never in Git"]
```

---

## 9. Deployment Checklist per Environment

| Check | Dev | Staging | Prod |
|---|---|---|---|
| All container images signed | Recommended | Required | Required |
| Network policies applied | Recommended | Required | Required |
| Resource quotas set | Recommended | Required | Required |
| HPA configured | Optional | Required | Required |
| PodDisruptionBudget set | No | Required | Required |
| ReadinessProbe configured | Required | Required | Required |
| LivenessProbe configured | Required | Required | Required |
| Secrets from Vault only | Recommended | Required | Required |
| mTLS enabled (Istio) | Optional | Required | Required |
| Observability agents running | Required | Required | Required |
| DR tested | No | Quarterly | Quarterly |
