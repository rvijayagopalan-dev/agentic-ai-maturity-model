# Implementing a Data Agent

If your goal is **enterprise-grade Data Agents**, do not start with autonomous multi-agent systems. Start with a deterministic progression.

The maturity roadmap should be:

```text
Level 1: Query Agent
Level 2: Analytics Agent
Level 3: Data Engineering Agent
Level 4: Data Quality Agent
Level 5: Governance Agent
Level 6: Multi-Agent Data Platform
Level 7: Autonomous Data Platform
```

---

# Reference Architecture

```text
                        User
                          │
                          ▼
                API / Chat Interface
                          │
                          ▼
                  Agent Orchestrator
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼

 Metadata Tool      Data Tool      Governance Tool

        │                 │                 │
        └─────────────────┼─────────────────┘
                          │

                    Knowledge Graph

                          │

      ┌───────────────Data Platform──────────────┐
      │                                          │
      │ Snowflake                               │
      │ Databricks                              │
      │ Kafka                                   │
      │ DataHub                                 │
      │ PostgreSQL                              │
      └──────────────────────────────────────────┘
```

---

# Core Components

## 1. LLM Layer

Responsible for:

* Intent Recognition
* Planning
* Tool Selection
* Reasoning

Examples:

* OpenAI GPT
* Claude
* Llama

---

## 2. Tool Layer

The agent never directly accesses databases.

```python
class Tool:
    name:str

    def execute(self, args):
        pass
```

Examples:

```python
QueryTool
MetadataTool
LineageTool
CatalogTool
QualityTool
```

---

## 3. Metadata Layer

The most important component.

Without metadata:

```text
Agent = Blind
```

Metadata includes:

```text
Tables
Columns
Owners
Lineage
Policies
Business Terms
KPIs
```

Examples:

* DataHub
* OpenMetadata

---

## 4. Knowledge Graph

Enterprise context repository.

```text
Customer
  │
  ├── Orders
  │
  ├── Payments
  │
  └── Support Tickets
```

Technology:

* Neo4j
* Amazon Neptune

---

# Level 1 Implementation: Query Agent

User:

```text
Top 10 customers by revenue
```

Flow:

```text
Question
    ↓
Intent Detection
    ↓
Metadata Search
    ↓
SQL Generation
    ↓
Execution
    ↓
Formatting
```

---

## Project Structure

```text
data-agent/
│
├── app.py
├── agent/
│   ├── planner.py
│   ├── executor.py
│   └── memory.py
│
├── tools/
│   ├── query_tool.py
│   ├── metadata_tool.py
│   └── lineage_tool.py
│
├── llm/
│   └── model.py
│
├── prompts/
│   └── sql_generation.txt
│
└── config/
    └── settings.py
```

---

## Query Tool

```python
import pandas as pd
import sqlalchemy

class QueryTool:

    def __init__(self, connection_string):
        self.engine = sqlalchemy.create_engine(
            connection_string
        )

    def execute(self, sql):

        return pd.read_sql(
            sql,
            self.engine
        )
```

---

## Metadata Tool

```python
class MetadataTool:

    def get_schema(self):

        return {
            "customer":{
                "customer_id":"int",
                "name":"string"
            },
            "orders":{
                "order_id":"int",
                "amount":"decimal"
            }
        }
```

---

## Planner

```python
class Planner:

    def create_plan(
        self,
        question
    ):

        return [
            "get_metadata",
            "generate_sql",
            "execute_query",
            "format_response"
        ]
```

---

## SQL Generator

```python
def generate_sql(
    question,
    schema,
    llm
):

    prompt = f"""
    Schema:
    {schema}

    Question:
    {question}

    Return SQL only
    """

    return llm.invoke(prompt)
```

---

# Level 2 Analytics Agent

Adds:

```text
Statistics
Forecasting
Root Cause Analysis
Trend Analysis
```

Architecture:

```text
Question
    ↓
SQL
    ↓
Dataframe
    ↓
Analytics Engine
    ↓
Explanation
```

---

## Analytics Tool

```python
class AnalyticsTool:

    def trend(
        self,
        dataframe
    ):

        return dataframe.describe()
```

---

# Level 3 Data Engineering Agent

Automates pipelines.

User:

```text
Connect Salesforce to Snowflake
```

Agent:

```text
Source Discovery
Mapping
Pipeline Generation
Testing
Deployment
```

---

## Example Output

```yaml
pipeline:
  source:
    salesforce

  target:
    snowflake

  transformations:
    - normalize_address
    - validate_email

  schedule:
    hourly
```

---

# Level 4 Data Quality Agent

Checks:

```text
Freshness
Nulls
Duplicates
Schema Drift
Outliers
```

---

## Great Expectations Example

```python
expect_column_values_to_not_be_null(
    "customer_id"
)
```

Using Great Expectations

---

# Level 5 Governance Agent

Capabilities:

```text
PII Detection
Classification
Masking
Retention
Policy Enforcement
```

Example:

```python
if contains_pii(column):
    mask_column(column)
```

---

# Multi-Agent Data Platform

```text
                    Coordinator
                          │

      ┌───────────┬───────────┬───────────┐

      ▼           ▼           ▼

   Query      Quality     Metadata
   Agent       Agent       Agent

      ▼           ▼           ▼

         Governance Agent

                  ▼

          Enterprise Data
              Platform
```

---

# Enterprise-Grade Production Stack

| Layer           | Technology         |
| --------------- | ------------------ |
| Agent Framework | LangGraph          |
| LLM             | OpenAI GPT         |
| Metadata        | DataHub            |
| Knowledge Graph | Neo4j              |
| Streaming       | Apache Kafka       |
| Warehouse       | Snowflake          |
| Transformation  | dbt                |
| Orchestration   | Apache Airflow     |
| Observability   | Monte Carlo        |
| Quality         | Great Expectations |

---

# Enterprise Data Agent Maturity Roadmap

```text
L1 Query Agent
   ↓
L2 Analytics Agent
   ↓
L3 Engineering Agent
   ↓
L4 Quality Agent
   ↓
L5 Governance Agent
   ↓
L6 Data Product Agent
   ↓
L7 Agent Mesh
   ↓
L8 Autonomous Data Platform
   ↓
L9 Self-Driving Enterprise Data Ecosystem
```

For the Enterprise Architect Academy roadmap you have been building, I would add three missing enterprise-grade components before L6:

```text
Data Agent
    +
Metadata Agent
    +
Knowledge Graph Agent
    +
Semantic Layer Agent
    +
Governance Agent
```

These become the deterministic foundation upon which a future Agent Mesh and Autonomous Data Platform can safely operate.
