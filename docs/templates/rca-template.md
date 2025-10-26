# RCA Template: Root Cause Analysis Report

Use this template for post-incident analysis and debugging complex issues.

---

## RCA-YYYY-MM-DD: [Incident Title]

**Status**: 🔴 Active | 🟡 Investigating | 🟢 Resolved  
**Severity**: Critical | High | Medium | Low  
**Date**: YYYY-MM-DD  
**MTTR**: [Time to resolution]  

### Incident Summary
[1-2 sentence description of what went wrong from user perspective]

### Timeline

| Time (UTC) | Event | Actor |
|------------|-------|-------|
| HH:MM | [Event description] | [System/User/Agent] |
| HH:MM | [Event description] | [System/User/Agent] |
| HH:MM | **Root cause identified** | [Who] |
| HH:MM | Fix deployed | [Who] |
| HH:MM | Incident resolved | System |

### Root Cause

**Primary Cause**:  
[Technical explanation of the root cause]

**Contributing Factors**:
- [Factor 1: e.g., Missing test coverage]
- [Factor 2: e.g., Edge case not considered]
- [Factor 3: e.g., Documentation gap]

**Why It Wasn't Caught Earlier**:
- [Explanation of why testing/review missed this]

### Impact Analysis

**User Impact**:
- Affected users: [number or percentage]
- Duration: [time period]
- Severity: [description of user experience degradation]

**Data Impact**:
- Data loss: ✅ None | ⚠️ Partial | ❌ Complete
- Data corruption: [description if applicable]
- Recovery needed: [description if applicable]

**System Impact**:
- Availability: [percentage uptime during incident]
- Performance: [degradation metrics]
- Cascade effects: [other systems affected]

### Fix Applied

**Code Changes**:
```diff
- [Old code that caused the issue]
+ [New code that fixes the issue]
```

**Configuration Changes**:
- [Config 1: before → after]
- [Config 2: before → after]

**Database Changes**:
- [Migration or data fix applied]

### Preventative Actions

**Immediate** (Done):
- ✅ [Action 1: e.g., Add validation for edge case]
- ✅ [Action 2: e.g., Deploy hotfix]

**Short-term** (This sprint):
- ⏳ [Action 1: e.g., Add integration test]
- ⏳ [Action 2: e.g., Update documentation]

**Long-term** (Next quarter):
- 📋 [Action 1: e.g., Implement monitoring alerts]
- 📋 [Action 2: e.g., Architectural change to prevent class of issues]

### Lessons Learned

**What Went Well**:
- [Positive aspect 1]
- [Positive aspect 2]

**What Could Be Improved**:
- [Improvement area 1]
- [Improvement area 2]

**Similar Issues to Watch For**:
- [Related pattern 1]
- [Related pattern 2]

### Metrics

- **Detection time**: [Time from incident start to detection]
- **Response time**: [Time from detection to mitigation start]
- **Resolution time**: [Time from mitigation start to full resolution]
- **MTTR**: [Mean time to recovery]
- **False alarm rate**: [If applicable]

### References

- **Related ADRs**: [Link to architecture decisions]
- **Related incidents**: [Links to similar past issues]
- **External resources**: [Documentation, stack overflow, etc.]
- **Git commits**: [Links to fixes]

---

## Example: RCA-2024-10-25: Scanner Root Directory Rejection

**Status**: 🟢 Resolved  
**Severity**: High  
**Date**: 2024-10-25  
**MTTR**: 10 minutes  

### Incident Summary
Scanner default C:/ path returns 403 Forbidden, preventing primary workflow.

### Timeline

| Time (UTC) | Event | Actor |
|------------|-------|-------|
| 14:30 | Scanner deployed with whitelist validation | Agent |
| 14:35 | User reports C:/ scan failing with 403 | User |
| 14:37 | Root cause identified: empty string rejection | Agent |
| 14:40 | Patch deployed and verified | Agent |

### Root Cause

**Primary Cause**:  
`path.relative(C:\, C:\)` returns empty string `""`, which was treated as falsy in the whitelist validation logic, causing legitimate root directory scans to be rejected.

**Contributing Factors**:
- Edge case not covered in initial security design
- No integration tests for root path scanning
- Whitelist logic assumed non-empty relative paths

**Why It Wasn't Caught Earlier**:
- Initial testing used subdirectories (e.g., `C:\Users\`) not root drives
- Security review focused on attack vectors, not legitimate use cases

### Impact Analysis

**User Impact**:
- Affected users: 100% (default C:/ path failed)
- Duration: 5 minutes (from user report to fix)
- Severity: High - primary feature completely broken

**Data Impact**:
- Data loss: ✅ None
- Data corruption: ✅ None
- Recovery needed: None

**System Impact**:
- Availability: Scanner endpoint functional but rejecting valid requests
- Performance: No degradation
- Cascade effects: None

### Fix Applied

**Code Changes**:
```diff
- return relativePath && !relativePath.startsWith('..') && !pathModule.isAbsolute(relativePath);
+ return (relativePath === '' || (!relativePath.startsWith('..') && !pathModule.isAbsolute(relativePath)));
```

### Preventative Actions

**Immediate** (Done):
- ✅ Added empty string handling for exact root matches
- ✅ Updated both scan and import endpoints
- ✅ Verified C:\, D:\, / all accepted

**Short-term** (This sprint):
- ⏳ Add integration tests for root path scanning
- ⏳ Add test coverage for edge cases (empty string, exact matches)

**Long-term** (Next quarter):
- 📋 Implement comprehensive scanner test suite
- 📋 Add monitoring for 403 rejection rates

### Lessons Learned

**What Went Well**:
- Fast detection (5 min from deploy to user report)
- Quick diagnosis (2 min to identify root cause)
- Minimal downtime (10 min MTTR)

**What Could Be Improved**:
- Edge case testing before deployment
- Integration tests for primary user workflows
- Consider default path testing in review checklist

### Metrics

- **Detection time**: 5 minutes
- **Response time**: 2 minutes  
- **Resolution time**: 3 minutes
- **MTTR**: 10 minutes

### References

- **Related ADRs**: ADR-003 (Scanner Security Model)
- **Git commits**: [Path validation fix]
