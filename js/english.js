/* =====================================================================
   AHW Quizverse — English Lab (Master Edition)
   Three sub-sections — designed so a learner can reach EXPERT level:
     1) Word Search   — drag-to-select (mouse + touch), 12 levels,
                        8 words/level, mixed difficulties, themed packs,
                        Urdu meaning + TTS + real-life usage example
     2) Spoken English — 40 everyday & VU-context phrases,
                        3-speed TTS (Normal / Slow / Very Slow)
     3) Tenses Mastery — 12 tenses × multiple practice modes:
                          - Theory card (formula, example, Urdu, when to use)
                          - MCQ practice (real past-paper style)
                          - Fill-in-the-blank sentence transformation
                          - Common-mistake callouts
                          Per-tense progress stored separately
   All progress is saved per-section in localStorage.
   ===================================================================== */

/* ============================================================
   WORD SEARCH — 12 levels (8 words each), themed and graded
   Difficulty legend: E=Easy (3-5 letters), M=Medium (5-7),
                     H=Hard (6-9), X=Expert (7-10, abstract)
   ============================================================ */

const WS_LEVELS = [
  { name: "Level 1 — Daily Life (Easy)",        diff: "E", words: [
    { w: "BOOK",   urdu: "کتاب",    meaning: "Book",        ex: "I read a book every night." },
    { w: "PEN",    urdu: "قلم",     meaning: "Pen",         ex: "May I borrow your pen?" },
    { w: "WATER",  urdu: "پانی",    meaning: "Water",       ex: "Drink eight glasses of water daily." },
    { w: "FOOD",   urdu: "کھانا",   meaning: "Food",        ex: "Pakistani food is full of flavor." },
    { w: "TIME",   urdu: "وقت",     meaning: "Time",        ex: "Time is the most valuable resource." },
    { w: "DAY",    urdu: "دن",      meaning: "Day",         ex: "Have a productive day!" },
    { w: "NIGHT",  urdu: "رات",     meaning: "Night",       ex: "The city looks beautiful at night." },
    { w: "SUN",    urdu: "سورج",    meaning: "Sun",         ex: "The sun rises in the east." }
  ]},
  { name: "Level 2 — People (Easy-Medium)",      diff: "E", words: [
    { w: "TEACHER",  urdu: "استاد",      meaning: "Teacher",     ex: "My teacher explains things clearly." },
    { w: "STUDENT",  urdu: "طالب علم",   meaning: "Student",     ex: "Every student has a unique learning style." },
    { w: "FRIEND",   urdu: "دوست",       meaning: "Friend",      ex: "A friend in need is a friend indeed." },
    { w: "FAMILY",   urdu: "خاندان",     meaning: "Family",      ex: "Family comes first, always." },
    { w: "SCHOOL",   urdu: "سکول",       meaning: "School",      ex: "School starts at 8 AM sharp." },
    { w: "HOME",     urdu: "گھر",        meaning: "Home",        ex: "Home is where the heart is." },
    { w: "MOTHER",   urdu: "ماں",        meaning: "Mother",      ex: "Mother's love is unconditional." },
    { w: "FATHER",   urdu: "والد",       meaning: "Father",      ex: "My father works in the city." }
  ]},
  { name: "Level 3 — Feelings (Medium)",         diff: "M", words: [
    { w: "HAPPY",   urdu: "خوش",     meaning: "Happy",      ex: "I'm happy with my exam result." },
    { w: "SAD",     urdu: "اداس",    meaning: "Sad",        ex: "Don't be sad — it will get better." },
    { w: "ANGRY",   urdu: "غصہ",     meaning: "Angry",      ex: "He got angry at the rude customer." },
    { w: "TIRED",   urdu: "تھکا",    meaning: "Tired",      ex: "I feel tired after a long day." },
    { w: "HUNGRY",  urdu: "بھوکا",   meaning: "Hungry",     ex: "Are you hungry? Let's grab a bite." },
    { w: "STRONG",  urdu: "مضبوط",   meaning: "Strong",     ex: "Stay strong through the tough times." },
    { w: "BRAVE",   urdu: "بہادر",   meaning: "Brave",      ex: "The brave soldier saved the child." },
    { w: "CALM",    urdu: "پرسکون",  meaning: "Calm",       ex: "Take a deep breath and stay calm." }
  ]},
  { name: "Level 4 — Actions (Medium)",          diff: "M", words: [
    { w: "LEARN",  urdu: "سیکھنا",  meaning: "To learn",    ex: "I want to learn web development." },
    { w: "TEACH",  urdu: "پڑھانا",  meaning: "To teach",    ex: "She teaches English to beginners." },
    { w: "READ",   urdu: "پڑھنا",   meaning: "To read",     ex: "Reading improves your vocabulary." },
    { w: "WRITE",  urdu: "لکھنا",   meaning: "To write",    ex: "Write your answer in 200 words." },
    { w: "SPEAK",  urdu: "بولنا",   meaning: "To speak",    ex: "Speak slowly so I can understand." },
    { w: "LISTEN", urdu: "سننا",    meaning: "To listen",   ex: "Listen carefully to the instructions." },
    { w: "WATCH",  urdu: "دیکھنا",  meaning: "To watch",    ex: "I watch tutorials on YouTube daily." },
    { w: "WORK",   urdu: "کام کرنا",meaning: "To work",     ex: "She works as a software engineer." }
  ]},
  { name: "Level 5 — Studies (Medium-Hard)",     diff: "M", words: [
    { w: "SUCCESS", urdu: "کامیابی",  meaning: "Success",   ex: "Success comes to those who work hard." },
    { w: "EFFORT",  urdu: "کوشش",    meaning: "Effort",    ex: "Put in maximum effort before the exam." },
    { w: "EXAM",    urdu: "امتحان",  meaning: "Exam",      ex: "The final exam is on Monday." },
    { w: "RESULT",  urdu: "نتیجہ",   meaning: "Result",    ex: "Check your result on the VU portal." },
    { w: "DEGREE",  urdu: "ڈگری",    meaning: "Degree",    ex: "She's pursuing a BS degree in CS." },
    { w: "FUTURE",  urdu: "مستقبل",  meaning: "Future",    ex: "Invest in your future today." },
    { w: "PROJECT", urdu: "پروجیکٹ", meaning: "Project",   ex: "Submit your project before the deadline." },
    { w: "ASSIGNMENT", urdu: "اسائنمنٹ", meaning: "Assignment", ex: "Solve the assignment honestly." }
  ]},
  { name: "Level 6 — Values (Hard)",             diff: "H", words: [
    { w: "COURAGE",  urdu: "بہادری",     meaning: "Courage",  ex: "It takes courage to speak the truth." },
    { w: "WISDOM",   urdu: "دانش",       meaning: "Wisdom",   ex: "Wisdom grows with age and experience." },
    { w: "PATIENCE", urdu: "صبر",        meaning: "Patience", ex: "Patience is the key to success." },
    { w: "HONESTY",  urdu: "ایمانداری",  meaning: "Honesty",  ex: "Honesty is the best policy." },
    { w: "RESPECT",  urdu: "عزت",        meaning: "Respect",  ex: "Always respect your elders." },
    { w: "KINDNESS", urdu: "نرمی",       meaning: "Kindness", ex: "Kindness costs nothing but means everything." },
    { w: "HUMBLE",   urdu: "عاجز",       meaning: "Humble",   ex: "Stay humble even when you succeed." },
    { w: "GRATEFUL", urdu: "شکر گزار",   meaning: "Grateful", ex: "I'm grateful for my family's support." }
  ]},
  { name: "Level 7 — Tech & Modern (Hard)",      diff: "H", words: [
    { w: "COMPUTER", urdu: "کمپیوٹر",  meaning: "Computer",   ex: "A computer can solve complex problems." },
    { w: "INTERNET", urdu: "انٹرنیٹ",  meaning: "Internet",   ex: "The internet changed the world." },
    { w: "SOFTWARE", urdu: "سافٹ ویئر",meaning: "Software",   ex: "I develop software for a living." },
    { w: "NETWORK",  urdu: "نیٹ ورک",  meaning: "Network",    ex: "Build a strong professional network." },
    { w: "DATABASE", urdu: "ڈیٹا بیس", meaning: "Database",   ex: "Back up your database every night." },
    { w: "LIBRARY",  urdu: "لائبریری", meaning: "Library",    ex: "The VU library has thousands of books." },
    { w: "DIGITAL",  urdu: "ڈیجیٹل",   meaning: "Digital",    ex: "We live in a digital age." },
    { w: "VIRTUAL",  urdu: "مجازی",    meaning: "Virtual",    ex: "Virtual University is fully online." }
  ]},
  { name: "Level 8 — Abstract English (Hard)",    diff: "H", words: [
    { w: "THOUGHT",  urdu: "خیال",      meaning: "Thought",  ex: "A single thought can change your life." },
    { w: "DREAMS",   urdu: "خواب",      meaning: "Dreams",   ex: "Dreams don't work unless you do." },
    { w: "MEMORY",   urdu: "یادداشت",   meaning: "Memory",   ex: "Memory plays tricks when you're tired." },
    { w: "CHOICE",   urdu: "انتخاب",    meaning: "Choice",   ex: "Every choice has a consequence." },
    { w: "REASON",   urdu: "وجہ",       meaning: "Reason",   ex: "There's a reason behind everything." },
    { w: "CHANGE",   urdu: "تبدیلی",    meaning: "Change",   ex: "Change is the only constant." },
    { w: "FREEDOM",  urdu: "آزادی",     meaning: "Freedom",  ex: "Freedom comes with responsibility." },
    { w: "JUSTICE",  urdu: "انصاف",     meaning: "Justice",  ex: "Justice must be served swiftly." }
  ]},
  { name: "Level 9 — Idioms & Phrasal (Expert)", diff: "X", words: [
    { w: "BREAKDOWN",   urdu: "خرابی",         meaning: "Breakdown",     ex: "My car had a breakdown on the highway." },
    { w: "OVERCOME",    urdu: "قابلِ غلبہ",     meaning: "Overcome",      ex: "Overcome your fear of public speaking." },
    { w: "OUTSTANDING", urdu: "بے عیب",        meaning: "Outstanding",   ex: "She did an outstanding job on the project." },
    { w: "THOROUGH",    urdu: "مکمل",          meaning: "Thorough",      ex: "Do a thorough review before submitting." },
    { w: "APPROACH",    urdu: "طریقہ",         meaning: "Approach",      ex: "Use a step-by-step approach to learning." },
    { w: "ENTHUSIASM",  urdu: "جوش",           meaning: "Enthusiasm",    ex: "Her enthusiasm is contagious." },
    { w: "PERSEVERANCE",urdu: "استقامت",       meaning: "Perseverance",  ex: "Perseverance beats talent on a long day." },
    { w: "DETERMINED",  urdu: "پُرعزم",        meaning: "Determined",    ex: "Stay determined, no matter what." }
  ]},
  { name: "Level 10 — Business & Career (Expert)",diff: "X", words: [
    { w: "INNOVATION", urdu: "جدت",            meaning: "Innovation",    ex: "Innovation drives economic growth." },
    { w: "STRATEGY",   urdu: "حکمت عملی",     meaning: "Strategy",      ex: "A clear strategy beats hard work alone." },
    { w: "LEADERSHIP", urdu: "قیادت",          meaning: "Leadership",    ex: "True leadership inspires trust." },
    { w: "DEADLINE",   urdu: "آخری تاریخ",    meaning: "Deadline",      ex: "Meet every deadline, no excuses." },
    { w: "MEETING",    urdu: "میٹنگ",          meaning: "Meeting",       ex: "We have a meeting at 10 AM." },
    { w: "PORTFOLIO",  urdu: "پورٹ فولیو",     meaning: "Portfolio",     ex: "Build a strong portfolio of projects." },
    { w: "PROPOSAL",   urdu: "تجویز",          meaning: "Proposal",      ex: "Send the proposal before Friday." },
    { w: "NEGOTIATE",  urdu: "مذاکرہ",         meaning: "Negotiate",     ex: "Learn to negotiate your salary smartly." }
  ]},
  { name: "Level 11 — Advanced Vocabulary (Expert)", diff: "X", words: [
    { w: "CONSEQUENTLY", urdu: "نتیجتاً",       meaning: "Consequently",   ex: "He missed class; consequently, he failed." },
    { w: "NOTWITHSTANDING", urdu: "اس کے باوجود", meaning: "Notwithstanding", ex: "Notwithstanding the rain, the match continued." },
    { w: "EXTRAORDINARY", urdu: "غیر معمولی",   meaning: "Extraordinary",  ex: "Her performance was extraordinary." },
    { w: "INEVITABLE",    urdu: "ناگزیر",       meaning: "Inevitable",     ex: "Change is inevitable in life." },
    { w: "COMPREHENSIVE", urdu: "جامع",         meaning: "Comprehensive",  ex: "Read the comprehensive guide before coding." },
    { w: "SIGNIFICANTLY", urdu: "نمایاں طور پر",meaning: "Significantly",  ex: "Sales grew significantly this quarter." },
    { w: "FUNDAMENTAL",   urdu: "بنیادی",       meaning: "Fundamental",    ex: "Master the fundamental concepts first." },
    { w: "MAGNIFICENT",   urdu: "شاندار",       meaning: "Magnificent",    ex: "The view from the peak was magnificent." }
  ]},
  { name: "Level 12 — TOEFL / IELTS Advanced (Expert)", diff: "X", words: [
    { w: "DILIGENT",       urdu: "محنتی",      meaning: "Diligent",       ex: "A diligent student always succeeds." },
    { w: "RESILIENT",      urdu: "مضبوط",      meaning: "Resilient",      ex: "Be resilient in the face of failure." },
    { w: "SUBSTANTIAL",    urdu: "قابلِ قدر",  meaning: "Substantial",    ex: "She earned a substantial scholarship." },
    { w: "CONSCIENTIOUS",  urdu: "ذمہ دار",   meaning: "Conscientious",  ex: "He is conscientious about his duties." },
    { w: "PERSUASIVE",     urdu: "مؤثر",       meaning: "Persuasive",     ex: "She gave a persuasive presentation." },
    { w: "METICULOUS",     urdu: "باریک بین",  meaning: "Meticulous",     ex: "A meticulous editor catches every typo." },
    { w: "INTERMITTENT",   urdu: "وقفے وقفے سے",meaning: "Intermittent",  ex: "There was intermittent rain all day." },
    { w: "UNPRECEDENTED",  urdu: "بے مثال",    meaning: "Unprecedented",  ex: "The flood caused unprecedented damage." }
  ]}
];

/* ============================================================
   SPOKEN ENGLISH — 40 phrases (everyday + VU + idioms)
   ============================================================ */

const SPOKEN_PHRASES = [
  { en: "Good morning!",                          ur: "صبح بخیر",                            cat: "Greetings" },
  { en: "Good afternoon!",                        ur: "دوپہر بخیر",                           cat: "Greetings" },
  { en: "Good evening!",                          ur: "شام بخیر",                             cat: "Greetings" },
  { en: "Good night!",                            ur: "شب بخیر",                              cat: "Greetings" },
  { en: "How are you?",                           ur: "آپ کیسے ہیں؟",                          cat: "Greetings" },
  { en: "I am fine, thank you.",                  ur: "میں ٹھیک ہوں، شکریہ",                  cat: "Greetings" },
  { en: "What is your name?",                     ur: "آپ کا نام کیا ہے؟",                      cat: "Greetings" },
  { en: "My name is Ali.",                        ur: "میرا نام علی ہے",                       cat: "Greetings" },
  { en: "Nice to meet you.",                      ur: "آپ سے مل کر خوشی ہوئی",                  cat: "Greetings" },
  { en: "See you later!",                         ur: "پھر ملیں گے!",                          cat: "Greetings" },
  { en: "Have a nice day!",                       ur: "آپ کا دن اچھا گزرے",                    cat: "Greetings" },
  { en: "Please speak slowly.",                   ur: "براہ کرم آہستہ بولیں",                   cat: "Classroom" },
  { en: "I don't understand.",                    ur: "مجھے سمجھ نہیں آیا",                    cat: "Classroom" },
  { en: "Can you repeat that, please?",           ur: "کیا آپ دوبارہ کہیں گے؟",                cat: "Classroom" },
  { en: "What does this word mean?",              ur: "اس لفظ کا کیا مطلب ہے؟",                  cat: "Classroom" },
  { en: "How do you spell that?",                 ur: "یہ کیسے ہجے کیا جاتا ہے؟",                 cat: "Classroom" },
  { en: "I have a question.",                     ur: "میرا ایک سوال ہے۔",                      cat: "Classroom" },
  { en: "Can you help me?",                       ur: "کیا آپ میری مدد کر سکتے ہیں؟",            cat: "Classroom" },
  { en: "I am a student of Virtual University.",  ur: "میں ورچوئل یونیورسٹی کا طالب علم ہوں",  cat: "VU Context" },
  { en: "I am preparing for my exam.",            ur: "میں اپنے امتحان کی تیاری کر رہا ہوں",    cat: "VU Context" },
  { en: "I missed the last class.",               ur: "میں پچھلی کلاس سے غائب رہا۔",             cat: "VU Context" },
  { en: "When is the assignment due?",            ur: "اسائنمنٹ کب تک جمع کرانی ہے؟",           cat: "VU Context" },
  { en: "Where is the library?",                  ur: "لائبریری کہاں ہے؟",                      cat: "VU Context" },
  { en: "Excuse me, please.",                     ur: "معاف کیجئے گا",                          cat: "Polite" },
  { en: "Thank you very much.",                   ur: "آپ کا بہت شکریہ",                        cat: "Polite" },
  { en: "You are most welcome.",                  ur: "آپ کا شکریہ بالکل نہیں۔",                cat: "Polite" },
  { en: "I am sorry for being late.",             ur: "دیر سے آنے کی معذرت",                    cat: "Polite" },
  { en: "Never mind.",                            ur: "کوئی بات نہیں۔",                         cat: "Polite" },
  { en: "I want to improve my English.",          ur: "میں اپنی انگریزی بہتر کرنا چاہتا ہوں",  cat: "Goals" },
  { en: "Practice makes perfect.",                ur: "مشق انسان کو کامل بناتی ہے",             cat: "Idioms" },
  { en: "No pain, no gain.",                      ur: "محنت کے بغیر کچھ نہیں ملتا",              cat: "Idioms" },
  { en: "Better late than never.",                ur: "دیر آید، درست آید",                       cat: "Idioms" },
  { en: "Actions speak louder than words.",       ur: "عمل قول سے زیادہ بولتا ہے",               cat: "Idioms" },
  { en: "What time is it?",                       ur: "کتنا بجا ہے؟",                            cat: "Daily" },
  { en: "I need a little help.",                  ur: "مجھے تھوری سی مدد چاہیے",                  cat: "Daily" },
  { en: "Where are you from?",                    ur: "آپ کہاں سے ہیں؟",                         cat: "Daily" },
  { en: "I am from Pakistan.",                    ur: "میں پاکستان سے ہوں۔",                      cat: "Daily" },
  { en: "Could I have your number, please?",      ur: "کیا مجھے آپ کا نمبر مل سکتا ہے؟",         cat: "Daily" },
  { en: "Let me think about it.",                 ur: "مجھے اس پر غور کرنے دیں۔",                  cat: "Daily" },
  { en: "I will get back to you soon.",           ur: "میں جلد آپ سے رابطہ کروں گا۔",             cat: "Daily" }
];

/* ============================================================
   TENSES MASTERY — 12 tenses with deep coverage
   Each tense has:
     - name, formula, example, urdu, whenToUse (expert knowledge)
     - mistakes: array of common VU-student errors
     - practice: MCQ (5 questions) + Fill (3 sentences)
   ============================================================ */

const TENSES = [
  {
    name: "Present Indefinite",
    formula: "S + V1 (+ s/es for He/She/It) + O",
    ex: "I eat an apple.",
    ur: "میں سیب کھاتا ہوں۔",
    when: "Routines, habits, general truths, permanent situations. NO time word 'now'.",
    mistakes: [
      "❌ 'He eat rice' (correct: 'He eats rice' — add 's' for 3rd person singular).",
      "❌ 'I am go to school' (correct: 'I go to school' — never use 'am/is/are' with V1)."
    ],
    practice: {
      mcq: [
        { q: "She ___ tea every morning.", opts: ["drink","drinks","drinking","is drink"], a: 1, why: "3rd person singular (she) → base verb + s." },
        { q: "They ___ football on Sundays.", opts: ["plays","playing","play","is play"], a: 2, why: "Plural subject (they) → base verb without s." },
        { q: "The sun ___ in the east.", opts: ["rise","rises","is rising","are rising"], a: 1, why: "Universal truth always takes simple present + s." },
        { q: "I ___ English at Virtual University.", opts: ["studies","study","studying","am study"], a: 1, why: "I/You/We/They → base verb, no s." },
        { q: "He ___ like spicy food.", opts: ["don't","doesn't","isn't","not"], a: 1, why: "With 3rd person singular, use 'doesn't' (not 'don't')." }
      ],
      fill: [
        { hint: "She (watch) TV every night.", answer: "watches", full: "She watches TV every night." },
        { hint: "Birds (fly) high in the sky.", answer: "fly", full: "Birds fly high in the sky." },
        { hint: "Water (boil) at 100°C.", answer: "boils", full: "Water boils at 100 degrees Celsius." }
      ]
    }
  },
  {
    name: "Present Continuous",
    formula: "is / am / are + V-ing + O",
    ex: "I am eating an apple.",
    ur: "میں سیب کھا رہا ہوں۔",
    when: "Action happening RIGHT NOW (at this moment), or temporary situation around now.",
    mistakes: [
      "❌ 'I am eat' (correct: 'I am eating' — need V-ing).",
      "❌ 'He are working' (correct: 'He is working' — 'are' goes with plural subjects)."
    ],
    practice: {
      mcq: [
        { q: "Look! It ___.", opts: ["rain","rains","is raining","are raining"], a: 2, why: "'Look!' signals action happening now → am/is/are + V-ing." },
        { q: "I ___ for the bus right now.", opts: ["wait","waits","am waiting","waiting"], a: 2, why: "'Right now' → Present Continuous." },
        { q: "She ___ her homework at the moment.", opts: ["do","does","is doing","are doing"], a: 2, why: "She + is + V-ing." },
        { q: "Listen! The birds ___ .", opts: ["sing","sings","is singing","are singing"], a: 3, why: "The birds (plural) → are + V-ing." },
        { q: "We ___ dinner at the moment.", opts: ["have","has","having","are having"], a: 3, why: "We + are + V-ing." }
      ],
      fill: [
        { hint: "She (read) a novel right now.", answer: "is reading", full: "She is reading a novel right now." },
        { hint: "They (play) cricket.", answer: "are playing", full: "They are playing cricket." },
        { hint: "I (study) for my exam today.", answer: "am studying", full: "I am studying for my exam today." }
      ]
    }
  },
  {
    name: "Present Perfect",
    formula: "has / have + V3 + O",
    ex: "I have eaten an apple.",
    ur: "میں سیب کھا چکا ہوں۔",
    when: "Action completed in the past but connected to NOW. Used with 'just', 'already', 'yet', 'ever', 'never', 'so far'.",
    mistakes: [
      "❌ 'I have went home' (correct: 'I have gone home' — use V3, not V2).",
      "❌ 'She has went' (correct: 'She has gone' — V3 = gone, not went)."
    ],
    practice: {
      mcq: [
        { q: "I ___ my lunch already.", opts: ["have eaten","ate","am eating","eat"], a: 0, why: "'Already' + present relevance → have + V3." },
        { q: "He ___ just ___ to Lahore.", opts: ["has / go","have / gone","has / gone","had / gone"], a: 2, why: "He → has + V3 (gone is V3 of go)." },
        { q: "We ___ this movie before.", opts: ["saw","have seen","are seeing","see"], a: 1, why: "'Before' + present relevance → have + V3." },
        { q: "She ___ never ___ sushi.", opts: ["has / try","have / tried","has / tried","had / tried"], a: 2, why: "'Never' → has/have + V3 (tried is V3 of try)." },
        { q: "I ___ my keys. Have you seen them?", opts: ["lost","have lost","am losing","lose"], a: 1, why: "Past action with present consequence → have + V3." }
      ],
      fill: [
        { hint: "I (finish) my homework.", answer: "have finished", full: "I have finished my homework." },
        { hint: "She (visit) Paris twice.", answer: "has visited", full: "She has visited Paris twice." },
        { hint: "They (not eat) yet.", answer: "have not eaten", full: "They have not eaten yet." }
      ]
    }
  },
  {
    name: "Present Perfect Continuous",
    formula: "has / have + been + V-ing + O",
    ex: "I have been eating an apple.",
    ur: "میں کچھ دیر سے کھا رہا ہوں۔",
    when: "Action started in past, STILL continuing now. Emphasizes DURATION. Often with 'for' / 'since'.",
    mistakes: [
      "❌ 'I have been eat' (correct: 'I have been eating' — need V-ing after been).",
      "❌ Used for short actions — wrong! Use Simple Past for completed short actions."
    ],
    practice: {
      mcq: [
        { q: "I ___ for two hours.", opts: ["studied","have been studying","am studying","study"], a: 1, why: "Duration 'for two hours' starting in past, still going → have been + V-ing." },
        { q: "She ___ since 9 AM.", opts: ["is working","works","has been working","worked"], a: 2, why: "Since + time + still continuing → has been + V-ing." },
        { q: "They ___ all morning. They're tired.", opts: ["have been running","are running","ran","run"], a: 0, why: "All morning + still tired (present effect) → have been + V-ing." },
        { q: "It ___ since morning.", opts: ["is raining","rains","has been raining","rained"], a: 2, why: "Started in past, still going, duration 'since morning'." },
        { q: "I ___ for this company for 5 years.", opts: ["work","am working","have been working","worked"], a: 2, why: "For 5 years + still working → have been + V-ing." }
      ],
      fill: [
        { hint: "I (wait) for you since 6 PM.", answer: "have been waiting", full: "I have been waiting for you since 6 PM." },
        { hint: "She (read) for an hour.", answer: "has been reading", full: "She has been reading for an hour." },
        { hint: "It (snow) all day.", answer: "has been snowing", full: "It has been snowing all day." }
      ]
    }
  },
  {
    name: "Past Indefinite",
    formula: "S + V2 + O",
    ex: "I ate an apple.",
    ur: "میں نے سیب کھایا۔",
    when: "Action completed at a specific time in the past. Time words: yesterday, last week, ago, in 2020.",
    mistakes: [
      "❌ 'I have went yesterday' (correct: 'I went yesterday' — yesterday = past simple, NOT present perfect).",
      "❌ 'He run fast yesterday' (correct: 'He ran fast' — V2 of run is ran)."
    ],
    practice: {
      mcq: [
        { q: "I ___ to the market yesterday.", opts: ["go","went","have gone","am going"], a: 1, why: "Yesterday → past simple (V2 = went)." },
        { q: "She ___ a new car last month.", opts: ["buys","bought","has bought","is buying"], a: 1, why: "Last month = specific past time → V2." },
        { q: "They ___ football two hours ago.", opts: ["plays","played","are playing","have played"], a: 1, why: "Ago + finished action → V2." },
        { q: "I ___ him at the party last night.", opts: ["see","saw","have seen","am seeing"], a: 1, why: "Last night = past simple." },
        { q: "He ___ his homework before dinner.", opts: ["finish","finishes","finished","has finished"], a: 2, why: "Past completed action → V2." }
      ],
      fill: [
        { hint: "I (meet) him yesterday.", answer: "met", full: "I met him yesterday." },
        { hint: "She (write) a letter last night.", answer: "wrote", full: "She wrote a letter last night." },
        { hint: "We (see) a movie last weekend.", answer: "saw", full: "We saw a movie last weekend." }
      ]
    }
  },
  {
    name: "Past Continuous",
    formula: "was / were + V-ing + O",
    ex: "I was eating an apple.",
    ur: "میں سیب کھا رہا تھا۔",
    when: "Action CONTINUING at a specific time in the past. Often paired with another action ('while', 'when').",
    mistakes: [
      "❌ 'I was eat rice' (correct: 'I was eating rice' — need V-ing).",
      "❌ 'They was playing' (correct: 'They were playing' — they = were, not was)."
    ],
    practice: {
      mcq: [
        { q: "I ___ TV at 8 PM yesterday.", opts: ["watch","watched","was watching","am watching"], a: 2, why: "Specific past time + ongoing action → was/were + V-ing." },
        { q: "While she ___ , the phone rang.", opts: ["cook","cooked","was cooking","is cooking"], a: 2, why: "While + ongoing past action → was + V-ing." },
        { q: "They ___ football when it started to rain.", opts: ["plays","played","were playing","are playing"], a: 2, why: "When + ongoing past → were + V-ing." },
        { q: "He ___ at 10 last night.", opts: ["sleep","slept","was sleeping","is sleeping"], a: 2, why: "At 10 last night = past continuous." },
        { q: "What ___ at 9 PM? I ___ dinner.", opts: ["did you do / was having","were you doing / was having","you did / had","do you do / am having"], a: 1, why: "Past continuous question + answer." }
      ],
      fill: [
        { hint: "I (study) when you called.", answer: "was studying", full: "I was studying when you called." },
        { hint: "They (play) at 5 PM yesterday.", answer: "were playing", full: "They were playing at 5 PM yesterday." },
        { hint: "She (cook) while he (read).", answer: "was cooking / was reading", full: "She was cooking while he was reading." }
      ]
    }
  },
  {
    name: "Past Perfect",
    formula: "had + V3 + O",
    ex: "I had eaten an apple.",
    ur: "میں سیب کھا چکا تھا۔",
    when: "Action completed BEFORE another past action. Sequence of two past events — earlier one uses Past Perfect.",
    mistakes: [
      "❌ 'I had went home' (correct: 'I had gone home' — V3 of go = gone).",
      "❌ Using for a single past event — use Past Indefinite instead."
    ],
    practice: {
      mcq: [
        { q: "I ___ my lunch before she came.", opts: ["ate","have eaten","had eaten","was eating"], a: 2, why: "Eaten BEFORE another past event → Past Perfect." },
        { q: "The train ___ before we reached the station.", opts: ["left","had left","has left","leaves"], a: 1, why: "Earlier past event → had + V3." },
        { q: "He ___ his homework before he went out.", opts: ["finished","has finished","had finished","finishes"], a: 2, why: "Past Perfect for the earlier of two past actions." },
        { q: "She ___ the movie before her friend arrived.", opts: ["watched","had watched","has watched","was watching"], a: 1, why: "Watched (before arriving) → had watched." },
        { q: "By 2020, I ___ my degree.", opts: ["completed","have completed","had completed","complete"], a: 2, why: "By + past time = Past Perfect (experience up to that time)." }
      ],
      fill: [
        { hint: "She (leave) before I arrived.", answer: "had left", full: "She had left before I arrived." },
        { hint: "I (eat) before he came.", answer: "had eaten", full: "I had eaten before he came." },
        { hint: "The film (start) when we reached.", answer: "had started", full: "The film had started when we reached." }
      ]
    }
  },
  {
    name: "Past Perfect Continuous",
    formula: "had + been + V-ing + O",
    ex: "I had been eating an apple.",
    ur: "میں پہلے سے کھا رہا تھا۔",
    when: "Action CONTINUING for a duration BEFORE another past event. Focus on DURATION up to a past point.",
    mistakes: [
      "❌ 'I had been eat' (correct: 'I had been eating').",
      "❌ Confusing with Past Perfect — Past Perfect Continuous emphasizes duration."
    ],
    practice: {
      mcq: [
        { q: "I ___ for an hour before it started to rain.", opts: ["walked","had walked","had been walking","was walking"], a: 2, why: "Duration before past event → had been + V-ing." },
        { q: "She ___ for two hours when I called her.", opts: ["studied","had studied","had been studying","was studying"], a: 2, why: "For two hours + before call → had been + V-ing." },
        { q: "They ___ for 30 minutes before the bus came.", opts: ["waited","had waited","had been waiting","were waiting"], a: 2, why: "Duration before another past action → had been + V-ing." },
        { q: "He ___ the car all morning before it broke down.", opts: ["drove","had driven","had been driving","was driving"], a: 2, why: "All morning + before past event → had been + V-ing." },
        { q: "I ___ since 6 AM when she finally woke up.", opts: ["worked","had worked","had been working","was working"], a: 2, why: "Since 6 AM + before wake-up → had been + V-ing." }
      ],
      fill: [
        { hint: "I (wait) for 2 hours before the train came.", answer: "had been waiting", full: "I had been waiting for 2 hours before the train came." },
        { hint: "She (study) since morning.", answer: "had been studying", full: "She had been studying since morning." },
        { hint: "It (rain) for an hour before we left.", answer: "had been raining", full: "It had been raining for an hour before we left." }
      ]
    }
  },
  {
    name: "Future Indefinite",
    formula: "will + V1 + O",
    ex: "I will eat an apple.",
    ur: "میں سیب کھاؤں گا۔",
    when: "Spontaneous decisions, predictions, promises, facts about the future.",
    mistakes: [
      "❌ 'I will eats' (correct: 'I will eat' — 'will' is followed by V1, not V1+s).",
      "❌ 'I will going' (correct: 'I will go' — never 'will + V-ing' or 'will + going to go')."
    ],
    practice: {
      mcq: [
        { q: "I think it ___ tomorrow.", opts: ["rains","will rain","is raining","is going to rain"], a: 1, why: "Prediction with 'I think' → will + V1." },
        { q: "She ___ help you with the project.", opts: ["will","wills","shall helps","is will"], a: 0, why: "Promise → will + V1." },
        { q: "The meeting ___ at 10 AM tomorrow.", opts: ["starts","will start","is starting","start"], a: 1, why: "Scheduled future → will + V1 (or simple present)." },
        { q: "I ___ call you later.", opts: ["will","am will","will calling","shall to call"], a: 0, why: "Future promise → will + V1." },
        { q: "Don't worry, I ___ you.", opts: ["help","will help","helps","am helping"], a: 1, why: "Spontaneous decision / promise → will + V1." }
      ],
      fill: [
        { hint: "I (call) you tomorrow.", answer: "will call", full: "I will call you tomorrow." },
        { hint: "She (visit) us next week.", answer: "will visit", full: "She will visit us next week." },
        { hint: "We (start) at 8 AM.", answer: "will start", full: "We will start at 8 AM." }
      ]
    }
  },
  {
    name: "Future Continuous",
    formula: "will + be + V-ing + O",
    ex: "I will be eating an apple.",
    ur: "میں کھا رہا ہوں گا۔",
    when: "Action that will be IN PROGRESS at a SPECIFIC TIME in the future.",
    mistakes: [
      "❌ 'I will be eat' (correct: 'I will be eating').",
      "❌ Confusing with Future Indefinite — Continuous = action in progress at a future time."
    ],
    practice: {
      mcq: [
        { q: "At 10 PM tonight, I ___ TV.", opts: ["will watch","will be watching","watch","am watching"], a: 1, why: "At specific future time + ongoing → will be + V-ing." },
        { q: "This time tomorrow, we ___ to Lahore.", opts: ["will fly","will be flying","fly","are flying"], a: 1, why: "This time tomorrow = future continuous." },
        { q: "She ___ dinner when you arrive.", opts: ["will have","will be having","has","is having"], a: 1, why: "Ongoing action at a future point → will be + V-ing." },
        { q: "Don't call at 9, I ___ then.", opts: ["will sleep","will be sleeping","sleep","am sleeping"], a: 1, why: "At 9 PM (future) + ongoing → will be sleeping." },
        { q: "At noon tomorrow, they ___ lunch.", opts: ["will eat","will be eating","eat","are eating"], a: 1, why: "Specific future time + ongoing → future continuous." }
      ],
      fill: [
        { hint: "At 8 PM, I (study).", answer: "will be studying", full: "At 8 PM, I will be studying." },
        { hint: "This time next week, she (travel).", answer: "will be travelling", full: "This time next week, she will be travelling." },
        { hint: "I (wait) for you when you arrive.", answer: "will be waiting", full: "I will be waiting for you when you arrive." }
      ]
    }
  },
  {
    name: "Future Perfect",
    formula: "will + have + V3 + O",
    ex: "I will have eaten an apple.",
    ur: "میں کھا چکا ہوں گا۔",
    when: "Action that will be COMPLETED BEFORE a specific future time. With 'by', 'before', 'by the time'.",
    mistakes: [
      "❌ 'I will have eat' (correct: 'I will have eaten').",
      "❌ Confusing with Future Indefinite — Perfect = completion before a future point."
    ],
    practice: {
      mcq: [
        { q: "By next year, I ___ my degree.", opts: ["will complete","will have completed","complete","am completing"], a: 1, why: "By + future time = Future Perfect." },
        { q: "By 8 PM, she ___ dinner.", opts: ["will cook","will have cooked","cooks","is cooking"], a: 1, why: "By a specific future time → will have + V3." },
        { q: "I ___ this book by Friday.", opts: ["will finish","will have finished","finish","am finishing"], a: 1, why: "By + time + completion → Future Perfect." },
        { q: "Before you come, I ___ the work.", opts: ["will do","will have done","do","am doing"], a: 1, why: "Before + future point = Future Perfect." },
        { q: "By the time he arrives, she ___ cooking.", opts: ["will start","will have started","starts","is starting"], a: 1, why: "By the time + completion before → Future Perfect." }
      ],
      fill: [
        { hint: "By 5 PM, I (finish) the report.", answer: "will have finished", full: "By 5 PM, I will have finished the report." },
        { hint: "She (complete) her degree by 2027.", answer: "will have completed", full: "She will have completed her degree by 2027." },
        { hint: "Before you wake up, I (cook) breakfast.", answer: "will have cooked", full: "Before you wake up, I will have cooked breakfast." }
      ]
    }
  },
  {
    name: "Future Perfect Continuous",
    formula: "will + have + been + V-ing + O",
    ex: "I will have been eating an apple.",
    ur: "میں دیر تک کھا رہا ہوں گا۔",
    when: "Action CONTINUING for a DURATION up to a specific point in the future. Rarest tense — emphasize duration.",
    mistakes: [
      "❌ 'I will have been eat' (correct: 'I will have been eating').",
      "❌ Using for completed short actions — use Future Perfect instead."
    ],
    practice: {
      mcq: [
        { q: "By next July, I ___ here for 10 years.", opts: ["will work","will have worked","will have been working","will be working"], a: 2, why: "Duration up to a future point → Future Perfect Continuous." },
        { q: "By 9 PM, she ___ for 3 hours.", opts: ["will study","will have studied","will have been studying","will be studying"], a: 2, why: "For 3 hours + by 9 PM → Future Perfect Continuous." },
        { q: "When you come at 6, I ___ for 2 hours.", opts: ["will wait","will have waited","will have been waiting","will be waiting"], a: 2, why: "For 2 hours + at a future point → Future Perfect Continuous." },
        { q: "By December, they ___ on the project for 6 months.", opts: ["will work","will have worked","will have been working","worked"], a: 2, why: "Duration up to a future time → FPC." },
        { q: "In 2028, I ___ for this company for 5 years.", opts: ["will work","will have been working","worked","work"], a: 1, why: "For 5 years (in future) → FPC." }
      ],
      fill: [
        { hint: "By next year, I (study) for 4 years.", answer: "will have been studying", full: "By next year, I will have been studying for 4 years." },
        { hint: "By 10 PM, she (work) for 6 hours.", answer: "will have been working", full: "By 10 PM, she will have been working for 6 hours." },
        { hint: "When you retire, I (teach) for 30 years.", answer: "will have been teaching", full: "When you retire, I will have been teaching for 30 years." }
      ]
    }
  }
];

/* ============================================================
   STATE
   ============================================================ */

const EL_STATE = {
  section: "home",   // home | ws | spoken | tenses
  ws: {
    level: 0,
    grid: [],
    placements: [],
    found: {},
    selStart: null,
    selEnd: null,
    dragging: false
  },
  tenses: {
    activeIdx: 0,
    mode: "theory",  // theory | mcq | fill
    mcqIdx: 0,
    mcqScore: 0,
    fillIdx: 0,
    fillScore: 0
  }
};

const EL_STORAGE_KEY = "ahw.englishLab.v1";

function elLoadProgress() {
  try {
    const raw = localStorage.getItem(EL_STORAGE_KEY);
    if (raw) return JSON.parse(raw) || {};
  } catch (e) {}
  return {};
}
function elSaveProgress(p) {
  try { localStorage.setItem(EL_STORAGE_KEY, JSON.stringify(p || {})); } catch (e) {}
}
function elClearProgress() {
  try { localStorage.removeItem(EL_STORAGE_KEY); } catch (e) {}
}

/* ============================================================
   TTS
   ============================================================ */

function elSpeak(text, rate) {
  try {
    if (!("speechSynthesis" in window)) {
      flashToast("🔇 TTS not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate || 1.0;
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn("TTS error:", e);
  }
}

/* ============================================================
   ENTRY / NAV
   ============================================================ */

function showEnglishLab() {
  EL_STATE.section = "home";
  renderEnglishLab();
  applyScreen("screen-english");
}

function elGo(section) {
  EL_STATE.section = section;
  if (section === "tenses") {
    EL_STATE.tenses.mode = "theory";
    EL_STATE.tenses.mcqIdx = 0;
    EL_STATE.tenses.mcqScore = 0;
    EL_STATE.tenses.fillIdx = 0;
    EL_STATE.tenses.fillScore = 0;
  }
  renderEnglishLab();
}

function elHome() {
  EL_STATE.section = "home";
  renderEnglishLab();
}

function renderEnglishLab() {
  const root = document.getElementById("englishBody");
  if (!root) return;
  if (EL_STATE.section === "home") root.innerHTML = elHtmlHome();
  else if (EL_STATE.section === "ws") root.innerHTML = elHtmlWordSearch();
  else if (EL_STATE.section === "spoken") root.innerHTML = elHtmlSpoken();
  else if (EL_STATE.section === "tenses") root.innerHTML = elHtmlTenses();
  const back = document.getElementById("elBackBtn");
  if (back) back.style.display = EL_STATE.section === "home" ? "none" : "";
  setTimeout(elInitScreen, 0);
}

/* ============================================================
   HOME
   ============================================================ */

function elHtmlHome() {
  const prog = elLoadProgress();
  const wsDone = Object.keys(prog.wsDone || {}).length;
  const tensesTheory = Object.keys(prog.tensesTheoryDone || {}).length;
  const tensesMcq = Object.keys(prog.tensesMcqBest || {}).length;
  const tensesFill = Object.keys(prog.tensesFillBest || {}).length;
  const spokenDone = Object.keys(prog.spokenListened || {}).length;
  return `
    <div class="big-title"><span class="grad">English Lab</span> · Master Edition</div>
    <p class="sub" style="text-align:center">Vocabulary · Pronunciation · Grammar — go from basics to <b>expert</b>.</p>

    <div class="el-stats">
      <div class="el-stat"><div class="el-stat-num">${wsDone}/12</div><div class="el-stat-lbl">Word Search levels</div></div>
      <div class="el-stat"><div class="el-stat-num">${spokenDone}/40</div><div class="el-stat-lbl">Phrases listened</div></div>
      <div class="el-stat"><div class="el-stat-num">${tensesTheory}/12</div><div class="el-stat-lbl">Tenses theory</div></div>
      <div class="el-stat"><div class="el-stat-num">${tensesMcq+tensesFill}/24</div><div class="el-stat-lbl">Tenses practice</div></div>
    </div>

    <div class="feature-grid">
      <div class="feature" onclick="elGo('ws')" style="cursor:pointer">
        <span class="fe">🔤</span>Word Search<br><span style="font-size:11px;color:#8a83a8">12 levels · drag-to-select</span>
      </div>
      <div class="feature" onclick="elGo('spoken')" style="cursor:pointer">
        <span class="fe">🗣️</span>Spoken English<br><span style="font-size:11px;color:#8a83a8">40 phrases · 3 speeds</span>
      </div>
      <div class="feature" onclick="elGo('tenses')" style="cursor:pointer">
        <span class="fe">⏰</span>Tenses Mastery<br><span style="font-size:11px;color:#8a83a8">theory + MCQ + fill</span>
      </div>
    </div>
    <div class="btn-row" style="margin-top:20px">
      <button class="btn btn-gray" onclick="elResetProgress()">🗑️ Reset Progress</button>
    </div>
  `;
}

function elResetProgress() {
  if (confirm("Reset ALL English Lab progress?")) {
    elClearProgress();
    renderEnglishLab();
    flashToast("✅ Progress reset");
  }
}

/* ============================================================
   WORD SEARCH — with DRAG selection
   ============================================================ */

function elHtmlWordSearch() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const found = EL_STATE.ws.found;
  const diff = lvl.diff;
  const diffColor = {E:"#34d15f",M:"#facc15",H:"#f97316",X:"#ef4444"}[diff];
  return `
    <div class="big-title" style="font-size:24px"><span class="grad">Word Search</span></div>
    <div class="sub ws-sub" style="text-align:center">
      <b>${lvl.name}</b> &nbsp;
      <span class="ws-diff" style="background:${diffColor}">${diff==="E"?"Easy":diff==="M"?"Medium":diff==="H"?"Hard":"Expert"}</span>
      &nbsp; · Drag across letters to select · found words show Urdu + TTS
    </div>

    <div class="ws-level-bar">
      ${WS_LEVELS.map((L, i) => {
        const isCur = i === EL_STATE.ws.level;
        const isDone = !!(elLoadProgress().wsDone || {})[i];
        return `<button class="ws-lvl-pill ${isCur?'on':''} ${isDone?'done':''}" onclick="elSelectLevel(${i})" title="${L.name}">${i+1}${isDone?' ✓':''}</button>`;
      }).join("")}
    </div>

    <div class="ws-grid" id="wsGrid"></div>
    <div class="ws-found-title">Found words <span class="ws-found-count">${Object.keys(found).length}/${lvl.words.length}</span></div>
    <div class="ws-found-list" id="wsFoundList"></div>
    <div id="wsToast" class="ws-toast"></div>

    <div class="btn-row">
      <button class="btn btn-blue" onclick="elWsHint()">💡 Hint</button>
      <button class="btn btn-orange" onclick="elWsNewGrid()">🔄 New Grid</button>
      <button class="btn btn-purple" onclick="elWsShowList()">📜 List</button>
      <button class="btn btn-green" onclick="elWsNext()">Next ➜</button>
    </div>
  `;
}

function elSelectLevel(i) {
  EL_STATE.ws.level = i;
  EL_STATE.ws.found = {};
  EL_STATE.ws.selStart = null;
  EL_STATE.ws.selEnd = null;
  elWsNewGrid();
}

function elWsNewGrid() {
  const SIZE = 8;
  EL_STATE.ws.grid = [];
  EL_STATE.ws.placements = [];
  EL_STATE.ws.found = {};
  EL_STATE.ws.selStart = null;
  EL_STATE.ws.selEnd = null;
  for (let r = 0; r < SIZE; r++) EL_STATE.ws.grid.push(new Array(SIZE).fill(""));
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const directions = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
  for (const item of lvl.words) {
    const w = item.w.toUpperCase();
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const sr = Math.floor(Math.random() * SIZE);
      const sc = Math.floor(Math.random() * SIZE);
      const er = sr + dir[0] * (w.length - 1);
      const ec = sc + dir[1] * (w.length - 1);
      if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) continue;
      let ok = true;
      const cells = [];
      for (let k = 0; k < w.length; k++) {
        const r = sr + dir[0] * k;
        const c = sc + dir[1] * k;
        const cur = EL_STATE.ws.grid[r][c];
        if (cur && cur !== w[k]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (!ok) continue;
      for (let k = 0; k < w.length; k++) {
        const r = sr + dir[0] * k;
        const c = sc + dir[1] * k;
        EL_STATE.ws.grid[r][c] = w[k];
      }
      EL_STATE.ws.placements.push({ word: w, cells, dir });
      placed = true;
    }
  }
  const FILL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!EL_STATE.ws.grid[r][c]) EL_STATE.ws.grid[r][c] = FILL[Math.floor(Math.random()*FILL.length)];
  renderEnglishLab();
}

function elRenderGrid() {
  const grid = document.getElementById("wsGrid");
  if (!grid) return;
  const SIZE = 8;
  let html = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const ch = EL_STATE.ws.grid[r][c];
      let cls = "ws-cell";
      if (isCellFound(r, c)) cls += " found";
      if (EL_STATE.ws.selStart && EL_STATE.ws.selStart[0] === r && EL_STATE.ws.selStart[1] === c) cls += " sel-start";
      if (EL_STATE.ws.selEnd && EL_STATE.ws.selEnd[0] === r && EL_STATE.ws.selEnd[1] === c) cls += " sel-end";
      if (isCellInLine(r, c)) cls += " in-line";
      html += `<div class="${cls}" data-r="${r}" data-c="${c}">${ch}</div>`;
    }
  }
  grid.innerHTML = html;
  elRenderFound();
}

function isCellFound(r, c) {
  for (const k in EL_STATE.ws.found) {
    const cells = EL_STATE.ws.found[k].cells;
    for (const cell of cells) if (cell[0] === r && cell[1] === c) return true;
  }
  return false;
}

function isCellInLine(r, c) {
  if (!EL_STATE.ws.selStart || !EL_STATE.ws.selEnd) return false;
  const line = getLineCells(EL_STATE.ws.selStart, EL_STATE.ws.selEnd);
  for (const cell of line) if (cell[0] === r && cell[1] === c) return true;
  return false;
}

function getLineCells(a, b) {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [a];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [a];
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  const cells = [];
  for (let k = 0; k <= steps; k++) cells.push([a[0] + sr * k, a[1] + sc * k]);
  return cells;
}

function getSelectedWord() {
  if (!EL_STATE.ws.selStart || !EL_STATE.ws.selEnd) return "";
  const cells = getLineCells(EL_STATE.ws.selStart, EL_STATE.ws.selEnd);
  return cells.map(c => EL_STATE.ws.grid[c[0]][c[1]]).join("");
}

function elCellDown(r, c) {
  EL_STATE.ws.selStart = [r, c];
  EL_STATE.ws.selEnd = [r, c];
  EL_STATE.ws.dragging = true;
  elRenderGrid();
}
function elCellEnter(r, c) {
  if (!EL_STATE.ws.dragging) return;
  EL_STATE.ws.selEnd = [r, c];
  elRenderGrid();
}
function elCellUp() {
  if (!EL_STATE.ws.dragging) return;
  EL_STATE.ws.dragging = false;
  elWsCheck();
  setTimeout(() => {
    EL_STATE.ws.selStart = null;
    EL_STATE.ws.selEnd = null;
    elRenderGrid();
  }, 700);
}

function elWsCheck() {
  const word = getSelectedWord();
  if (!word || word.length < 2) return;
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const match = lvl.words.find(x => x.w === word);
  if (match) {
    if (EL_STATE.ws.found[word]) {
      flashToast("Already found!");
      return;
    }
    const cells = getLineCells(EL_STATE.ws.selStart, EL_STATE.ws.selEnd);
    EL_STATE.ws.found[word] = { meaning: match.meaning, urdu: match.urdu, ex: match.ex, cells };
    flashToast(`✅ ${word} — ${match.meaning} (${match.urdu})`);
    elSpeak(word, 0.9);
    elCheckLevelComplete();
  } else {
    flashToast("❌ Not in this level");
  }
}

function elCheckLevelComplete() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  if (Object.keys(EL_STATE.ws.found).length >= lvl.words.length) {
    setTimeout(() => {
      flashToast(`🎉 Level complete!`);
      elSpeak("Level complete! Well done.", 1.0);
      const prog = elLoadProgress();
      prog.wsDone = prog.wsDone || {};
      prog.wsDone[EL_STATE.ws.level] = true;
      elSaveProgress(prog);
    }, 800);
  }
}

function elRenderFound() {
  const list = document.getElementById("wsFoundList");
  if (!list) return;
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  list.innerHTML = lvl.words.map(item => {
    const f = EL_STATE.ws.found[item.w];
    if (f) {
      return `<div class="ws-chip found" onclick="elSpeak('${item.w}', 0.9)">
        <span class="ws-chip-en">${item.w}</span>
        <span class="ws-chip-ur" dir="rtl">${item.urdu}</span>
        <span class="ws-chip-mean">${item.meaning}</span>
        <span class="ws-chip-ex">"${escapeHtml(item.ex)}"</span>
      </div>`;
    }
    return `<div class="ws-chip">
        <span class="ws-chip-en">${item.w}</span>
        <span class="ws-chip-ur" dir="rtl">${item.urdu}</span>
      </div>`;
  }).join("");
}

function elWsHint() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const unfound = lvl.words.find(x => !EL_STATE.ws.found[x.w]);
  if (!unfound) { flashToast("All words found! 🎉"); return; }
  const placement = EL_STATE.ws.placements.find(p => p.word === unfound.w);
  if (!placement) return;
  const [r, c] = placement.cells[0];
  flashToast(`💡 First letter: ${unfound.w[0]} at row ${r+1}, col ${c+1}`);
  elSpeak(unfound.w[0], 0.9);
}

function elWsNext() {
  if (EL_STATE.ws.level < WS_LEVELS.length - 1) {
    EL_STATE.ws.level++;
    elWsNewGrid();
  } else {
    flashToast("🏆 All 12 levels complete! Expert level reached!");
  }
}

function elWsShowList() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const list = lvl.words.map(w => `${w.w} — ${w.meaning} (${w.urdu})`).join("\n");
  const ex = lvl.words[0] ? `\n\nExample: "${lvl.words[0].ex}"` : "";
  alert(`📜 Words in this level:\n\n${list}${ex}`);
}

/* ============================================================
   SPOKEN ENGLISH
   ============================================================ */

function elHtmlSpoken() {
  const prog = elLoadProgress();
  const listened = prog.spokenListened || {};
  const cats = [...new Set(SPOKEN_PHRASES.map(p => p.cat))];
  const spokenByCat = {};
  for (const p of SPOKEN_PHRASES) {
    if (!spokenByCat[p.cat]) spokenByCat[p.cat] = [];
    spokenByCat[p.cat].push(p);
  }
  return `
    <div class="big-title" style="font-size:24px"><span class="grad">Spoken English</span></div>
    <p class="sub" style="text-align:center">🔊 Normal · 🐢 Slow (0.6x) · 🦥 Very Slow (0.4x) — tap a card to mark it "mastered".</p>
    ${cats.map(cat => `
      <div class="spoken-cat-head">${cat}</div>
      <div class="spoken-list">
        ${spokenByCat[cat].map(p => {
          const idx = SPOKEN_PHRASES.indexOf(p);
          const isDone = !!listened[idx];
          return `<div class="spoken-card ${isDone?'done':''}" onclick="elSpeak('${escapeAttr(p.en)}', 1.0)">
            <div class="spoken-en">${escapeHtml(p.en)}</div>
            <div class="spoken-ur" dir="rtl">${escapeHtml(p.ur)}</div>
            <div class="spoken-btns">
              <button class="btn btn-green btn-sm" onclick="event.stopPropagation();elSpeak('${escapeAttr(p.en)}', 1.0)">🔊 Normal</button>
              <button class="btn btn-orange btn-sm" onclick="event.stopPropagation();elSpeak('${escapeAttr(p.en)}', 0.6)">🐢 Slow</button>
              <button class="btn btn-purple btn-sm" onclick="event.stopPropagation();elSpeak('${escapeAttr(p.en)}', 0.4)">🦥 V.Slow</button>
              <button class="btn btn-pink btn-sm" onclick="event.stopPropagation();elMarkSpoken(${idx})">${isDone?'✅':'⭐'} Mark</button>
            </div>
          </div>`;
        }).join("")}
      </div>
    `).join("")}
  `;
}

function elMarkSpoken(idx) {
  const prog = elLoadProgress();
  prog.spokenListened = prog.spokenListened || {};
  prog.spokenListened[idx] = true;
  elSaveProgress(prog);
  renderEnglishLab();
  flashToast("✅ Phrase marked as practiced");
}

/* ============================================================
   TENSES MASTERY — 3 modes per tense
   ============================================================ */

function elHtmlTenses() {
  const idx = EL_STATE.tenses.activeIdx;
  const t = TENSES[idx];
  const mode = EL_STATE.tenses.mode;
  const prog = elLoadProgress();
  const theoryDone = (prog.tensesTheoryDone || {})[idx];
  const mcqBest = (prog.tensesMcqBest || {})[idx] || 0;
  const fillBest = (prog.tensesFillBest || {})[idx] || 0;
  return `
    <div class="big-title" style="font-size:24px"><span class="grad">Tenses Mastery</span></div>
    <div class="tense-tabs">
      <button class="tense-tab ${mode==='theory'?'on':''}" onclick="elTenseMode('theory')">📖 Theory</button>
      <button class="tense-tab ${mode==='mcq'?'on':''}" onclick="elTenseMode('mcq')">✅ MCQ (${mcqBest}/5)</button>
      <button class="tense-tab ${mode==='fill'?'on':''}" onclick="elTenseMode('fill')">✍️ Fill (${fillBest}/3)</button>
    </div>

    <div class="tense-pager">
      <button class="tense-nav" onclick="elTensePrev()" ${idx===0?'disabled':''}>◀ Prev</button>
      <div class="tense-pager-num">${idx+1} / ${TENSES.length}</div>
      <button class="tense-nav" onclick="elTenseNext()" ${idx===TENSES.length-1?'disabled':''}>Next ▶</button>
    </div>

    <div class="tense-pills">
      ${TENSES.map((tt, i) => {
        const isCur = i === idx;
        const isDone = !!(prog.tensesTheoryDone || {})[i];
        return `<button class="tense-pill ${isCur?'on':''} ${isDone?'done':''}" onclick="elTenseGoto(${i})">${i+1}${isDone?' ✓':''}</button>`;
      }).join("")}
    </div>

    ${mode==='theory' ? elHtmlTenseTheory(t, theoryDone) : ''}
    ${mode==='mcq'    ? elHtmlTenseMcq(t)            : ''}
    ${mode==='fill'   ? elHtmlTenseFill(t)           : ''}
  `;
}

function elHtmlTenseTheory(t, theoryDone) {
  return `
    <div class="tense-card big">
      <div class="tense-name">${t.name}</div>
      <div class="tense-formula"><b>Formula:</b> ${escapeHtml(t.formula)}</div>
      <div class="tense-ex">${escapeHtml(t.ex)} <button class="btn btn-green btn-sm" onclick="elSpeak('${escapeAttr(t.ex)}', 1.0)">🔊</button> <button class="btn btn-orange btn-sm" onclick="elSpeak('${escapeAttr(t.ex)}', 0.6)">🐢</button></div>
      <div class="tense-ur" dir="rtl">${escapeHtml(t.ur)}</div>
      <div class="tense-when"><b>🎯 When to use:</b> ${escapeHtml(t.when)}</div>
      <div class="tense-mistakes">
        <b>⚠️ Common mistakes:</b>
        <ul>${t.mistakes.map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ul>
      </div>
      <div class="btn-row" style="margin-top:10px">
        <button class="btn btn-green" onclick="elTenseMarkTheory()">${theoryDone?'✅ Reviewed':'✓ Mark as reviewed'}</button>
      </div>
    </div>
  `;
}

function elHtmlTenseMcq(t) {
  const idx = EL_STATE.tenses.mcqIdx;
  const q = t.practice.mcq[idx];
  if (!q) {
    const sc = EL_STATE.tenses.mcqScore;
    const prog = elLoadProgress();
    prog.tensesMcqBest = prog.tensesMcqBest || {};
    const prev = prog.tensesMcqBest[EL_STATE.tenses.activeIdx] || 0;
    if (sc > prev) { prog.tensesMcqBest[EL_STATE.tenses.activeIdx] = sc; elSaveProgress(prog); }
    return `<div class="tense-card big center">
      <div style="font-size:48px">🏆</div>
      <div class="tense-name">MCQ Practice Complete!</div>
      <div class="tense-ex">Score: <b>${sc} / 5</b></div>
      <div class="tense-ur" dir="rtl">${sc===5?'بہت عمدہ! آپ نے سب صحیح کیے!':sc>=3?'اچھی کوشش! ایک بار پھر practice کریں۔':'دوبارہ theory پڑھیں اور try کریں۔'}</div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-green" onclick="elTenseRestartMcq()">🔄 Try Again</button>
        <button class="btn btn-purple" onclick="elTenseMode('theory')">📖 Review Theory</button>
      </div>
    </div>`;
  }
  return `<div class="tense-card big">
    <div class="tense-name">${t.name} — MCQ ${idx+1}/5</div>
    <div class="tense-ex">${escapeHtml(q.q)}</div>
    <div class="mcq-opts" id="mcqOpts">
      ${q.opts.map((o, i) => `<button class="mcq-opt" data-i="${i}" onclick="elMcqAnswer(${i}, this)">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join("")}
    </div>
    <div id="mcqFb" class="mcq-fb"></div>
  </div>`;
}

function elMcqAnswer(i, btn) {
  const idx = EL_STATE.tenses.activeIdx;
  const t = TENSES[idx];
  const q = t.practice.mcq[EL_STATE.tenses.mcqIdx];
  const opts = document.querySelectorAll("#mcqOpts .mcq-opt");
  opts.forEach((o, j) => {
    o.disabled = true;
    if (j === q.a) o.classList.add("correct");
    if (j === i && i !== q.a) o.classList.add("wrong");
  });
  const fb = document.getElementById("mcqFb");
  if (i === q.a) {
    EL_STATE.tenses.mcqScore++;
    fb.innerHTML = `✅ <b>Correct!</b> ${escapeHtml(q.why)}`;
    fb.className = "mcq-fb ok";
    elSpeak(q.q + " " + q.opts[q.a], 1.0);
  } else {
    fb.innerHTML = `❌ Wrong. Correct: <b>${escapeHtml(q.opts[q.a])}</b>. ${escapeHtml(q.why)}`;
    fb.className = "mcq-fb no";
    elSpeak(q.q + " " + q.opts[q.a], 0.7);
  }
  setTimeout(() => {
    EL_STATE.tenses.mcqIdx++;
    renderEnglishLab();
  }, 2200);
}

function elTenseRestartMcq() {
  EL_STATE.tenses.mcqIdx = 0;
  EL_STATE.tenses.mcqScore = 0;
  renderEnglishLab();
}

function elHtmlTenseFill(t) {
  const idx = EL_STATE.tenses.fillIdx;
  const q = t.practice.fill[idx];
  if (!q) {
    const sc = EL_STATE.tenses.fillScore;
    const prog = elLoadProgress();
    prog.tensesFillBest = prog.tensesFillBest || {};
    const prev = prog.tensesFillBest[EL_STATE.tenses.activeIdx] || 0;
    if (sc > prev) { prog.tensesFillBest[EL_STATE.tenses.activeIdx] = sc; elSaveProgress(prog); }
    return `<div class="tense-card big center">
      <div style="font-size:48px">${sc===3?'🏆':sc>=2?'🎯':'💪'}</div>
      <div class="tense-name">Fill Practice Complete!</div>
      <div class="tense-ex">Score: <b>${sc} / 3</b></div>
      <div class="tense-ur" dir="rtl">${sc===3?'کامل! آپ expert ہیں!':sc>=1?'اچھی شروعات! Continue practicing.':'Theory دوبارہ پڑھیں۔'}</div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-green" onclick="elTenseRestartFill()">🔄 Try Again</button>
        <button class="btn btn-purple" onclick="elTenseMode('theory')">📖 Theory</button>
      </div>
    </div>`;
  }
  return `<div class="tense-card big">
    <div class="tense-name">${t.name} — Fill ${idx+1}/3</div>
    <div class="tense-ex">${escapeHtml(q.hint)}</div>
    <input id="fillIn" class="fill-input" type="text" placeholder="Type the correct verb form..." spellcheck="false" autocomplete="off">
    <div class="btn-row" style="margin-top:8px">
      <button class="btn btn-green" onclick="elFillCheck()">✅ Check</button>
      <button class="btn btn-blue" onclick="document.getElementById('fillIn').value='';elSpeak('${escapeAttr(t.ex)}', 0.7)">💡 Hint (TTS)</button>
    </div>
    <div id="fillFb" class="mcq-fb"></div>
  </div>`;
}

function elFillCheck() {
  const idx = EL_STATE.tenses.activeIdx;
  const t = TENSES[idx];
  const q = t.practice.fill[EL_STATE.tenses.fillIdx];
  const v = (document.getElementById("fillIn").value || "").trim().toLowerCase();
  const ans = q.answer.toLowerCase();
  const fb = document.getElementById("fillFb");
  if (v === ans) {
    EL_STATE.tenses.fillScore++;
    fb.innerHTML = `✅ <b>Correct!</b> Full sentence: <i>${escapeHtml(q.full)}</i>`;
    fb.className = "mcq-fb ok";
    elSpeak(q.full, 1.0);
  } else {
    fb.innerHTML = `❌ Not quite. Correct: <b>${escapeHtml(q.answer)}</b><br>Full: <i>${escapeHtml(q.full)}</i>`;
    fb.className = "mcq-fb no";
    elSpeak(q.full, 0.6);
  }
  setTimeout(() => {
    EL_STATE.tenses.fillIdx++;
    renderEnglishLab();
  }, 2400);
}

function elTenseRestartFill() {
  EL_STATE.tenses.fillIdx = 0;
  EL_STATE.tenses.fillScore = 0;
  renderEnglishLab();
}

function elTenseMode(m) {
  EL_STATE.tenses.mode = m;
  if (m === "mcq")  { EL_STATE.tenses.mcqIdx  = 0; EL_STATE.tenses.mcqScore  = 0; }
  if (m === "fill") { EL_STATE.tenses.fillIdx = 0; EL_STATE.tenses.fillScore = 0; }
  renderEnglishLab();
}
function elTenseGoto(i) {
  EL_STATE.tenses.activeIdx = i;
  EL_STATE.tenses.mcqIdx = 0; EL_STATE.tenses.mcqScore = 0;
  EL_STATE.tenses.fillIdx = 0; EL_STATE.tenses.fillScore = 0;
  renderEnglishLab();
}
function elTenseNext() { if (EL_STATE.tenses.activeIdx < TENSES.length-1) elTenseGoto(EL_STATE.tenses.activeIdx+1); }
function elTensePrev() { if (EL_STATE.tenses.activeIdx > 0) elTenseGoto(EL_STATE.tenses.activeIdx-1); }
function elTenseMarkTheory() {
  const prog = elLoadProgress();
  prog.tensesTheoryDone = prog.tensesTheoryDone || {};
  prog.tensesTheoryDone[EL_STATE.tenses.activeIdx] = true;
  elSaveProgress(prog);
  flashToast("✅ Marked as reviewed");
  renderEnglishLab();
}

/* ============================================================
   HELPERS
   ============================================================ */

function flashToast(msg) {
  try {
    const t = typeof document !== "undefined" && document.getElementById("wsToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(flashToast._t);
    flashToast._t = setTimeout(() => t.classList.remove("show"), 1800);
  } catch (e) {}
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s) { return escapeHtml(s).replace(/'/g, "&#39;"); }

/* ============================================================
   INIT — wire drag handlers on the word-search grid
   ============================================================ */

function elInitScreen() {
  const grid = document.getElementById("wsGrid");
  if (grid && !grid._wired) {
    grid._wired = true;
    let pressed = false;
    // mouse
    grid.addEventListener("mousedown", e => {
      const cell = e.target.closest(".ws-cell");
      if (!cell) return;
      e.preventDefault();
      pressed = true;
      elCellDown(parseInt(cell.dataset.r, 10), parseInt(cell.dataset.c, 10));
    });
    grid.addEventListener("mouseover", e => {
      if (!pressed) return;
      const cell = e.target.closest(".ws-cell");
      if (!cell) return;
      elCellEnter(parseInt(cell.dataset.r, 10), parseInt(cell.dataset.c, 10));
    });
    document.addEventListener("mouseup", () => {
      if (pressed) { pressed = false; elCellUp(); }
    });
    // touch
    grid.addEventListener("touchstart", e => {
      const cell = e.target.closest(".ws-cell");
      if (!cell) return;
      e.preventDefault();
      pressed = true;
      elCellDown(parseInt(cell.dataset.r, 10), parseInt(cell.dataset.c, 10));
    }, { passive: false });
    grid.addEventListener("touchmove", e => {
      if (!pressed) return;
      const t = e.touches[0];
      if (!t) return;
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (!el) return;
      const cell = el.closest(".ws-cell");
      if (!cell) return;
      e.preventDefault();
      elCellEnter(parseInt(cell.dataset.r, 10), parseInt(cell.dataset.c, 10));
    }, { passive: false });
    grid.addEventListener("touchend", () => {
      if (pressed) { pressed = false; elCellUp(); }
    });
    grid.addEventListener("touchcancel", () => {
      if (pressed) { pressed = false; elCellUp(); }
    });
  }
  // initial paint
  if (EL_STATE.section === "ws") {
    if (!EL_STATE.ws.grid || EL_STATE.ws.grid.length === 0) elWsNewGrid();
    else elRenderGrid();
  }
}
