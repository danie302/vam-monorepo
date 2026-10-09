# VAM · Virtual Assistant Manager

A personal virtual assistant: a chat with an LLM (OpenAI) that streams its
answers, remembers each conversation, and keeps your conversation history.

This repo is also my **LLM engineering sandbox**: I use it to try out and
integrate concepts as I learn them (prompting, tools, memory, RAG, evals,
etc.), one at a time, rather than to ship a finished product. See the
[roadmap](#roadmap) for what is done and what comes next.

## Features

- **Accounts**: sign up, sign in and sign out, with cookie sessions.
- **Chat with an LLM**: answers stream in live (Server-Sent Events) and
  render as Markdown. You can stop an answer midway.
- **Conversations**: each user has several. A sidebar lists them by last
  activity; you can start new ones and delete old ones. The first message
  names a conversation.
- **Memory**: every new message sends the conversation's history to the model
  (its most recent ~32k characters).
- **Configurable behavior**: the assistant's system instructions come from
  `CHAT_INSTRUCTIONS` in the backend's `.env`. Without it, the assistant is a
  generic helpful one.
- **Model picker**: the user picks one of the models allowed by
  `CHAT_MODELS`. The API rejects any model outside that list.
- **Light and dark themes** in the brand's blue and red. The layout works on
  phones too.

## Tech stack

| Part | Tech |
| --- | --- |
| Frontend (`vam-ui/`) | Next.js 16 (App Router), React 19, Material UI 9, react-markdown |
| Backend (`vam/`) | NestJS 12, `@nestjs/authentication` (cookie sessions), zod |
| Database | SQLite through Sequelize (`sequelize-typescript`) |
| LLM | OpenAI Responses API (`openai` SDK), streamed |
| Tests | Vitest (unit and e2e with Supertest), contract specs for repositories |

Both apps follow the same **clean architecture**, organized by feature:

```
src/<feature>/
  domain/          entities, rules, repository ports (no framework code)
  application/     use cases and ports for external services
  infrastructure/  adapters: database, OpenAI, HTTP, in-memory fakes
  presentation/    HTTP controllers (backend) or React components (frontend)
```

The domain and application layers never import the framework, the ORM or
the OpenAI SDK, so an adapter can change without touching the rules. In the
frontend, `src/container.ts` is the only place that picks adapters.

## Getting started

### Requirements

- **Node.js 22 or newer** (the OpenAI SDK requires it) and npm.
- An **OpenAI API key**, unless you only want to try the UI (see
  [Without an OpenAI key](#without-an-openai-key)).
- Chrome or Firefox for local development. The session cookie is `Secure`,
  and Safari may refuse it on `http://localhost`.

### 1. Backend (API on port 3000)

```bash
cd vam
npm install
cp .env.example .env    # then set OPENAI_API_KEY in .env
npm run start:dev
```

The API refuses to start without `OPENAI_API_KEY` and says so. The SQLite
database is created at `vam/.db/data.sqlite3` on first start.

### 2. Frontend (web app on port 3001)

In another terminal:

```bash
cd vam-ui
npm install
npm run dev
```

Open <http://localhost:3001>, create an account and start chatting.

The defaults already match: the web app calls the API at
`http://localhost:3000`, and the API trusts `http://localhost:3001`. To
change them, copy `vam-ui/.env.example` to `vam-ui/.env.local` (frontend)
or set `WEB_ORIGINS` (backend).

### Without an OpenAI key

To work on the UI only, the frontend can run without the backend:

```bash
cd vam-ui
NEXT_PUBLIC_AUTH_ADAPTER=memory NEXT_PUBLIC_CHAT_ADAPTER=placeholder npm run dev
```

Accounts and conversations then live in the browser tab, and are lost on
reload. A placeholder streams a canned answer instead of the LLM.

## Configuration

### Backend: `vam/.env`

| Variable | Default | What it does |
| --- | --- | --- |
| `OPENAI_API_KEY` | (required) | Key for the OpenAI API. |
| `CHAT_INSTRUCTIONS` | a helpful-assistant prompt | System instructions that orient and limit the assistant. Use double quotes for several lines. |
| `CHAT_MODELS` | `gpt-5.4-mini,gpt-5.4-nano,gpt-5.4` | Models the chat may use, comma separated. The first one is the default. |
| `WEB_ORIGINS` | `http://localhost:3001` (nothing in production) | Web app origins allowed to call the API with the session cookie. |
| `DB_STORAGE` | `.db/data.sqlite3` | SQLite file. |
| `PORT` | `3000` | API port. |
| `OPENAI_BASE_URL` | OpenAI | Sends OpenAI requests elsewhere, e.g. a local mock. |

For example, to make it a cooking assistant:

```bash
CHAT_INSTRUCTIONS="You are VAM, a cooking assistant.
Only answer questions about cooking and recipes; politely decline anything else."
```

`.env` is loaded at startup, and real environment variables take precedence
over it. Restart the API after changing it.

### Frontend: `vam-ui/.env.local`

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Base URL of the API. |
| `NEXT_PUBLIC_AUTH_ADAPTER` | `http` | `memory` keeps accounts in the tab (no backend needed). |
| `NEXT_PUBLIC_CHAT_ADAPTER` | `http` | `placeholder` answers with a canned, streamed text (no API or OpenAI key needed). |

`NEXT_PUBLIC_*` values are fixed when the dev server starts: restart
`npm run dev` after changing them.

## Development

| Command | `vam/` (backend) | `vam-ui/` (frontend) |
| --- | --- | --- |
| Dev server | `npm run start:dev` | `npm run dev` |
| Unit tests | `npm test` | `npm test` |
| E2E tests | `npm run test:e2e` (in-memory SQLite, fake LLM) | — |
| Lint | `npm run lint` (oxlint) | `npm run lint` (eslint) |
| Production build | `npm run build`, then `npm run start:prod` | `npm run build`, then `npm start` |

There are no migrations yet: missing tables are created at startup, but
existing ones are never altered. After changing a model, delete
`vam/.db/data.sqlite3`.

[`CLAUDE.md`](CLAUDE.md) has the detailed architecture notes and
conventions.

## API

Every route except sign up and sign in needs a session cookie.

| Method | Route | What it does |
| --- | --- | --- |
| `POST` | `/auth/sign-up`, `/auth/sign-in` | Creates the account / checks the password, and starts a session. |
| `POST` | `/auth/sign-out` | Ends the session. |
| `GET` | `/auth/me` | The signed-in user. |
| `GET` | `/chat/models` | The allowed models and the default one. |
| `GET` | `/conversations` | The user's conversations, most recently active first. |
| `POST` | `/conversations` | Starts an empty conversation. |
| `GET` | `/conversations/:id` | A conversation with its messages. |
| `DELETE` | `/conversations/:id` | Deletes a conversation and its messages. |
| `POST` | `/conversations/:id/messages` | Body `{ message, model? }`. Saves the message and streams the answer as Server-Sent Events: `conversation`, then `delta { text }`…, then `done` or `error { message }`. |

Another user's conversation answers 404, the same as a missing one.

## Roadmap

Small things to add one at a time as a learning exercise, roughly in order
of difficulty:

- [x] Basic LLM API call (prompt → response)
- [x] Streaming the response (live tokens in the UI)
- [ ] Configurable system prompt / prompt templates (system prompt done via
      `CHAT_INSTRUCTIONS`; templates pending)
- [ ] Function calling / tool use (e.g. a "create reminder" tool)
- [x] Conversation memory (per-conversation history, stored in SQLite)
- [ ] Persistent user data memory (facts about the user, in SQLite)
- [ ] Simple RAG: embeddings + search over personal notes
- [ ] Error handling and retries for LLM API failures
- [ ] Logging/observability for prompts and responses
- [ ] Basic evals (test cases to measure response quality)
- [ ] Simple guardrails (filtering problematic input/output)
- [ ] Multi-model support (easily switch provider/model; models of one
      provider can be picked already)
- [ ] Multi-step agent (plan → run tools → respond)
