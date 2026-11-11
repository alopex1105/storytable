@AGENTS.md

# StoryTable rules

1. Models only ask questions and tag moments; the note's level and wording come from `lib/awareness.ts`.
2. No database, no login, no analytics; photos and transcripts are never stored; fictional people only.
3. Mobile first (390 px), body text at least 20 px, one question per screen, Traditional Chinese UI with English under it.
4. Never show the older adult the words 失智, 測驗, 診斷 or 答錯.
5. Commit after each working step; never commit secrets.

Prompts and the fixed note wording live in `docs/prompts.md`. Run `npm test` before committing.
