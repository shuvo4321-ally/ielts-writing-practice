"""Brainstorm trainer: the six lenses, the topic list, side labels and the topic idea bank."""

# key, name, the questions to ask with this lens
LENSES = [
    ("money", "Money", "Who pays? Who saves or earns? What does it cost businesses or the economy? Jobs?"),
    ("people", "Individuals", "What changes for one person or one family? Skills, freedom, time, opportunity, happiness?"),
    ("society", "Society", "Fairness and equality, community, culture, crime, rich versus poor, young versus old?"),
    ("gov", "Government", "Laws, budgets, public services, enforcement, who should be responsible?"),
    ("time", "Time", "Short term versus long term? Future generations? What happens in 10 or 20 years?"),
    ("health", "Health and environment", "Bodies and minds, pollution, nature, climate, safety?"),
]

TOPICS = [
    ("edu", "Education"), ("tech", "Technology"), ("env", "Environment"), ("health", "Health"),
    ("work", "Work and the economy"), ("crime", "Crime and the law"), ("city", "Cities and housing"),
    ("family", "Family and society"), ("media", "Media and advertising"), ("culture", "Culture and tourism"),
    ("gov", "Government and spending"), ("science", "Science and the future"),
]

# what side "a" and side "b" mean for each essay type
SIDES = {
    "opinion": ("Supports the statement", "Against the statement"),
    "discussion": ("View 1", "View 2"),
    "advdis": ("Advantage", "Disadvantage"),
    "problem": ("Cause or problem", "Solution"),
    "twopart": ("Question 1", "Question 2"),
    "posneg": ("Positive", "Negative"),
}

# The worked example shown on the Brainstorm step. It uses a question that is NOT one of the 60,
# so it shows the method without giving away any answers. Rows: (lens, side, short note, full sentence)
EXAMPLE = dict(
    q="Public transport should be free for everyone. To what extent do you agree or disagree?",
    think="If buses and trains became free for everyone, what would change for each lens?",
    rows=[
        ("money", "a", "poor families save on travel", "Free buses and trains would save low-income families a large share of their monthly budget."),
        ("money", "b", "who pays? taxes go up", "Someone still has to pay for the drivers and fuel, so taxes would have to rise."),
        ("people", "a", "easier to reach jobs", "People without cars could reach jobs and colleges in other parts of the city."),
        ("gov", "b", "less money for repairs", "Without ticket income, transport companies may have less money to repair old trains."),
        ("time", "a", "fewer cars in future", "If people get used to free transport, fewer of them may buy cars in the future."),
        ("health", "a", "less traffic pollution", "Fewer cars on the roads would mean cleaner air in city centres."),
    ],
    personal="Not an idea: “My brother takes the bus to college.” That is a personal story. Keep it for the Example in the Develop step: “For example, a student who takes two buses to college could save money every month.”",
)

# Ideas that can be reused across many questions on the same topic: (idea, ready example, lens)
BANK = {
    "edu": [
        ("Education is the main route out of poverty.", "A first-generation graduate from a farming family can earn several times her parents' income.", "society"),
        ("Exams reward memory more than understanding or creativity.", "A student can score highly in history by memorising dates without being able to explain why a war began.", "people"),
        ("Teachers' quality matters more than buildings or equipment.", "A brilliant teacher in a plain classroom often achieves more than an average teacher with tablets for every child.", "gov"),
        ("Skills learned at school pay back over a whole lifetime.", "Basic numeracy helps someone compare mortgage offers decades after leaving school.", "time"),
        ("Public spending on education saves money later.", "Each young person kept in education is less likely to need unemployment support.", "money"),
        ("Pressure and long study hours harm young people's wellbeing.", "Students preparing for a single high-stakes entrance exam may study twelve hours a day and lose sleep.", "health"),
    ],
    "tech": [
        ("Technology saves time on routine tasks.", "Online banking turns a half-day visit to a branch into a two-minute task.", "time"),
        ("Not everyone can use or afford new technology (the digital divide).", "An elderly man without a smartphone cannot book a doctor's appointment through an app.", "society"),
        ("Personal data can be collected, sold or hacked.", "A fitness app may share users' location and health data with advertisers.", "gov"),
        ("Automation cuts costs but replaces some jobs.", "Self-service tills allow a supermarket to run with far fewer cashiers.", "money"),
        ("Screens can harm sleep, attention and posture.", "Teenagers who use phones in bed often sleep an hour less than they need.", "health"),
        ("Technology gives individuals access to knowledge and skills.", "A teenager in a small village can learn coding for free from online courses.", "people"),
    ],
    "env": [
        ("Burning fossil fuels drives climate change.", "Coal power stations are among the largest single sources of carbon emissions.", "health"),
        ("Green policies can create new industries and jobs.", "Building and maintaining wind turbines employs engineers in former shipbuilding towns.", "money"),
        ("Environmental damage hits the poorest countries hardest.", "Low-lying countries such as Bangladesh face flooding from rising seas they did little to cause.", "society"),
        ("Individuals' choices add up, but laws change behaviour faster.", "A small charge on plastic bags reduced their use far more than years of appeals to shoppers.", "gov"),
        ("Damage done today is paid for by future generations.", "Plastic dumped in the ocean now will still be there in a century.", "time"),
        ("Green living can save households money.", "Insulating a home cuts both heating bills and emissions.", "people"),
    ],
    "health": [
        ("Prevention is cheaper than cure.", "A vaccination costs far less than treating the disease it prevents.", "money"),
        ("Lifestyle (diet, exercise, sleep) causes many modern diseases.", "Type 2 diabetes is strongly linked to diet and inactivity.", "health"),
        ("Health care access depends on income in many countries.", "A family without insurance may delay seeing a doctor until an illness is serious.", "society"),
        ("Governments can shape habits through taxes and rules.", "Bans on smoking indoors reduced exposure to second-hand smoke in bars and offices.", "gov"),
        ("An ageing population increases demand for care.", "Hospitals face more patients with long-term conditions such as dementia and heart disease.", "time"),
        ("Mental health matters as much as physical health.", "Stress and anxiety are among the most common reasons for sick leave.", "people"),
    ],
    "work": [
        ("Job satisfaction affects productivity and wellbeing.", "Workers who feel valued take fewer sick days and stay longer with a company.", "people"),
        ("Automation and AI change which skills are needed.", "Bank clerks who once counted cash now need digital and customer-service skills.", "time"),
        ("Long hours and job insecurity damage health.", "Burnout leads to depression, sick leave and people leaving their careers.", "health"),
        ("Fair pay and conditions need legal protection.", "A minimum wage stops employers paying unfairly low rates to desperate workers.", "gov"),
        ("Employment gives people status and social connections.", "Losing a job can lead to isolation as well as lost income.", "society"),
        ("Training workers costs companies money in the short term but pays back.", "A firm that trains apprentices builds skilled staff it does not need to recruit.", "money"),
    ],
    "crime": [
        ("Poverty and lack of opportunity are linked to crime.", "Young people with no jobs or activities may be recruited by gangs.", "society"),
        ("Prevention is cheaper than prison.", "Youth clubs and mentoring cost less than keeping one young person in custody.", "money"),
        ("Technology helps catch criminals but threatens privacy.", "CCTV and phone data can solve crimes but also track innocent people.", "gov"),
        ("Rehabilitation reduces reoffending.", "Prisoners who learn a trade are more likely to find work after release.", "time"),
        ("Victims need support and a voice.", "Victims of burglary often feel unsafe in their own homes for months.", "people"),
        ("Drug and alcohol misuse fuels much crime.", "Treatment programmes can break the cycle of theft to pay for drugs.", "health"),
    ],
    "city": [
        ("Cities offer jobs, services and opportunities.", "Most universities, hospitals and large companies are based in cities.", "money"),
        ("Housing costs push ordinary workers out.", "Nurses and teachers may commute two hours because they cannot afford central rents.", "society"),
        ("Traffic causes pollution and wasted time.", "Commuters in congested cities can spend more than an hour a day in traffic.", "health"),
        ("Planning decisions shape city life for decades.", "A motorway built through a city centre divides neighbourhoods for generations.", "time"),
        ("Public transport and good planning are government responsibilities.", "A reliable metro allows people to live without a car.", "gov"),
        ("City life can be lonely despite the crowds.", "Many residents of large apartment blocks do not know their neighbours' names.", "people"),
    ],
    "family": [
        ("Both parents now often work, changing family roles.", "Grandparents and nurseries increasingly care for young children during the day.", "money"),
        ("Strong family relationships protect mental health.", "Teenagers who eat and talk with their parents regularly report less anxiety.", "health"),
        ("Traditional roles are changing towards equality.", "More fathers take paternity leave and share housework.", "society"),
        ("Government support (leave, childcare) shapes family choices.", "Affordable childcare allows mothers to return to work after having children.", "gov"),
        ("Decisions in childhood affect people's whole lives.", "Children who are read to at home often do better at school for years.", "time"),
        ("Individuals want more freedom and independence.", "Young adults often move to other cities for work, away from their families.", "people"),
    ],
    "media": [
        ("Media shape what people believe and how they vote.", "A false story shared widely before an election can change opinions.", "gov"),
        ("Advertising creates wants and encourages spending.", "Children ask for toys they have seen advertised during their favourite shows.", "money"),
        ("Free information is available to everyone online.", "Anyone with a phone can read news from around the world for free.", "society"),
        ("Social media affects self-esteem, especially among the young.", "Edited photos make teenagers compare their bodies with unrealistic images.", "health"),
        ("Fast news replaces deep understanding.", "A 30-second clip cannot explain the causes of inflation.", "time"),
        ("People choose sources that confirm their views.", "Algorithms show users more of what they already like, forming 'echo chambers'.", "people"),
    ],
    "culture": [
        ("Culture gives people identity and belonging.", "Traditional festivals bring generations of a community together each year.", "people"),
        ("Tourism brings income but can damage local life.", "Crowds and rising rents can push residents out of historic city centres.", "money"),
        ("Globalisation spreads the same brands and entertainment everywhere.", "The same coffee chains and films can be found in almost every major city.", "society"),
        ("Traditions disappear if young people do not learn them.", "A local language spoken only by older people may vanish within a generation.", "time"),
        ("Public funding protects culture that the market will not support.", "A state grant may keep a small regional theatre open.", "gov"),
        ("Mass tourism damages heritage sites and nature.", "Millions of footsteps wear away ancient stone steps and paths.", "health"),
    ],
    "gov": [
        ("Governments must prioritise limited budgets.", "Money spent on a new stadium cannot also be spent on hospitals.", "money"),
        ("Laws can change behaviour quickly.", "Seat-belt laws made wearing a belt normal within a few years.", "gov"),
        ("Individual freedom must be balanced against the public good.", "A ban on smoking in public places limits smokers' choices but protects others' health.", "people"),
        ("Policies should protect the poorest and most vulnerable.", "Free school meals ensure that poor children eat at least one good meal a day.", "society"),
        ("Long-term investment pays off beyond one election.", "Railways built a century ago still carry millions of passengers.", "time"),
        ("Public health and the environment need regulation.", "Limits on factory emissions cleaned the air in many industrial cities.", "health"),
    ],
    "science": [
        ("Scientific research brings long-term benefits that are hard to predict.", "Research on bacteria led to tools now used in medicine and genetics.", "time"),
        ("New technology raises ethical questions.", "Gene editing could prevent disease but also be used to 'design' children.", "society"),
        ("Research is expensive and must compete with urgent needs.", "A large space mission costs as much as many new hospitals.", "money"),
        ("Governments must regulate risky science.", "Medicines must pass years of trials before they can be sold.", "gov"),
        ("Science improves health and saves lives.", "Vaccines have prevented millions of deaths from diseases such as measles.", "health"),
        ("Public trust in experts depends on clear communication.", "Scientists who explain uncertainty honestly are trusted more over time.", "people"),
    ],
}
