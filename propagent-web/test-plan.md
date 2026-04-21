# Agent Loop — Persistence Test Plan

**Scope:** Prove that CRUD mutations made from the dashboard UI survive a hard page reload (simulating a closed tab / new session). Focus on pages wired in PR #6 and PR #7. Adversarial cases are designed so a broken persistence layer produces visibly different results.

**Environment:** `NEXT_PUBLIC_DEMO_MODE=true`, `npm run dev` on `http://localhost:3000`. Storage namespace: `agent loop::v1::<key>`.

**Reload method:** `Ctrl+Shift+R` (hard reload, bypasses bfcache) unless noted otherwise.

**What is NOT covered (by design):**
- Supabase round-trips (best-effort in demo mode; persistence layer is localStorage-based).
- Auth / login / redirects (demo mode bypasses).
- Visual regression on unchanged pages (rankings, rent-ai, matching, pricing).

---

## Test 1 — Tenants: add survives reload

**Path:** Sidebar → Tenants → Floating "+" button (bottom right).

**Steps:**
1. Note current tenant count on the "Tenants" header (e.g. "N total tenants").
2. Click the floating "+" button.
3. Fill: First Name = `Devin`, Last Name = `Tester`, Email = `devin.tester@agent loop.test`. Click **Add Tenant**.
4. Observe the new tenant appears in the list; header count increments to **N+1**.
5. Hard reload (`Ctrl+Shift+R`).

**Pass criteria:**
- After reload, the header count is **N+1** (not N).
- A row for "Devin Tester" / `devin.tester@agent loop.test` is visible in the table/cards.

**Adversarial fail signals:**
- Count reverts to N → persistence write didn't happen.
- Row missing → state was in-memory only.
- Count = N+2 → double-seeding or duplicated write on hydration.

---

## Test 2 — Notifications: mark-as-read state + deletion both persist

**Path:** Sidebar → Notifications.

**Steps:**
1. Record: total count, unread count (header badge or filter tabs).
2. Click **Mark all read**. Unread count should drop to **0**.
3. Delete the first notification (its trash / delete control). Total count becomes **total-1**.
4. Hard reload.

**Pass criteria:**
- After reload: unread count is still **0** (the "all read" state persisted).
- Total count is **total-1** (the deleted notification did not come back).

**Adversarial fail signals:**
- Unread count non-zero after reload → mark-as-read wasn't written to storage.
- Deleted notification reappears → delete didn't persist OR seed re-hydrated over saved state.

---

## Test 3 — Chat: user message + simulated AI reply both survive reload (the PR #7 bug)

**Path:** Sidebar → Chat. Select any conversation in the left rail.

**Steps:**
1. Note number of messages in the transcript (e.g. M).
2. Type `Persistence check 1` in the composer and press Enter / Send.
3. Wait ~2 seconds for the AI reply (there is a 1.5s setTimeout that generates an auto-reply and routes it via `updateConversation`).
4. Transcript should now contain M+2 messages (user message + AI reply).
5. Hard reload (`Ctrl+Shift+R`). Re-open the same conversation.

**Pass criteria:**
- Transcript length after reload = **M+2**.
- Both the exact user message (`Persistence check 1`) AND the AI reply are visible in order.

**Adversarial fail signals** (this is the exact bug Devin Review flagged and that was fixed):
- User message present but AI reply missing → AI handler bypassed persistence (the original bug).
- Neither message present → send handler didn't persist.
- Messages out of order or duplicated → state corruption.

---

## Test 4 — Documents: upload survives reload

**Path:** Sidebar → Documents.

**Steps:**
1. Note document count.
2. Click upload / "+ New" control and upload a small text/PDF file (or enter the required fields in the modal).
3. New row appears in the documents list.
4. Hard reload.

**Pass criteria:**
- Uploaded document still present with the same filename/title.
- Count is old+1.

**Adversarial fail signals:**
- Upload disappears after reload → uploaded doc was in-memory only.

---

## Test 5 — Syndication: API key config survives reload

**Path:** Sidebar → Syndication.

**Steps:**
1. Open the config / settings for one platform (e.g. Property24).
2. Enter an API key value, e.g. `SYNDICATION-TEST-KEY-123`. Save/close.
3. Hard reload.
4. Re-open the same platform's config.

**Pass criteria:**
- The `SYNDICATION-TEST-KEY-123` value is still populated in the field.

**Adversarial fail signals:**
- Field empty after reload → key wasn't persisted.

---

## Test 6 — Cross-page isolation (adversarial)

**Purpose:** Confirm that writing to one collection doesn't corrupt another — i.e. namespacing (`agent loop::v1::tenants`, `agent loop::v1::notifications`, etc.) is correct.

**Steps:**
1. After completing Tests 1–3, open DevTools → Application → Local Storage → `http://localhost:3000`.
2. Confirm presence of distinct keys: `agent loop::v1::tenants`, `agent loop::v1::notifications`, `agent loop::v1::conversations`, etc.
3. Spot-check the `agent loop::v1::tenants` value contains the new "Devin Tester" record and **does not** contain chat messages or notification rows.

**Pass criteria:**
- Each collection is under its own key.
- Values are valid JSON with expected shapes.

**Adversarial fail signals:**
- Single shared key for everything → collisions inevitable.
- Chat messages leaking into tenants collection → state bleed.

---

## Test 7 — Regression: dashboard pages still render

**Purpose:** Lightweight regression so we don't ship a white-screen on any tab.

**Steps:**
1. Navigate to: Dashboard, Properties, Tenants, Leads, Agents, Calendar, Documents, Maintenance, Financials, Valuations, Rankings, Chat, Syndication, Notifications, Settings.
2. Each page must render without a blank screen / unhandled exception.

**Pass criteria:**
- Every page renders main content (header + at least one section).

**Adversarial fail signals:**
- Any page throws / white-screens / shows error boundary.

---

## Recording plan

1. Maximize window (`wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`).
2. `record_start`.
3. Annotate setup → navigate to `/tenants`.
4. For each test, annotate `test_start` with "It should …" and after reload annotate `assertion` with pass/fail.
5. `record_stop` with a summary.
6. Attach recording + test-report.md to a single PR #7 comment.
