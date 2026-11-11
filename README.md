Built at c0mpiled-18 on 2026-11-11, from 18:45.

# StoryTable 膳心人事

A mobile-first web app for YC's "AI for the Aging Population" request. An adult child and an older parent look at an old family photo together. The app restores the photo, asks four warm questions by voice in Taiwanese Mandarin, and produces a story card for the family and a private Awareness Note for the child. The note maps moments in the conversation to the Alzheimer's Association's 10 warning signs using fixed wording. It never diagnoses.

## Run it

```bash
npm install
npm run dev
npm test
```

Environment variables (server only): `ANTHROPIC_API_KEY`, `GMI_API_KEY`, `MODEL` (default `claude-sonnet-5-5`).

After deploying, open `/api/health`. It reports whether Claude and GMI Cloud answer; it never returns a key.

## How it works

- `/api/restore` sends the photo to GMI Cloud (`bria-fibo-restore`) and returns the result as a data URL. If that fails or takes over 35 seconds, the app carries on with the original photo.
- `/api/interview` asks Claude for the next question about the photo. The server decides which of the four topics comes next; if Claude is unavailable, a fixed question is used.
- `/api/analyze` asks Claude to record moments, a three-line story and the recipe as told. Quotes that do not appear in the transcript are dropped. `lib/awareness.ts` then sets the note's level and wording with fixed rules.
- Voice uses the browser's built-in zh-TW speech synthesis and recognition; typing always works.

The interface follows the ui-de-ai rules: grayscale chrome (Radix sand) with colour left to the photos, four type sizes, one hairline token, nested radii on a 4px grid.

## Privacy

No database, no login, no analytics. Photos and transcripts live in browser memory and are gone on refresh. Everyone in the demo is fictional, and the demo photo is an illustration.

## Sources

- Alzheimer's Association, 10 Early Signs and Symptoms of Alzheimer's: https://www.alz.org/alzheimers-dementia/10_signs
- YC Requests for Startups, Fall 2026: https://www.ycombinator.com/rfs
