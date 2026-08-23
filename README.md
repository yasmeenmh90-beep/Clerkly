# Clerkly — AI-Powered Paperwork Agent

Clerkly is an AI agent that reads, understands, and acts on everyday paperwork — documents, emails, payments, and signatures — so people spend less time on administrative busywork.

Built for the **AWS "Agents for Humans" Hackathon** (Everyday Agents track), using the **Strands Agents SDK**, **Amazon Bedrock**, and **OpenAI**.

---

## The problem

Everyday paperwork — renewals, contracts, invoices, registrations — is scattered across email, PDFs, and physical documents. People have to manually read each one, figure out what needs to happen, track deadlines, and follow through. It's tedious and easy to get wrong.

## What Clerkly does

Clerkly takes paperwork in from three sources — a direct document upload, a connected Gmail inbox, or a manually created task — and runs it through a small pipeline of AI agents that:

1. **Read and understand** the document (what it is, key dates, amounts, required actions)
2. **Decide what to do next** — some tasks can be handled automatically, others need a human to approve first
3. **Execute the action** — complete a payment via Stripe, send a document for e-signature via DocuSign, or simply mark the task done
4. **Keep a daily watch** on anything still pending, so nothing slips through a deadline

Every step is logged in an audit trail, and anything involving money or a legal signature always requires human approval before it can complete — that rule is enforced in code, not just prompted to the AI.

---

## Architecture

Clerkly runs three real agents built with the **Strands Agents SDK**:

| Agent | Job |
|---|---|
| **Document Analyzer** | Extracts title, deadline, required action, and payment/signature flags from an uploaded document or email |
| **Paperwork Planner** | Decides whether a task can auto-complete or must be routed to human approval, and records its reasoning |
| **Paperwork Watch Agent** | Runs a daily summary of pending tasks and upcoming deadlines |

**Every agent runs a three-layer AI fallback:**
1. **Amazon Bedrock (Nova Lite)** — the primary model
2. **OpenAI (GPT-4o)** — tried automatically if Bedrock is unreachable
3. **Deterministic rule-based extraction** — a last-resort safety net if neither AI provider responds

Each task records which layer actually handled it (`analysis_source` / `plan_source`: `"strands"`, `"openai_fallback"`, or `"deterministic_fallback"`), so it's always clear whether a result came from real AI or the fallback logic.

**Safety by design, not by prompt:** a hardcoded check in the execution layer blocks any task requiring payment or signature from completing without explicit human approval first, regardless of what any agent — or which AI provider — decides. This can't be bypassed by a prompt or a model output.

### Diagrams

#### Backend architecture

![Clerkly backend architecture](./clerkly-backend-architecture.png)

This diagram breaks down the backend into its nine functional layers: API entry and routing, security and user ownership, the intake pipeline, the AI analysis layer, task workflow and execution, the service layer, the data and persistence layer, audit and observability, and configuration. It shows exactly which FastAPI routers exist, which services back them, how the three AI agents fit together with their fallback chain, how the SQLite schema is structured (Users, Tasks, and Task Events tables and their relationships), and what's actually verified in the test suite. This is the right diagram for understanding how the backend itself is organized internally.

#### Full system architecture

![Clerkly full system architecture](./clerkly-full-system-architecture.png)

This diagram zooms out to show the whole system — not just the backend, but how the Next.js frontend, the FastAPI backend, and every external service actually talk to each other. It distinguishes three different kinds of connections: normal REST API calls from the frontend (JWT-authenticated), OAuth browser redirects for Gmail and DocuSign (where the user's browser is sent to Google or DocuSign directly, not through an API call), and webhooks (where Stripe and DocuSign call the backend directly, completely bypassing the frontend). The key insight this diagram makes visible: payment and signature confirmation never route through the frontend at all — the frontend only learns about a status change the next time it polls `/tasks`.

#### Task workflow

![Clerkly task workflow](./clerkly-workflow.png)

This diagram traces the actual path a single piece of paperwork takes, from the moment it enters the system to the moment it's marked complete. It shows the three intake sources converging, the Document Analyzer extracting fields, the Paperwork Planner deciding whether a task can auto-complete or needs human approval, the hardcoded safety override that prevents any payment- or signature-requiring task from skipping approval, the human review step, and the three different execution paths depending on what a task actually needs (payment, signature, or neither). It also shows the Paperwork Watch Agent running in parallel on its own schedule, independent of this main flow, since it only reports on pending tasks rather than changing their status.

---

## Tech stack

**Backend:** FastAPI · SQLAlchemy · SQLite · Alembic · JWT auth (pwdlib/Argon2) · Strands Agents SDK · Amazon Bedrock · OpenAI

**Integrations:** Stripe (payments) · DocuSign eSignature (sandbox, real signing flow) · Gmail API (OAuth, email intake)

**Frontend:** Next.js · Tailwind CSS · Framer Motion

---

## Getting started — backend setup, step by step

### 1. Clone the repo and enter the backend folder
```bash
git clone https://github.com/yasmeenmh90-beep/Clerkly.git
cd Clerkly/backend
```

### 2. Create and activate a virtual environment
```bash
python3 -m venv ../venv
source ../venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```
You'll need:
- `JWT_SECRET_KEY` — any long random string
- `OPENAI_API_KEY` — for the second-layer AI fallback (platform.openai.com)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` — for Gmail intake (Google Cloud Console)
- `DOCUSIGN_INTEGRATION_KEY` / `DOCUSIGN_SECRET_KEY` / `DOCUSIGN_ACCOUNT_ID` / `DOCUSIGN_REDIRECT_URI` — for signature intake (DocuSign developer sandbox)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — for payments (Stripe dashboard, test mode)
- AWS credentials configured locally for Bedrock access (`aws configure` or SSO)

`OPENAI_API_KEY` is optional — if it's not set, agents skip straight from Bedrock to the deterministic fallback.

### 5. Run database migrations
```bash
alembic upgrade head
```
This creates the SQLite database and applies every schema migration (users, tasks, OAuth token fields, payment tracking, signature tracking, AI source tracking).

### 6. Start the backend server
```bash
uvicorn app.main:app --reload
```
The API is now running at `http://127.0.0.1:8000`. Interactive docs are available at `http://127.0.0.1:8000/docs`.

### 7. (Optional) Forward webhooks for local testing
Stripe and DocuSign both need a public URL to send webhook events to your local machine:
```bash
# Stripe
stripe listen --forward-to localhost:8000/payments/webhook

# DocuSign (via ngrok, then register the URL in DocuSign's Connect settings)
ngrok http 8000
```

### 8. Run the test suite
```bash
pytest
```

---

## Running the frontend
```bash
cd ../frontend
npm install
npm run dev
```
The app runs at `http://localhost:3000`.

---

## What's actually working (tested end to end)

- Account registration and login (JWT)
- Manual task creation, approval, rejection, and execution
- Document upload → task creation, with real AI analysis via OpenAI fallback while Bedrock is blocked (see below)
- Gmail connection and inbox sync into tasks
- Stripe payments — real Checkout session, real webhook, task auto-completes on payment
- DocuSign signatures — real OAuth connection, real envelope creation and email delivery, real signing, real webhook confirmation, task auto-completes on signature
- Full audit trail of every task event, including which AI layer handled each analysis

## Known limitations

**Amazon Bedrock is currently blocked at the account level** (`ValidationException: Operation not allowed`) — this affects both the Bedrock Playground and API calls, and is not something fixable in code. An AWS Support case is open and escalated. As a result, every agent currently falls through to its **OpenAI layer**, which handles document analysis and planning with real AI — Bedrock is the intended primary provider and works identically once AWS restores access. The deterministic rule-based layer only activates if both AI providers are unavailable. The rest of the system — task management, approvals, payments, and signatures — is unaffected and fully functional.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

## Team

Built by Yasmeen Azmat Ali (backend) and Pruthviraj (frontend/UI) for the AWS "Agents for Humans" Hackathon.
