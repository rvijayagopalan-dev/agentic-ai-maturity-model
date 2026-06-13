# UAT Plan — AI Evolution & Maturity Platform

## 1. Overview

User Acceptance Testing (UAT) validates that each phase delivers business value and meets acceptance criteria as defined by business stakeholders. For AI systems, UAT includes both functional validation and AI quality judgement by real users.

---

## 2. UAT Approach

| Aspect | Approach |
|---|---|
| **Environment** | Dedicated UAT environment with realistic synthetic data |
| **Participants** | Business SMEs, contact centre agents, supervisors, and select customers (Beta) |
| **Duration** | 2 weeks per phase (1 week scripted; 1 week exploratory) |
| **AI-specific** | Testers evaluate AI response quality using a structured scoring rubric |
| **Outcome** | Signed UAT completion report by business owner |

---

## 3. UAT Participants

| Role | Responsibilities | Phases Involved |
|---|---|---|
| VP Customer Experience | Final sign-off authority | All |
| Contact Centre Supervisor | Scripted test execution; quality evaluation | All |
| Contact Centre Agent (5 participants) | Exploratory testing; AI interaction quality judgement | P1+ |
| Finance Team Lead | Refund workflow UAT | P3, P4 |
| Compliance Officer | Policy adherence, audit trail review | P5+ |
| IT Security | Security scenario testing | P3+ |
| Business Analyst (facilitator) | Test facilitation, defect logging, reporting | All |
| Beta Customer Group (10 participants) | Real customer testing of chat interface | P2+ |

---

## 4. UAT by Phase

### Phase 1 UAT — L1–2: Prompt AI

**Acceptance Criteria:**
- [ ] AI chat responds to 95%+ of test queries without error
- [ ] Response tone matches brand guidelines (rated by 3 supervisors; avg > 4/5)
- [ ] AI does not claim to be human when sincerely asked
- [ ] Response time < 5 seconds for 95% of queries
- [ ] Escalation to human works correctly for all test cases
- [ ] No sensitive data appears in AI response for test PII inputs

**Test Scenarios:**
1. Standard FAQ queries (20 scenarios)
2. Complex multi-part questions (5 scenarios)
3. Ambiguous / unclear queries (5 scenarios)
4. Off-topic queries (5 scenarios)
5. Escalation triggers (5 scenarios)

---

### Phase 2 UAT — L3: RAG

**Additional Acceptance Criteria:**
- [ ] AI correctly retrieves and cites policy answers for 90%+ of policy queries
- [ ] AI response marked as "accurate" by SME for 90%+ of knowledge queries
- [ ] AI appropriately caveats when answer not found in knowledge base
- [ ] Document source citations are correct and accessible

**Additional Test Scenarios:**
1. Policy question queries (30 scenarios mapped to policy documents)
2. Product information queries (20 scenarios)
3. Queries where answer is NOT in knowledge base (10 scenarios)
4. Queries requiring synthesis from multiple documents (5 scenarios)

---

### Phase 3 UAT — L4: Tool Calling

**Additional Acceptance Criteria:**
- [ ] AI correctly retrieves order status for test orders (100%)
- [ ] AI correctly retrieves customer profile (100%)
- [ ] New tickets created in CRM correctly (100%)
- [ ] Human approval prompt appears correctly for restricted tools
- [ ] Audit log entry created for every tool call (verified by Compliance)

**Additional Test Scenarios:**
1. Order status lookup — multiple order states (10 scenarios)
2. Customer profile retrieval (5 scenarios)
3. Ticket creation (5 scenarios)
4. Shipment tracking (5 scenarios)
5. Tool call requiring human approval (3 scenarios)

---

### Phase 4 UAT — L5: Workflow AI

**Additional Acceptance Criteria:**
- [ ] Refund workflow completes end-to-end without human intervention for eligible cases
- [ ] Ineligible refunds are declined with correct reason and escalation offered
- [ ] Cancellation workflow completes correctly for cancellable orders
- [ ] Human approval gate functions for refunds > $500
- [ ] Finance team can view all AI-initiated refunds in dashboard

**Additional Test Scenarios:**
1. Eligible refund: standard case (5 scenarios)
2. Eligible refund: > $500 (requires approval) (3 scenarios)
3. Ineligible refund: outside return window (3 scenarios)
4. Order cancellation: before dispatch (3 scenarios)
5. Order cancellation: after dispatch (3 scenarios)
6. Full workflow: cancel + refund (5 scenarios)

---

### Phase 5 UAT — L6: Single Agent

**Additional Acceptance Criteria:**
- [ ] Agent completes complex multi-step requests without explicit guidance
- [ ] Agent correctly uses context from earlier in conversation
- [ ] Agent escalates appropriately when confidence is low
- [ ] Agent does not loop or stall (max iterations enforced)
- [ ] Memory retains relevant context for 30-minute session window

**Additional Test Scenarios:**
1. Complex multi-step: cancel order + refund + schedule collection (5 scenarios)
2. Context retention: 6-turn conversation referencing earlier turns (5 scenarios)
3. Appropriate escalation: ambiguous edge case (5 scenarios)
4. Recovery from tool failure (3 scenarios)
5. High-value customer interaction: VIP handling (3 scenarios)

---

### Phase 6 UAT — L7: Multi-Agent

**Additional Acceptance Criteria:**
- [ ] Supervisor correctly routes to specialist agents for all test scenarios
- [ ] Multi-agent collaboration produces coherent, non-contradictory responses
- [ ] Cross-agent handoff is invisible to the end user
- [ ] Knowledge Agent correctly augments other agents
- [ ] Fraud Agent flags test fraud scenarios correctly

---

### Phases 7–9 UAT

UAT plans for Phases 7–9 developed 4 weeks before each phase UAT window, following the same structure. Additional focus areas:

- Phase 7: End-to-end business process validation with all business domain owners
- Phase 8: AI Workforce KPI validation; SLA tracking; governance dashboard review
- Phase 9: Autonomous decision review; self-optimisation validation; audit trail completeness

---

## 5. UAT Scoring Rubric (AI Quality)

Business testers score AI responses on a 5-point scale:

| Score | Description |
|---|---|
| 5 | Perfect response — accurate, empathetic, concise, complete |
| 4 | Good response — minor improvements possible but fully functional |
| 3 | Acceptable — functional but lacks warmth or has minor gaps |
| 2 | Poor — partially correct; significant gaps or wrong tone |
| 1 | Unacceptable — wrong, harmful, or refused when it shouldn't |

**Acceptance threshold:** Average score ≥ 3.8 across all scenarios; no scenario scores 1 from majority of testers

---

## 6. Defect Classification in UAT

| Severity | Definition | Go-Live Impact |
|---|---|---|
| **Blocker** | Safety violation; wrong financial amount; data leak; complete failure | Cannot go-live until fixed |
| **Critical** | Primary use case fails; wrong answer for key scenario | Cannot go-live until fixed |
| **Major** | Secondary use case fails; quality below threshold | Fix within 5 days; re-test |
| **Minor** | Edge case; cosmetic; UX improvement | Scheduled for next phase |

---

## 7. UAT Sign-off

UAT is considered passed and signed off when:

1. All scripted test scenarios executed
2. No Blocker or Critical defects open
3. Average AI quality score ≥ 3.8
4. Compliance officer confirms audit trail complete (Phase 3+)
5. Finance sign-off on financial workflow accuracy (Phase 3+)
6. VP Customer Experience signs UAT completion report

**Sign-off document:** UAT Completion Report (generated from defect tracking tool)
**Escalation:** If UAT sign-off cannot be achieved within the 2-week window, Program Director convenes a risk review with Steering Committee.
