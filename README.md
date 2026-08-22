# Clerkly — AI-Powered Paperwork Agent

Clerkly is an AI agent that reads, understands, and acts on everyday paperwork — documents, emails, payments, and signatures — so people spend less time on administrative busywork.

Built for the **AWS "Agents for Humans" Hackathon** (Everyday Agents track), using the **Strands Agents SDK** and **Amazon Bedrock**.

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

Clerkly runs three real agents built with the **Strands Agents SDK**, backed by **Amazon Bedrock (Nova Lite)**:

| Agent | Job |
|---|---|
| **Document Analyzer** | Extracts title, deadline, required action, and payment/signature flags from an uploaded document or email |
| **Paperwork Planner** | Decides whether a task can auto-complete or must be routed to human approval, and records its reasoning |
| **Paperwork Watch Agent** | Runs a daily summary of pending tasks and upcoming deadlines |

**Every agent has a deterministic fallback.** If Bedrock is unreachable, each agent still returns a safe, rule-based result instead of failing — the app keeps working even when the AI backend is down. (See "Known limitations" below — this fallback is active in the current submission because of an AWS-side account restriction, not a bug in the agents.)

**Safety by design, not by prompt:** a hardcoded check in the execution layer blocks any task requiring payment or signature from completing without explicit human approval first, regardless of what any agent decides. This can't be bypassed by a prompt or a model output.

---

## Tech stack

**Backend:** FastAPI · SQLAlchemy · SQLite · Alembic · JWT auth (pwdlib/Argon2) · Strands Agents SDK · Amazon Bedrock

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
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` — for Gmail intake (Google Cloud Console)
- `DOCUSIGN_INTEGRATION_KEY` / `DOCUSIGN_SECRET_KEY` / `DOCUSIGN_ACCOUNT_ID` / `DOCUSIGN_REDIRECT_URI` — for signature intake (DocuSign developer sandbox)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — for payments (Stripe dashboard, test mode)
- AWS credentials configured locally for Bedrock access (`aws configure` or SSO)

### 5. Run database migrations
```bash
alembic upgrade head
```
This creates the SQLite database and applies every schema migration (users, tasks, OAuth token fields, payment tracking, signature tracking).

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
- Document upload → task creation (via deterministic fallback while Bedrock is blocked, see below)
- Gmail connection and inbox sync into tasks
- Stripe payments — real Checkout session, real webhook, task auto-completes on payment
- DocuSign signatures — real OAuth connection, real envelope creation and email delivery, real signing, real webhook confirmation, task auto-completes on signature
- Full audit trail of every task event

## Known limitations

**Amazon Bedrock is currently blocked at the account level** (`ValidationException: Operation not allowed`) — this affects both the Bedrock Playground and API calls, and is not something fixable in code. An AWS Support case is open and escalated. Every agent's deterministic fallback is active as a result, so document/email analysis returns rule-based results instead of full AI extraction until access is restored. The rest of the system — task management, approvals, payments, and signatures — is unaffected and fully functional.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

## Team

Built by Yasmeen Azmat Ali (backend) and Pruthviraj (frontend/UI) for the AWS "Agents for Humans" Hackathon.
