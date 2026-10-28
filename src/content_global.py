"""Reference content shared by every task: criteria descriptors, essay types, and the Task 1 / Task 2 toolkits."""

ETYPES = [
    ("opinion", "Opinion (agree / disagree)"),
    ("discussion", "Discussion of two views + your opinion"),
    ("advdis", "Advantages and disadvantages"),
    ("problem", "Problems and solutions"),
    ("twopart", "Two-part question"),
    ("posneg", "Positive or negative development"),
]

# Plain-English summaries of what each band looks like, one line per band per criterion (not the official wording).
CRIT_T1 = [
    ("TA", "Task Achievement", {
        5: "Some features are reported but there is no clear overview. Detail is mechanical or mixed with irrelevant data. Some figures are wrong.",
        6: "Key features are covered and there is an overview, but some details are missing, wrong or unclear. Not every comparison is made.",
        7: "A clear overview of the main trends or differences. Key features are highlighted and supported with accurate data.",
        8: "A well-selected overview and key features, covered fully and accurately. Almost nothing important is missing or irrelevant.",
        9: "Every key feature is covered, perfectly selected and precisely supported. The report fully answers the task."}),
    ("CC", "Coherence & Cohesion", {
        5: "Some organisation, but ideas are not always connected. Linkers are overused, under-used or mechanical.",
        6: "A generally clear order, with cohesive devices used, though sometimes faulty or mechanical. Paragraphing may be weak.",
        7: "Information is logically ordered with a clear progression. A range of linking words is used, mostly well.",
        8: "Information is sequenced logically and paragraphed well. Linking is skilful and rarely noticeable.",
        9: "Cohesion is invisible. Paragraphing is perfect. The reader never has to think about the structure."}),
    ("LR", "Lexical Resource", {
        5: "A limited range of words, repeated often. Spelling and word-formation errors can make reading hard.",
        6: "An adequate range. Attempts at less common words are not always accurate. Some errors, but meaning is clear.",
        7: "A good range, including less common words and some collocations. Occasional errors in word choice or spelling.",
        8: "A wide range used fluently and precisely. Only rare slips in word choice or spelling.",
        9: "A full range used naturally and accurately. Errors are very rare and look like slips."}),
    ("GRA", "Grammatical Range & Accuracy", {
        5: "A limited range of structures. Complex sentences are tried but are often wrong. Errors can cause difficulty.",
        6: "A mix of simple and complex sentences. Errors occur but rarely stop the reader understanding.",
        7: "A variety of complex structures. Frequent error-free sentences. Good control, with a few errors.",
        8: "A wide range of structures. The majority of sentences are error-free. Only occasional slips.",
        9: "A full range used naturally and flexibly. Errors are very rare and minor."}),
]
CRIT_T2 = [
    ("TR", "Task Response", {
        5: "The topic is addressed, but ideas are limited or not developed enough. The position may be unclear or drift. Examples are thin.",
        6: "All parts of the question are addressed, though some more fully than others. A position is present but ideas can be unclear or repeated.",
        7: "All parts are addressed and a clear position is held throughout. Main ideas are extended and supported, though sometimes too general or too long.",
        8: "All parts are addressed sufficiently, with a well-developed position. Ideas are relevant, extended and supported. Occasional lapses only.",
        9: "All parts are fully and appropriately addressed. A clear, fully developed position. Ideas are relevant, fully extended and well supported."}),
] + CRIT_T1[1:]

CHARTS_TOOLKIT = [
    ("Trends: going up", "rise, increase, grow, climb, go up · surge, soar, rocket (big and fast) · edge up, creep up (small)", "Sales <b>rose</b> from 20 to 45 million between 2000 and 2010."),
    ("Trends: going down", "fall, decrease, decline, drop, go down · plunge, plummet, slump (big and fast) · dip, slip (small)", "Output <b>plunged</b> to its lowest level in 1998."),
    ("Trends: staying level", "remain stable / steady / constant · stay at · level off / plateau · stand at", "The rate <b>remained steady at</b> 12%."),
    ("Trends: ups and downs", "fluctuate · be volatile · rise and fall · peak at · hit a low of · bottom out at", "Prices <b>fluctuated</b> before <b>peaking at</b> $90 in 2006."),
    ("Speed and size (adverbs)", "sharply, dramatically, significantly, considerably · steadily, gradually, slowly · slightly, marginally, modestly · rapidly, swiftly", "A <b>sharp</b> rise · a <b>gradual</b> decline"),
    ("Prepositions", "rose <b>by</b> 5 (amount of change) · rose <b>to</b> 50 (end point) · rose <b>from</b> 20 <b>to</b> 50 · stood <b>at</b> 30 · <b>peaked at</b> · <b>between</b> 1990 <b>and</b> 2000 · <b>over</b> the period · <b>in</b> 2005 · <b>by</b> 2020", "Rose <b>by</b> 10% <b>to</b> 40%."),
    ("Comparing", "higher / lower than · twice as … as · the highest / lowest · far more / slightly fewer · whereas, while, but, in contrast, by contrast, compared with · the same as · similar to · unlike", "A was <b>twice as high as</b> B, <b>whereas</b> C was the lowest."),
    ("Proportions", "a third of · nearly half · just over a quarter · the majority of · a small minority · one in five · accounted for · made up · represented · the largest share", "Rent <b>accounted for</b> <b>just over a third</b> of spending."),
    ("Approximation", "approximately, roughly, around, about · just over, just under · nearly, almost · well over, a little under", "<b>Just under</b> 40%."),
    ("Overview starters", "Overall, … · In general, … · It is clear that … · The most striking feature is … · The main trend is … · It is noticeable that … · As a whole, …", "<b>Overall</b>, car use rose while rail use fell."),
    ("Maps: changes", "was replaced by / converted into / demolished / cleared / extended / relocated / redeveloped · a new … was built / constructed / added · remained unchanged · was left intact · now stands / houses", "The farmland <b>was replaced by</b> a housing estate."),
    ("Maps: position", "in the north-east / centre / south-west · to the east of · next to · opposite · alongside · adjacent to · beside the river · at the entrance · in the north-eastern corner", "A café <b>opposite</b> the entrance."),
    ("Process: sequence", "First(ly), … · Next, … · Then … · After that … · Following this … · Once … · Before … · At the same time … · Subsequently … · Finally, … · The final stage …", "<b>Once</b> it is dry, the paper is rolled."),
    ("Process: forms", "Passive for things done: is heated, are collected · active for natural cycles: the eggs hatch · purpose: in order to, so that, to · result: which, causing, resulting in", "The beans <b>are roasted</b> <b>in order to</b> develop flavour."),
]

T1_PLAN = [
    ("Introduction (1 sentence)", "Paraphrase the question. Change the topic words and the verb: <i>shows → illustrates / compares / gives information about</i>. Do not copy."),
    ("Overview (2 sentences)", "The 2 biggest features only: the main trend, the highest and lowest, the biggest change. <b>No numbers.</b> This is what separates band 6 from band 7."),
    ("Body paragraph 1", "Group the data that belongs together (for example, the items that rose). Use selected figures, with comparisons."),
    ("Body paragraph 2", "The other group (for example, the items that fell or stayed level), again with figures and comparisons."),
]

T2_SKELETON = {
    "opinion": ("Opinion (agree / disagree)", [
        "Introduction: paraphrase the statement + <b>your position</b> in one clear sentence (<i>I largely agree that…</i>).",
        "Body 1: your strongest reason, explained, then a specific example.",
        "Body 2: a second reason, or a counter-view you then answer (<i>Admittedly… However…</i>), with an example.",
        "Conclusion: restate your position in different words. No new ideas."]),
    "discussion": ("Discussion of two views + your opinion", [
        "Introduction: say that both views exist, and say which one <b>you</b> prefer (or how you balance them).",
        "Body 1: the first view, with reasons and an example.",
        "Body 2: the second view, with reasons and an example. Your opinion shows in how you weigh them.",
        "Conclusion: restate your opinion clearly."]),
    "advdis": ("Advantages and disadvantages", [
        "Introduction: paraphrase the topic and give an overview (<i>While X brings benefits, it also has drawbacks</i>).",
        "Body 1: the advantages (two, developed), with an example.",
        "Body 2: the disadvantages (two, developed), with an example.",
        "Conclusion: if asked <i>do the advantages outweigh…</i>, answer it directly."]),
    "problem": ("Problems and solutions", [
        "Introduction: paraphrase the issue and outline that you will describe causes or problems, then solutions.",
        "Body 1: the main problems or causes, explained with a consequence or example.",
        "Body 2: solutions that clearly match those problems, with who should act and how.",
        "Conclusion: one summary sentence of the problem and the best solution."]),
    "twopart": ("Two-part question", [
        "Introduction: paraphrase the topic and signal that you will answer both questions.",
        "Body 1: answer question 1 fully (reason + example).",
        "Body 2: answer question 2 fully (reason + example).",
        "Conclusion: give a short answer to both questions."]),
    "posneg": ("Positive or negative development", [
        "Introduction: paraphrase the trend and state <b>your judgement</b> (more positive / more negative / mixed).",
        "Body 1: the strongest reasons for your judgement, with an example.",
        "Body 2: a second reason, or the other side acknowledged and weighed.",
        "Conclusion: restate your judgement."]),
}

LINKERS = [
    ("Adding", "In addition, · Moreover, · Furthermore, · Besides, · Not only … but also"),
    ("Contrast", "However, · Nevertheless, · Whereas · While · Although · Despite · On the other hand, · In contrast,"),
    ("Cause / result", "because · since · as a result, · therefore, · consequently, · This leads to · This results in"),
    ("Examples", "For example, · For instance, · such as · A case in point is · To illustrate,"),
    ("Opinion", "In my view, · I would argue that · It seems to me that · I firmly believe that · From my perspective,"),
    ("Concession", "Admittedly, · It is true that … but · Although it may be argued that…, · Granted,"),
    ("Concluding", "In conclusion, · To sum up, · Overall, · Taking everything into account,"),
]
HEDGING = "may, might, could · tend to · is likely to · many / some / a significant proportion (not all) · to some extent · in many cases · arguably · appears to · is often · seems to"
MISTAKES = [
    ("Copying the question", "Paraphrase it. Copied words are not counted towards your language marks."),
    ("An unclear position", "Say what you think in the introduction and keep it the same to the end."),
    ("A general example", "<i>Many people do this</i> is not an example. A named country, study, figure or situation is."),
    ("Memorised essays", "Examiners are trained to spot them. Memorise structure and phrases, not whole paragraphs."),
    ("One-sentence paragraphs", "Each body paragraph: topic sentence, explanation, example, link back. Around 80 to 100 words."),
    ("Too much similar vocabulary", "If one word appears five times, vary it with a synonym or a pronoun."),
    ("No conclusion, or a new idea in it", "Restate your position in different words. Nothing new."),
]
