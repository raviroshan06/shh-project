# MAHASETU — Maharashtra Unified Government Digital Services & Interoperability Platform

**SIH 2026 • Problem Statement ID 26129 • Government of Maharashtra (MSInS)**

MAHASETU (महासेतु — "the great bridge") is a working prototype of a consent-driven
interoperability layer that connects five disconnected Maharashtra government department
systems, resolves one citizen identity across all of them, and lets a citizen apply for a
cross-department scheme with **zero manual data re-entry**.

> All citizens, records and department responses in this repository are **fictional demo data**.
> Department integrations are **mock adapters** that deliberately mimic real-world schema divergence.

---

## 1. The problem this prototype solves

| Real-world pain | How MAHASETU addresses it |
| --- | --- |
| Same citizen stored differently in every department (`citizenName`, `full_name`, `owner_name`, `name`) | Adapter layer + canonical target model normalizes every record |
| Citizens re-submit the same certificates to every department | Gateway assembles a Unified Profile and auto-fills applications |
| No visibility into who accessed citizen data | Append-only audit ledger with trace IDs + citizen-facing access history |
| Departments share data without lawful basis | Purpose-bound, scope-limited, expiring, revocable consent records (DPDP-aligned) |
| Two registries disagree — no one notices | Deterministic identity matching engine flags discrepancies for desk-officer adjudication |

---

## 2. Architecture

```
client/  (React 18 + Vite + Tailwind + lucide-react)
   └── Citizen portal  +  Desk Officer console
backend/ (Node.js + Express 5 + better-sqlite3 + JWT)
   ├── config/       database.js (schema)  •  seed.js (demo fixtures)
   ├── mock-data/    departmentsData.js (5 registries, divergent field names)
   ├── services/
   │     ├── departments/  baseAdapter + 5 adapters + raw mock services
   │     ├── gateway/      gatewayService.js  → getUnifiedProfile()
   │     ├── identity/     identityMatcherService + stringSimilarity (Levenshtein)
   │     ├── consent/      consentService  (verify / create / revoke)
   │     └── audit/        auditService    (immutable ledger)
   ├── middleware/   authMiddleware (JWT + role)  •  consentMiddleware (scope enforcement)
   └── routes/       auth • citizen • departments • consent • identity • services • audit • health
e2e-test.js  26-assertion end-to-end smoke test (mirrors every client call)
```

**Connected mock systems:** `AAPLE_SARKAR` · `MAHADBT` · `MAHABHULEKH` · `EPANCHAYAT` · `MAITRI`

---

## 3. Run it

```powershell
# One-time install (backend deps live at the repo root, client deps in client/)
npm install
npm --prefix client install

# Terminal 1 — backend (http://localhost:5001)
npm run server

# Terminal 2 — frontend (http://localhost:5173, proxies /api -> :5001)
npm run client
```

Then open **http://localhost:5173**.
`npm test` (with the server running) executes the full end-to-end smoke test.
`npm run build` produces a production client bundle in `client/dist`.

---

## 4. Demo credentials

| Role | Login | OTP |
| --- | --- | --- |
| Citizen (Ravi Kumar — name mismatch) | `9876543210` | `123456` |
| Desk Officer (Rajendra Deshmukh) | Officer tab → `OFFICER-PUNE-01` | `123456` |

The dark bar at the top of the app is the **demo switcher** — one click swaps the persona.

| Persona | Mobile | Demonstration scenario |
| --- | --- | --- |
| Ravi Kumar | 9876543210 | Name abbreviation mismatch (Aaple Sarkar vs MahaDBT) |
| Anita Patil | 9822012345 | Residential address divergence |
| Suresh Jadhav | 9423198765 | Missing record in MahaDBT registry |
| Priya Deshmukh | 9158098765 | All five registries consistent |
| Amit Shinde | 9765432109 | Multiple severe mismatches |

---

## 5. Seven-minute demo script (judge-facing)

1. **Landing → Sign in** as `9876543210` with OTP `123456`.
2. **Dashboard** — 5/5 adapters live, consistency card shows a flagged name discrepancy.
3. **Unified Profile** — the provenance table is the centrepiece: the same human appears as
   `citizenName`, `full_name`, `owner_name`, `name`, `applicant_name`, then resolves to one
   canonical record. The amber banner lists each deterministic mismatch with a similarity score.
4. **Consent Manager** — grant a new purpose-bound consent (pick department + scopes + validity),
   then **Revoke** it. Every action is written to the audit ledger.
5. **Gov Services** — click **Apply (Verified Data)** on the hostel-allowance scheme. The success
   receipt shows which registries supplied the data.
6. **Applications** — expand *View Reused Data* to show the immutable evidence snapshot
   (name, DOB, mobile, address + list of source systems).
7. **Alerts / Audit History** — citizen sees exactly who touched their record and when.
8. **Switch to Desk Officer** (top bar) — the Officer Console shows platform telemetry, the
   discrepancy queue, and **Verify Same Person / Initiate Correction / Mark Reviewed** actions.
   Adjudicate a record, then switch back to the citizen: the finding now carries an
   *Officer: VERIFIED MATCH* badge. Officer decisions are sticky across matcher re-runs.
9. **Switch persona** to Suresh Jadhav (`9423198765`) — the gateway degrades gracefully when a
   department has no record: the profile is marked `partial` and MahaDBT shows *NOT LINKED*
   instead of failing the whole request.

---

## 6. API surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` · `/api/auth/verify-otp` | Demo OTP login, issues JWT (8 h) |
| GET | `/api/citizen/profile` | Gateway aggregation + identity matching |
| GET | `/api/citizen/personas` | Demo persona list |
| GET | `/api/departments/{aaple-sarkar\|mahadbt\|mahabhulekh\|epanchayat\|maitri}/...` | Raw departmental pulls — **blocked unless consent covers the scopes** |
| GET | `/api/consent/:citizenId` | Consent ledger for a citizen |
| POST | `/api/consent/create` | Grant purpose-bound consent |
| DELETE | `/api/consent/:consentId` | Revoke consent (immediate effect) |
| GET | `/api/services` | Cross-department scheme catalogue |
| POST | `/api/services/apply` | One-click filing with auto-filled verified data |
| GET | `/api/services/applications` | Citizen sees own, officer sees all |
| GET | `/api/identity/mismatches` | Discrepancy review queue |
| POST | `/api/identity/mismatches/:id/action` | VERIFY / INITIATE_CORRECTION / REVIEW (officer only) |
| GET | `/api/audit/logs` | Citizen-scoped or state-wide audit ledger |
| GET | `/api/health` | Adapter health + platform telemetry |

---

## 7. Verification performed

`npm test` → **28/28 passed** on a freshly seeded database, covering:
demo persona listing, login/JWT with unknown-identifier fallback, 5-adapter aggregation,
normalized canonical model, mismatch detection, consent grant + revoke, consent enforcement
(403 without authorization), one-click application with multi-source evidence snapshot,
citizen-scoped audit ledger, health telemetry, officer adjudication persistence, and officer
access to all applications.

`npm run build` → clean production build (1,657 modules, no warnings).

On every boot the backend also runs a **simulated nightly reconciliation sweep**: all five personas
are pushed through the gateway aggregator (`SYSTEM_GATEWAY` actor), which primes the officer
discrepancy queue (25 findings across the demo personas) and the audit ledger before anyone logs in.

---

## 8. Known limitations (prototype scope)

* Department adapters read from in-process mock datasets — no real department APIs are called.
* Consent enforcement applies to the raw department endpoints; the gateway aggregation itself is
  authorized as self-service for the authenticated citizen.
* Identity matching is deterministic (Levenshtein + token/initial logic) with no probabilistic
  model, no Aadhaar/UIDAI linkage and no fuzzy ML scorer.
* Audit records are append-only inside SQLite, but there is no cryptographic hash chain or
  external WORM store, and officer notes are stored as free text.
* The officer console is single-desk (no maker–checker or departmental RBAC beyond role = officer).
* Because `seedDatabase()` re-runs on every backend boot with `INSERT OR REPLACE`, the demo
  fixtures (citizens, departments, services, consents) are reset on restart. Applications and
  audit logs accumulate — delete `backend/mahsetu.db*` for a pristine demo state.

