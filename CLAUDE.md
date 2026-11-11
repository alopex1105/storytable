# StoryTable rules

This project is hosted on Lovable (Vite, React, Tailwind 3, shadcn/ui). Keep that stack: do not replace the scaffold or change the build setup.

1. Models only ask questions and tag moments; the note's level and wording come from `src/lib/awareness.ts`.
2. No database tables, no login, no analytics; photos and transcripts are never stored; fictional people only.
3. Mobile first (390 px), body text at least 20 px, one question per screen, Traditional Chinese UI with English under it.
4. Never show the older adult the words 失智, 測驗, 診斷 or 答錯.
5. Commit after each working step; never commit secrets. Never force-push `main`: Lovable syncs from it.

UI follows the ui-de-ai rules: grayscale chrome, colour left to photos, four type sizes (`text-sm/base/lg/xl`), one hairline token, nested radii on a 4px grid. Prompts and the fixed note wording live in `docs/prompts.md`.
