# Quality Scoring Framework

This document defines the quality scoring system used to evaluate features, implementations, and system performance.

---

## Quality Score Formula (v1.0)

```
Q = (W_user × UserRating) + (W_auto × AutomatedGateScore) 
    + (W_succ × TaskSuccessRate) + (W_eff × EfficiencyScore)
```

### Default Weights

| Component | Weight | Rationale |
|-----------|--------|-----------|
| User Rating (W_user) | 0.25 | Captures subjective quality and UX |
| Automated Gates (W_auto) | 0.25 | Objective quality metrics (tests, security, types) |
| Task Success Rate (W_succ) | 0.35 | Most important: does it work reliably? |
| Efficiency (W_eff) | 0.15 | Cost and performance optimization |

**Pass Threshold**: Q ≥ 0.75

---

## Component Definitions

### 1. User Rating (0.0 - 1.0)

**How to Score**:
- 1.0: Exceeds expectations, delightful experience
- 0.8: Meets expectations, works well
- 0.6: Meets minimum requirements, some friction
- 0.4: Works but frustrating
- 0.2: Barely usable
- 0.0: Unusable

**Evaluation Criteria**:
- Ease of use (intuitive vs confusing)
- Speed of completion (fast vs slow)
- Error handling (helpful vs cryptic)
- Visual polish (clean vs rough)

**Example**:
- Scanner feature with clear progress, good error messages: 0.85
- Scanner that works but gives no feedback: 0.60

---

### 2. Automated Gate Score (0.0 - 1.0)

Objective quality metrics from automated checks.

**Calculation**:
```
AutomatedGateScore = (Security + TypeSafety + TestCoverage + Linting) / 4
```

#### Security (0.0 - 1.0)
- **1.0**: No vulnerabilities, follows security best practices
- **0.8**: Minor issues (non-critical warnings)
- **0.6**: Moderate issues (missing input validation)
- **0.4**: Major issues (SQL injection risks)
- **0.0**: Critical issues (authentication bypass)

**Checks**:
- ✅ Input validation (Zod schemas, sanitization)
- ✅ Path traversal prevention (for file operations)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Secret management (no hardcoded keys)
- ✅ Rate limiting (for public endpoints)

#### Type Safety (0.0 - 1.0)
- **1.0**: Full TypeScript, no `any`, strict mode enabled
- **0.8**: TypeScript with occasional `any` for good reasons
- **0.6**: TypeScript with frequent `any`
- **0.4**: Mixed TS/JS
- **0.0**: Plain JavaScript, no types

**Checks**:
- `tsc --noEmit` passes without errors
- No unsafe type assertions
- Shared types between frontend/backend

#### Test Coverage (0.0 - 1.0)
- **1.0**: >90% coverage, all critical paths tested
- **0.8**: 70-90% coverage, main flows tested
- **0.6**: 50-70% coverage, basic tests
- **0.4**: 30-50% coverage, minimal tests
- **0.0**: <30% coverage or no tests

**Types of Tests**:
- Unit tests (individual functions)
- Integration tests (API endpoints)
- E2E tests (user workflows with Playwright)

#### Linting (0.0 - 1.0)
- **1.0**: No lint errors or warnings
- **0.8**: Minor warnings (unused vars)
- **0.6**: Some errors (missing dependencies)
- **0.4**: Many errors
- **0.0**: Fails to lint

**Example**:
Scanner feature scores:
- Security: 1.0 (path validation, whitelist, limits)
- TypeSafety: 0.95 (full TypeScript, one `as` cast)
- TestCoverage: 0.60 (manual testing only, no automated tests yet)
- Linting: 1.0 (no errors)
- **AutomatedGateScore**: (1.0 + 0.95 + 0.60 + 1.0) / 4 = **0.89**

---

### 3. Task Success Rate (0.0 - 1.0)

**Definition**: Percentage of feature operations that complete successfully.

**Calculation**:
```
TaskSuccessRate = SuccessfulOperations / TotalAttempts
```

**Measurement Period**: Last 100 operations or 7 days, whichever is larger.

**What Counts as Failure**:
- Unhandled exceptions
- HTTP 5xx errors
- Timeouts
- Data corruption
- User-reported bugs

**What Doesn't Count**:
- HTTP 4xx errors (user error, expected)
- Validation failures (expected behavior)
- Graceful degradation (e.g., AI provider fallback)

**Example**:
- Scanner: 98 successful scans, 2 timeouts out of 100 → **0.98**
- File upload: 195 successes, 5 failures out of 200 → **0.975**

---

### 4. Efficiency Score (0.0 - 1.0)

**Definition**: How well the feature uses resources (time, money, compute).

**Calculation**:
```
EfficiencyScore = (LatencyScore + CostScore) / 2
```

#### Latency Score (0.0 - 1.0)
Based on p95 response time vs target:

| p95 Latency | Score | Rating |
|-------------|-------|--------|
| <100ms | 1.0 | Excellent |
| 100-500ms | 0.9 | Great |
| 500ms-1s | 0.8 | Good |
| 1-2s | 0.6 | Acceptable |
| 2-5s | 0.4 | Slow |
| >5s | 0.2 | Very Slow |

#### Cost Score (0.0 - 1.0)
Based on cost per operation vs budget:

| Cost Efficiency | Score | Rating |
|-----------------|-------|--------|
| <50% of budget | 1.0 | Excellent |
| 50-75% of budget | 0.8 | Good |
| 75-100% of budget | 0.6 | Acceptable |
| 100-150% of budget | 0.4 | Over budget |
| >150% of budget | 0.2 | Way over budget |

**Example**:
AI analysis feature:
- p95 latency: 2.5s (LatencyScore = 0.5)
- Cost: $0.003/file vs $0.005 budget (CostScore = 1.0)
- **EfficiencyScore**: (0.5 + 1.0) / 2 = **0.75**

---

## Complete Scoring Example

### Feature: Local Drive Scanner

**Component Scores**:
- **UserRating**: 0.85 (works well, clear feedback, minor UX friction)
- **AutomatedGateScore**: 0.89 (strong security/types, needs more tests)
- **TaskSuccessRate**: 0.98 (2% timeout rate)
- **EfficiencyScore**: 0.75 (fast scans, efficient cost)

**Quality Score**:
```
Q = (0.25 × 0.85) + (0.25 × 0.89) + (0.35 × 0.98) + (0.15 × 0.75)
Q = 0.2125 + 0.2225 + 0.343 + 0.1125
Q = 0.8905
```

**Result**: ✅ **PASS** (Q = 0.89 ≥ 0.75)

**Interpretation**: High-quality feature ready for production. Consider adding automated tests to improve AutomatedGateScore to 0.95+.

---

## Self-Healing Trigger

When Q < 0.75, generate a **Self-Healing Patch Plan**:

```json
{
  "root_issue": "Low task success rate (0.65) due to timeout failures",
  "proposed_edits": [
    "Increase scan timeout from 30s to 60s",
    "Add retry logic for filesystem errors",
    "Implement partial scan results on timeout"
  ],
  "profile_tweaks": [
    "Reduce depth limit from 3 to 2 for faster scans"
  ],
  "expected_gain": "TaskSuccessRate: 0.65 → 0.90, Q: 0.72 → 0.82",
  "risk_notes": "Timeout increase may hide underlying performance issues"
}
```

Then re-attempt implementation once with edits applied.

---

## Monitoring Dashboard

Track quality scores over time:

```
┌─────────────────────────────────────────────────┐
│ Quality Score Trends (Last 30 Days)            │
├─────────────────────────────────────────────────┤
│ Feature          │ Current Q │ Trend │ Status  │
├──────────────────┼───────────┼───────┼─────────┤
│ File Upload      │ 0.92      │ ↑     │ ✅ Pass │
│ AI Analysis      │ 0.88      │ →     │ ✅ Pass │
│ Scanner          │ 0.89      │ ↑     │ ✅ Pass │
│ KB Search        │ 0.82      │ ↓     │ ✅ Pass │
│ Job Retry        │ 0.71      │ ↓     │ ⚠️ Risk │
└──────────────────┴───────────┴───────┴─────────┘

⚠️ Alert: Job Retry below threshold, review needed
```

---

## Quality Gates for Release

**Before merging to main**:
- Q ≥ 0.75 (minimum threshold)
- Security ≥ 0.90 (non-negotiable)
- TaskSuccessRate ≥ 0.95 (reliability critical)

**Before production deployment**:
- Q ≥ 0.80 (higher bar for production)
- Automated tests exist (coverage ≥ 0.70)
- User testing completed (UserRating measured)

**For public release**:
- Q ≥ 0.85 (excellent quality)
- All P0 gaps closed
- Monitoring and alerting configured
