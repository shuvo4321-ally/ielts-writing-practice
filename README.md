# IELTS Writing Workbench

An interactive practice page for **IELTS Academic Writing**: **20 Task 1 reports and 20 Task 2 essays**. Every task has its own data or topic, its own exercises and its own band 9 model answer, so there is real material to prepare from, not one task copied twenty times.

**Open it:** https://shuvo4321-ally.github.io/ielts-writing-practice/

## What's inside

### Task 1: 20 different reports

| Type | Tasks | What they practise |
|---|---|---|
| Line graphs | 3 | growth, a seasonal pattern, lines that overtake each other |
| Bar charts | 3 | two groups compared, change over time, six cities compared |
| Pie charts | 3 | two years, a three-chart projection, two places |
| Tables | 3 | patterns across age groups, numbers and shares, costs |
| Mixed visuals | 2 | line graph + table, pie chart + bar chart |
| Maps | 3 | a village that grows, a town centre redeveloped, an island turned into a resort |
| Processes | 3 | a manufacturing flow, a life cycle, how a power station works |

The charts, maps and diagrams are drawn by the page from each task's own data, with the exact figures available under each chart.

### Task 2: 20 different essays

| Question type | Tasks | Topics |
|---|---|---|
| Opinion (agree / disagree) | 5 | university subjects, working from home, protecting the environment, junk-food adverts, prison |
| Discussion + your opinion | 4 | homework, news media, roads or public transport, salary or satisfaction |
| Advantages and disadvantages | 3 | tourism, studying abroad, a cashless society |
| Problems and solutions | 3 | housing costs, loneliness in cities, disappearing languages |
| Two-part question | 3 | an ageing population, sharing personal data online, public money for sport |
| Positive or negative development | 2 | English as a global language, machines replacing jobs |

Each essay comes with an **idea bank** (ideas with examples, grouped by side) and **topic vocabulary**.

### The seven steps of every task

Each step asks you to answer in a different way.

| Step | Task 1 | Task 2 |
|---|---|---|
| 1 | **Language**: plan, vocabulary and the exact data | **Ideas**: structure for the essay type, idea bank, vocabulary |
| 2 | **Read the data**: choose the 3 key features out of 7 | **Decode**: tap the task words in the question and name the essay type |
| 3 | **Overview**: choose the 2 real overview sentences out of 6 | **Plan**: choose the best thesis, then match ideas to examples |
| 4 | **Group**: sort the data into the groups you would write about | **Upgrade**: pick the band 9 rewrite of three band 6 sentences |
| 5 | **Complete**: rebuild a band 9 paragraph from a word bank | **Order**: put a scrambled body paragraph back in order (drag or arrows) |
| 6 | **Write**: your own report, with a timer and live checks | **Write**: your own essay, with a timer and live checks |
| 7 | **Compare**: your report beside the model, a band 7 paragraph with its faults marked, then score yourself | the same |

There is also a **Toolkit** page with the marking criteria in plain words, language for every chart type, a structure for each essay type, linking words and the most common mistakes.

## An honest note

The live checks in the Write step count words, paragraphs, figures and linking words, and look for an overview, a position, examples and repeated words. They **cannot** judge ideas or grammar the way an examiner does. That is why the Compare step has you score yourself against the four band descriptors.

All data, topics, explanations and model answers are original, written for this project. The Task 1 data is invented. The band descriptions are plain-English summaries, not the official wording.

## Using it

- Your answers, drafts, timers and self-scores are saved in this browser only. Nothing is sent anywhere.
- Task 1 gives 20 minutes and 150 words; Task 2 gives 40 minutes and 250 words.

## Rebuilding the page

```bash
cd src
python build.py
```

Before writing `index.html`, the build checks every task:
- every number in a Task 1 model answer exists in that task's own data (or is a listed calculation, such as a total);
- the word counts of the model answers are in range (150–225 for Task 1, 255–345 for Task 2);
- each Task 1 has exactly 3 key features and 2 good overview sentences; each Task 2 has exactly 1 correct thesis and 3 matching pairs;
- every band 7 fault, cloze word and decode phrase really occurs in its text.

| File | Contents |
|---|---|
| `src/content_t1_a.py` … `content_t1_e.py` | The 20 Task 1 reports |
| `src/content_t2_a.py` … `content_t2_e.py` | The 20 Task 2 essays |
| `src/content_global.py` | Criteria descriptors, essay types, toolkit |
| `src/build.py` | Validates the content and writes the page |
| `src/app.js`, `src/style.css` | The workbench, charts, exercises and checks |

## Note

IELTS is a registered trademark of the British Council, IDP: IELTS Australia and Cambridge University Press & Assessment, which are not connected with this project.
