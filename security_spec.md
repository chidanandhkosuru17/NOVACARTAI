# Security Specification: NOVA CART Firestore Rules

## 1. Data Invariants

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`.
2. **PII Isolation Invariant**: User records cannot be listed or scraped by unauthorized third parties. Users can read only their own profile, or verified admins can inspect users.
3. **Simulation Record Invariant**: Any saved simulation must have `incoming().userId == request.auth.uid`. A user cannot overwrite another user's simulation.
4. **Ticket Integrity Invariant**: Created support tickets must have a valid category, priority, status, and non-empty customer name. Updates can modify status, assigned agent, and resolution notes, but cannot change the ticket's `userId`.
5. **Campaign Budget Invariant**: Campaigns cannot have negative budgets or negative discount percentages. The `userId` must match the authenticated creator.
6. **Budget Planning Invariant**: Budget plans cannot have negative allocations for any pillar. Total must respect the ₹25 Lakh boundary.
7. **Anti-Update-Gap Invariant**: All mutations must run through strict type and field validators (`isValid[Entity]`).
8. **Catch-All Default Deny**: Every unmatched collection and path rejects all read and write attempts.

## 2. The "Dirty Dozen" Payloads (Designed to Break Identity & Integrity)

1. **Spoofed User Registration**: Payload attempting to set `role: "admin"` for an unauthorized arbitrary user.
2. **Orphaned Simulation**: Simulation record missing `userId` or with a mismatched `userId != request.auth.uid`.
3. **Negative Budget Campaign**: Campaign payload with `budget: -50000` or `discountPct: 150`.
4. **Ticket Status Jump & Ghost Field**: Support ticket update attempting to inject arbitrary ghost permissions like `{ isAdmin: true, status: "Resolved" }`.
5. **Cross-Tenant Ticket Hijack**: User A attempting to update or delete a ticket created by User B.
6. **Invalid Path Variable Injection**: Request targeting `/tickets/../../root` or a document ID containing special exploit characters.
7. **Negative Pillar Allocation**: Budget allocation with `inventoryTechLakh: -10`.
8. **PII Scraping Attempt**: Unauthenticated client attempting `list` query on `/users`.
9. **Payload Size Exhaustion**: Simulation name payload containing 2MB string.
10. **Tampering with Immutable Creation Timestamps**: Updating a simulation and trying to rewrite `createdAt` to a fraudulent past date.
11. **Non-existent Ticket Category**: Setting `category: "FakeCategoryNotAllowed"`.
12. **Unauthenticated Write**: An unauthenticated user writing directly to `/simulations/sim1`.

All these payloads are blocked and strictly return `PERMISSION_DENIED`.
