Built at c0mpiled-18 on 2026-11-11, from 18:45.

# StoryTable 膳心人事

A mobile-first web app for YC's "AI for the Aging Population" request. An adult child and an older parent look at an old family photo together. The app restores the photo, asks four warm questions by voice in Taiwanese Mandarin, and produces a story card for the family and a private Awareness Note for the child. The note maps moments in the conversation to the Alzheimer's Association's 10 warning signs using fixed wording. It never diagnoses.

## Run it

The project is hosted on Lovable (Vite, React, Tailwind). Locally:

```bash
npm install
npm run dev
```

## How it works

- The whole flow is one screen that steps through consent, photo, talk, story card and note (`src/pages/Index.tsx`, `src/components/storytable/`).
- The backend is four Supabase Edge Functions on Lovable Cloud (`supabase/functions/`). They hold the API keys; the browser never sees them.
  - `restore` sends the photo to GMI Cloud (`bria-fibo-restore`) and returns the result. If that fails or takes over 35 seconds, the app carries on with the original photo.
  - `interview` asks an OpenAI model for the next question about the photo. The server decides which of the four topics comes next; if the model is unavailable, a fixed question is used.
  - `analyze` asks the model to record moments, a three-line story and the recipe as told. Quotes that do not appear in the transcript are dropped. `_shared/awareness.ts` then sets the note's level and wording with fixed rules.
  - `health` reports whether OpenAI and GMI Cloud answer. It never returns a key.
  - `coach` plays the parent so the family member can rehearse suggesting a check-up. After four turns it gives three opening lines; if the model is unavailable, fixed lines are shown (`skills/coach.md`).
- The private note links to a doctor summary: one printable A4 page built in the browser from the note plus what the family types in. No model call, nothing stored.
- Secrets (set in Lovable Cloud): `OPENAI_API_KEY`, `GMI_API_KEY`, and optionally `OPENAI_MODEL` and `OPENAI_MODEL_FAST`.
- Voice uses the browser's built-in zh-TW speech synthesis and recognition. The microphone keeps listening across pauses until it is tapped again; typing always works.
- The story card can be saved or shared as one image, drawn in the browser (`src/lib/card.ts`).

The interface follows the ui-de-ai rules: grayscale chrome (Radix sand) with colour left to the photos, four type sizes, one hairline token, nested radii on a 4px grid.

Rule tests: `npx vitest run tests`.

## What's next

StoryTable is the first probe of an awareness layer: notice change in everyday life, hand it to the right person, and make the next step doable. Built tonight: the photo conversation, the private note, the doctor summary (F2) and the conversation coach (F1). Planned, in order:

- F3 Family observations and timeline: six questions for the warning signs one chat cannot show (1, 5, 7, 8, 9, 10). Questions need a neurologist's review first.
- F4 Trend against oneself: a chat every four weeks, comparing with the last three. Needs accounts, encrypted storage and the older adult's own consent.
- F6 Medicine signals: missed or doubled doses, with pharmacies.
- F5 Money and scam guard: needs a bank partner.
- F7 Risk-factor coaching: the 14 modifiable risk factors, with hearing checks and referral.

StoryTable stays an awareness and communication tool. It does not screen or diagnose.

## Privacy

No accounts, no analytics, nothing stored. Photos and transcripts live in browser memory and are gone on refresh. Everyone in the demo is fictional, and the demo photo is an illustration.

## Sources

- Alzheimer's Association, 10 Early Signs and Symptoms of Alzheimer's: https://www.alz.org/alzheimers-dementia/10_signs
- YC Requests for Startups, Fall 2026: https://www.ycombinator.com/rfs
