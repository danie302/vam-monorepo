# Virtual Assistant

Personal virtual assistant that uses an LLM to answer questions, connect to
external tools, and support the user.

This repo is also my **LLM engineering sandbox**: I use it to try out and
integrate concepts as I learn them (prompting, tools, memory, RAG, evals,
etc.), rather than to ship a finished product.

## Status

Just started, no code yet. The stack and features below are the initial
plan, not what's already built.

## Initial scope

Keeping the first version small on purpose: a simple chat with an LLM,
nothing else.

- basic chat UI
- send a message, get a response from the LLM
- user authentication (sign up / log in)
- no memory, tools, or other persistence yet (those come later, see roadmap)

## Tech stack

- UI in React with Next.js
- Backend with NestJS
- Local database with SQLite (added once persistence is needed)

## Ideas to add later (learning roadmap)

Small things to add one at a time as a learning exercise, roughly in order
of difficulty:

- [ ] Basic LLM API call (prompt → response)
- [ ] Streaming the response (live tokens in the UI)
- [ ] Configurable system prompt / prompt templates
- [ ] Function calling / tool use (e.g. a "create reminder" tool)
- [ ] Conversation memory (per-session history)
- [ ] Persistent user data memory (in SQLite)
- [ ] Simple RAG: embeddings + search over personal notes
- [ ] Error handling and retries for LLM API failures
- [ ] Logging/observability for prompts and responses
- [ ] Basic evals (test cases to measure response quality)
- [ ] Simple guardrails (filtering problematic input/output)
- [ ] Multi-model support (easily switch provider/model)
- [ ] Multi-step agent (plan → run tools → respond)
