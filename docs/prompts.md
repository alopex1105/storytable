# Prompts and awareness rules

Source: section 6 of the MVP plan. `supabase/functions/_shared/awareness.ts` is the implementation of the rules below.

What runs differs from the plan text below in three ways:

- The prompts in use are in `supabase/functions/_shared/prompts.ts`. The model is called through the OpenAI Responses API with a strict JSON schema, so there is no `next_question` or `record_session` tool call.
- The interview answer has two extra fields, `ack_zh` and `ack_en`, for the one-line reply before each question.
- The note shows the helpline as 「關懷專線 0800-474-580」, because its full name contains a word the note never uses.

AI 只負責問問題和標記片段；筆記的等級和措辭由固定規則決定。門檻是 MVP 暫定，正式使用前要請神經科醫師確認。

**訪談提示詞**（`/api/interview` 的 system prompt）

```text
你是 StoryTable 的訪談者，像一個好奇、溫暖的孫子或孫女，正在聽{elder}講一張老照片的故事。
規則：
- 用台灣口語的繁體中文，一次只問一個問題，20 個字以內。
- 問題要提到照片裡看得到的東西（人、衣服、地點、桌上的菜）。
- 四題依序：1 照片裡的人（請他說出旁邊的人是誰、叫什麼名字）；2 這是哪一年、在哪裡；3 那時候家裡常煮什麼菜；4 那道菜怎麼做，從第一步講到最後。
- 永遠不提失智、記憶、測驗、對錯。他說不出來或說錯，不糾正、不追問，溫和地接下一題。
- 先用一句話回應他剛才說的內容（例如「聽起來好熱鬧」），再問下一題。
- 同時給英文翻譯 question_en。
輸出：呼叫 next_question 工具。
```

**分析提示詞**（`/api/analyze` 的 system prompt）

```text
You review a transcript, in Traditional Chinese, of an older adult telling the story behind an old family photo. Tag only moments the transcript clearly supports:
- naming: cannot name a familiar person or object (e.g. points to his wife but cannot say her name)
- word_finding: searches a long time for a common word ("那個…那個…") or stops mid-sentence
- time_place: puts a well-known event in an impossible time or place, or contradicts himself about when or where
- sequence: recipe steps out of order, a key step missing, or the same step twice
- repetition: tells the same thing or asks the same question again in this session
Rules: quote the exact words; confidence low, medium or high; do not tag accents, dialect words, ordinary pauses or hearing problems (set possible_hearing_issue instead); never diagnose and never write "dementia" or "Alzheimer's".
Also write a warm three-line story and the recipe steps exactly as told (do not correct them), in Traditional Chinese and English.
Call the record_session tool.
```

**片段類型對照十大警訊**

| type | 中文說明 | 阿茲海默症協會十大警訊 |
| --- | --- | --- |
| naming | 叫不出熟人或東西的名字 | 6：New problems with words in speaking or writing |
| word\_finding | 說到一半找不到常用字 | 6：New problems with words in speaking or writing |
| repetition | 同一件事重複講 | 6：第 6 項的說明包含 repeating themselves |
| time\_place | 把熟悉的事放錯年代或地點 | 4：Confusion with time or place |
| sequence | 食譜步驟順序錯、漏掉或重複 | 2：Challenges in planning or solving problems；3：Difficulty completing familiar tasks |

**覺察規則**（`lib/awareness.ts`，寫死在程式裡）

1. 只算 confidence 是 medium 或 high 的片段。
2. 等級 0：沒有片段。等級 1：1–2 個片段，或只有一種類型。等級 2：3 個以上片段，而且至少兩種類型。
3. `possible_hearing_issue` 為 true 時，等級最多是 1，並加一句「有些狀況可能和聽力有關，也可以帶他檢查聽力」。
4. 每份筆記都附：「這不是診斷」、四週後再聊一次、十大警訊連結、全國失智症關懷專線 0800-474-580、長照專線 1966。

**筆記措辭**（固定文字，程式只填入片段）

| 等級 | 中文 | English |
| --- | --- | --- |
| 0 | 這次聊天沒有看到特別需要留意的地方。記憶的變化要看長期，四週後再聊一張照片。 | Nothing in this conversation stood out. Memory changes show over time; talk about another photo in four weeks. |
| 1 | 這次有一兩個片段可以放在心上（如下）。偶爾想不起來很常見，重點是有沒有越來越多。四週後再聊一次，比較看看。 | One or two moments are worth keeping in mind (below). Occasional slips are common; what matters is whether they increase. Talk again in four weeks and compare. |
| 2 | 這次有幾個片段和常見的早期警訊相似（如下）。這不代表生病，但值得找時間和家庭醫師或神經內科聊聊，帶著這份紀錄去會更清楚。 | Several moments resemble common early warning signs (below). This does not mean illness, but it is worth talking with a family doctor or neurologist; bring this note along. |

**同意畫面文字**：「我們會一起看一張老照片，聽您說說當時的故事。AI 會幫忙修復照片、把故事整理成卡片，也會留意說話時的一些變化，整理成只給 {child} 看的筆記。照片和錄音都不會被保存。」按鈕：「好，我們開始」、「先不要」。

**固定備用題目**（API 失敗時用）

1. 照片裡站在您旁邊的是誰？
2. 這張照片大概是哪一年、在哪裡拍的？
3. 那時候家裡最常煮什麼菜？
4. 那道菜要怎麼做？從第一步慢慢說給我聽。
