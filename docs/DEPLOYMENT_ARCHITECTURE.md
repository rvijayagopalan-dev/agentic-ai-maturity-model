# Deployment Architecture — AI Evolution & Maturity Platform

## 1. Cloud Topology

### 1.1 Primary Region Architecture (Active)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          PRIMARY REGION (e.g. East US 2)                      │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                         Public Zone                                       │ │
│  │                                                                            │ │
│  │   ┌─────────────────────────────────────────────────────────────────┐    │ │
│  │   │                  CDN + WAF (Cloudflare / Front Door)            │    │ │
│  │   └──────────────────────────────┬──────────────────────────────────┘    │ │
│  │                                   │                                        │ │
│  │   ┌───────────────────────────────▼──────────────────────────────────┐   │ │
│  │   │                     API Gateway Cluster                           │   │ │
│  │   │                 (Kong / Azure APIM — 3 replicas)                  │   │ │
│  │   └──────────────────────────────┬───────────────────────────────────┘   │ │
│  └─────────────────────────────────┬─────────────────────────────────────────┘ │
│                                     │ (Private network only past this point)    │
│  ┌──────────────────────────────────▼──────────────────────────────────────┐   │
│  │                        Private Zone — AZ 1, AZ 2, AZ 3                   │   │
│  │                                                                             │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐    │   │
│  │  │                  Kubernetes Cluster (AKS / EKS)                    │    │   │
│  │  │                                                                     │    │   │
│  │  │  Namespace: ai-platform          Namespace: ai-agents              │    │   │
│  │  │  ┌──────────┐ ┌──────────┐       ┌──────┐ ┌──────┐ ┌──────┐     │    │   │
│  │  │  │LLM GW    │ │RAG Svc   │       │CS Agt│ │Refund│ │Ship  │     │    │   │
│  │  │  │(3 pods)  │ │(2 pods)  │       │(5-20)│ │Agt   │ │Agt   │     │    │   │
│  │  │  └──────────┘ └──────────┘       └──────┘ └──────┘ └──────┘     │    │   │
│  │  │  ┌──────────┐ ┌──────────┐                                        │    │   │
│  │  │  │Supervisor│ │Workflow  │       Namespace: ai-tools              │    │   │
│  │  │  │Agent     │ │Engine    │       ┌──────────┐ ┌──────────┐       │    │   │
│  │  │  └──────────┘ └──────────┘       │Tool Reg. │ │API Adapt.│       │    │   │
│  │  │                                  └──────────┘ └──────────┘       │    │   │
│  │  └───────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │   │
│  │  │ Vector DB     │  │  Redis       │  │   Kafka      │  │  Neo4j      │   │   │
│  │  │ (Pinecone     │  │  Cluster     │  │   Cluster    │  │  (Knowledge │   │   │
│  │  │  or pgvector) │  │  (3 nodes)   │  │   (3 brokers)│  │   Graph)    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘   │   │
│  │                                                                             │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────────────────┐   │   │
│  │  │  PostgreSQL (HA)          │  │   Data Lake (S3 / ADLS)             │   │   │
│  │  │  Primary + 2 Read Replicas│  │   Hot / Warm / Cold tiers           │   │   │
│  │  └──────────────────────────┘  └──────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Secondary Region Architecture (Passive / Active-Active for L8+)

```
┌──────────────────────────────────────────────────┐
│           SECONDARY REGION (e.g. West US 2)       │
│                                                    │
│   K8s Cluster (warm standby)                      │
│   - Stateless services: deployed, scaled to 0     │
│   - Scales up in < 5 min on failover              │
│                                                    │
│   PostgreSQL Read Replica (cross-region)          │
│   Redis: async replication from primary           │
│   Kafka: MirrorMaker2 replication                 │
│   Vector DB: replicated index (tenant-specific)   │
│   Data Lake: cross-region geo-replication         │
└──────────────────────────────────────────────────┘
           ▲
           │ DNS failover (Azure Traffic Manager
           │ / AWS Route 53 health checks)
           ▼
┌──────────────────────────────────────────────────┐
│                PRIMARY REGION                     │
└──────────────────────────────────────────────────┘
```

---

## 2. Network Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          VPC / VNet                                  │
│                                                                       │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │   Public Subnet   │  │  Private App Subnet│  │  Data Subnet    │  │
│  │                   │  │                    │  │                 │  │
│  │  API Gateway      │  │  K8s node pools    │  │  Databases      │  │
│  │  NAT Gateway      │  │  Service mesh      │  │  Vector DB      │  │
│  │  Load Balancer    │  │  Kafka             │  │  Redis          │  │
│  │                   │  │  Redis (cache)     │  │  Neo4j          │  │
│  └───────────────────┘  └───────────────────┘  └─────────────────┘  │
│                                                                       │
│  Network Policies (Kubernetes):                                       │
│  - Default: deny all ingress + egress                                 │
│  - Explicit allow rules per service pair                              │
│  - No direct pod-to-internet (egress via approved proxy only)         │
│                                                                       │
│  Private Endpoints for:                                               │
│  - LLM Provider APIs (Azure OpenAI / Bedrock VPC endpoint)           │
│  - Key Vault / Secrets Manager                                        │
│  - Container Registry                                                  │
│  - Data Lake storage                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

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

```
GitHub / Azure DevOps
        │
        ▼
GitHub Actions (CI: test, build, scan)
        │
        ▼
Container Registry (ACR / ECR) ← signed images
        │
        ▼
ArgoCD (GitOps controller — watches Helm values repo)
        │
   ┌────┴────┐
   ▼         ▼
Dev         Staging
   │
   ▼ (manual promotion)
UAT
   │
   ▼ (approval gate)
Canary (10% traffic split via Ingress)
   │
   ▼ (automated promotion after 30min if metrics healthy)
Production (100%)
```

---

## 7. Observability Infrastructure Deployment

```
┌────────────────────────────────────────────────────────────┐
│                  Observability Namespace                     │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │ OTel        │  │ Prometheus  │  │  Grafana            ││
│  │ Collector   │  │ + Thanos    │  │  (dashboards)       ││
│  │ (DaemonSet) │  │             │  │                     ││
│  └─────────────┘  └─────────────┘  └─────────────────────┘│
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │ Jaeger /    │  │ Langfuse    │  │  AlertManager       ││
│  │ Tempo       │  │ (AgentOps)  │  │  + PagerDuty        ││
│  │ (traces)    │  │             │  │                     ││
│  └─────────────┘  └─────────────┘  └─────────────────────┘│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  ELK Stack (Elasticsearch + Logstash + Kibana)         ││
│  │  or OpenSearch — centralised log aggregation           ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

## 8. Secrets Management

```
HashiCorp Vault (or Azure Key Vault)
          │
          ├── Dynamic secrets: Database credentials (rotated every 24h)
          ├── Static secrets: LLM API keys (rotated monthly)
          ├── PKI: mTLS certificates (rotated every 90 days)
          └── Encryption keys: AES-256 keys per tenant

K8s Integration:
  - Vault Agent Sidecar Injector (or External Secrets Operator)
  - Secrets mounted as files (never environment variables)
  - No secrets in ConfigMaps, Helm values, or Git
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
