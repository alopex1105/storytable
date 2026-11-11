# Conversation coach

For the pharmacist to review. The running prompt and the fixed lines are in `supabase/functions/_shared/coach.ts`; keep the two in step.

## What it does

After reading the private note, the family member can rehearse how to suggest a check-up. The model plays the parent for four turns, reacting in one of three ways. Then the app shows three opening lines the family member can use.

## Reactions

| Key | 中文 | English | How the parent behaves |
| --- | --- | --- | --- |
| `denies` | 覺得自己沒事 | Says nothing is wrong | Brushes it off: 「我好得很」「人老了都這樣」 |
| `worries` | 會擔心、會害怕 | Gets worried | Anxious about what a doctor might say |
| `annoyed` | 會不耐煩 | Gets annoyed | Irritated at being fussed over, changes the subject |

## Rules the model is given

- Stay kind underneath, whatever the reaction. Never insult, mock or shout.
- Never use or accept medical labels, and never name a disease.
- React to what the family member actually said: soften when they are gentle, specific, or suggest going together; push back when they label, lecture or pressure.
- By the last turn, lean toward agreeing to a health check-up together.
- On the last turn, give exactly three opening lines in the family member's voice: warm, concrete, no labels, no blame, steering toward a check-up together.

## What the code enforces

- Only the kinds of moments from the note are sent to the model, never the person's own words.
- A reply or opening line containing 失智, 癡呆, 阿茲海默, 診斷, "dementia", "Alzheimer" or "diagnos…" is dropped.
- If the model is unavailable, or fewer than three opening lines survive, these fixed lines are shown instead:
  1. 我最近想去做個健康檢查，我們一起去好不好？
  2. 上次聽您講老照片的故事好開心。我想多陪您，也想一起去給醫師看看，比較安心。
  3. 不是您怎麼了，是我們年紀都到了，定期檢查一下，我陪您去。
- Nothing from the rehearsal is stored.
