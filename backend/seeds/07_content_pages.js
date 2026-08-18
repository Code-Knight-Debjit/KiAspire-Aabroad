// Seeds starter/admin-editable content for every new content area added in
// this round of work — Visa Services (Student/Visitor tabs), Test
// Preparation (7 tests), Language Classes (3 languages), and the Europe
// landing page — all living in the shared `content_pages` table (see
// migration 20260810000010). Per CLAUDE.md's instruction, none of this copy
// was supplied by the client, so it's written as clearly-editable starter
// content (process overviews, generic checklists, standard test facts)
// rather than invented pricing/schedules — admin fills in real batch
// timings and fees from the Content Pages panel.
const sections = (entries) =>
  entries.map(([key, label, bodyMarkdown]) => ({ key, label, bodyMarkdown }));

const VISA_PAGES = [
  {
    slug: "student-visa",
    title: "Student Visa",
    summary:
      "Everything from documentation to interview prep for the visa that gets you onto campus.",
    contentMarkdown:
      "A student visa is the last real gate between an offer letter and a flight booking. We manage the paperwork, the timeline, and the interview prep so a documentation gap doesn't cost you an intake.",
    sections: sections([
      [
        "process_overview",
        "Process Overview",
        "1. Confirm your unconditional offer and CAS/I-20/equivalent from your university.\n2. Assemble financial and academic documentation.\n3. Complete the online visa application for your destination country.\n4. Book and attend biometrics/interview where required.\n5. Track the decision and plan travel once approved.",
      ],
      [
        "document_checklist",
        "Document Checklist",
        "- Valid passport\n- University offer letter / CAS / I-20 (as applicable)\n- Academic transcripts and certificates\n- Proof of funds / financial sponsorship\n- English proficiency test scores\n- Passport-size photographs\n- Visa application form and fee receipt",
      ],
      [
        "fees_timeline",
        "Fees & Timeline",
        "Visa fees and processing timelines are set by each country's immigration authority and change periodically. Your counsellor will confirm the current fee and expected turnaround for your specific destination once your application is underway.",
      ],
    ]),
    sortOrder: 1,
  },
  {
    slug: "visitor-visa",
    title: "Visitor Visa",
    summary:
      "For campus visits, family accompaniment, or short trips alongside a study abroad plan.",
    contentMarkdown:
      "A visitor visa is often the fastest way to see a campus, attend an orientation, or accompany a student before their own visa comes through. The paperwork is lighter than a student visa but still worth getting right the first time.",
    sections: sections([
      [
        "process_overview",
        "Process Overview",
        "1. Confirm the purpose and length of your visit.\n2. Complete the visitor visa application for your destination country.\n3. Assemble supporting documentation.\n4. Attend an interview or biometrics appointment where required.\n5. Track the decision and finalize travel plans.",
      ],
      [
        "document_checklist",
        "Document Checklist",
        "- Valid passport\n- Visitor visa application form\n- Proof of purpose of visit (invitation letter, event confirmation, etc.)\n- Proof of funds for the trip\n- Travel and accommodation itinerary\n- Return travel intent (ties to home country)",
      ],
      [
        "fees_timeline",
        "Fees & Timeline",
        "Visitor visa fees and processing times vary by country and by how the application is lodged. Your counsellor will confirm current figures for your specific destination and travel dates.",
      ],
    ]),
    sortOrder: 2,
  },
];

const TEST_PREP_PAGES = [
  {
    slug: "ielts",
    title: "IELTS",
    summary: "The most widely accepted English test for UK, Australia, Canada and beyond.",
    facts: "Scored on a 0–9 band scale across Listening, Reading, Writing and Speaking.",
  },
  {
    slug: "toefl",
    title: "TOEFL",
    summary: "Widely accepted across US universities, scored on a 0–120 scale.",
    facts: "Scored 0–120 across Reading, Listening, Speaking and Writing, delivered as TOEFL iBT.",
  },
  {
    slug: "pte",
    title: "PTE",
    summary: "A fully computer-marked English test with fast turnaround, scored 10–90.",
    facts: "Scored 10–90 overall; results are typically available within a few days.",
  },
  {
    slug: "duolingo",
    title: "Duolingo English Test",
    summary: "A short, at-home English test increasingly accepted alongside IELTS/TOEFL.",
    facts: "Scored 10–160, taken online from home in about an hour, with results in 1–2 days.",
  },
  {
    slug: "sat",
    title: "SAT",
    summary: "The standard undergraduate admissions test for US universities.",
    facts: "Scored 400–1600 across Reading & Writing and Math sections.",
  },
  {
    slug: "gre",
    title: "GRE",
    summary: "The standard graduate admissions test, accepted well beyond just the US.",
    facts: "Verbal and Quantitative Reasoning are each scored 130–170, plus a separately scored Analytical Writing section.",
  },
  {
    slug: "gmat",
    title: "GMAT",
    summary: "The standard admissions test for MBA and business master's programs.",
    facts: "The current GMAT Focus Edition is scored 205–805 across Quantitative, Verbal, and Data Insights.",
  },
].map((test, index) => ({
  slug: test.slug,
  title: test.title,
  summary: test.summary,
  contentMarkdown: `${test.title} preparation with a fixed syllabus, timed practice, and a counsellor tracking your score against the bands your target universities actually ask for. ${test.facts}`,
  sections: sections([
    [
      "batch_timings",
      "Batch Timings",
      "Weekday and weekend batches run on a rolling basis. Contact your counsellor for the next available start date and a schedule that fits your target test date.",
    ],
    [
      "fees",
      "Fees",
      "Course fees depend on batch size and format (group vs. one-on-one). Ask your counsellor for the current fee structure and any bundled discounts with our counselling services.",
    ],
    [
      "syllabus",
      "Syllabus",
      `A structured syllabus covering every section of the ${test.title}, built around timed practice, targeted weak-area drilling, and full-length mock tests before your actual test date.`,
    ],
    [
      "sample_material",
      "Sample Material",
      "Sample question sets and a full-length practice test are shared once you enrol — ask your counsellor for a preview pack to gauge your starting level.",
    ],
  ]),
  sortOrder: index + 1,
}));

const LANGUAGE_PAGES = [
  {
    slug: "german",
    title: "German",
    summary: "Widely useful for Germany, Austria, and German-taught program pathways.",
    levels: "A1 through B2 (CEFR), aligned to what German universities and job-seeker visas typically ask for.",
  },
  {
    slug: "french",
    title: "French",
    summary: "Opens up France, Quebec (Canada), and other Francophone study destinations.",
    levels: "A1 through B2 (CEFR), preparing for DELF/DALF or TCF/TEF certification as needed.",
  },
  {
    slug: "japanese",
    title: "Japanese",
    summary: "For students and professionals targeting Japan's universities and job market.",
    levels: "Beginner through intermediate, building toward JLPT N5–N3.",
  },
].map((lang, index) => ({
  slug: lang.slug,
  title: lang.title,
  summary: lang.summary,
  contentMarkdown: `${lang.title} classes structured around the level you actually need for your destination — whether that's meeting a university's language requirement or getting comfortable with daily life after you land. ${lang.levels}`,
  sections: sections([
    [
      "levels_offered",
      "Levels Offered",
      lang.levels,
    ],
    [
      "schedule",
      "Schedule",
      "Weekday evening and weekend batches, run on a rolling basis. Ask your counsellor for the next start date.",
    ],
    [
      "fees",
      "Fees",
      "Fees vary by level and batch format (group vs. one-on-one) — ask your counsellor for the current fee structure.",
    ],
    [
      "certification",
      "Certification",
      `A certificate of completion is issued at the end of each level, alongside preparation for the relevant standardized ${lang.title} proficiency exam where applicable.`,
    ],
  ]),
  sortOrder: index + 1,
}));

const EUROPE_PAGE = {
  slug: "europe",
  title: "Europe",
  summary:
    "One region, many tuition-free and low-cost public university systems — a single starting point before you narrow down a country.",
  contentMarkdown: `Europe isn't one admissions system — it's dozens of them, several of which charge little to no tuition at public universities even for international students. Rather than list all ~44 countries, this page is a starting point: the shape of studying in Europe in general, with links to the specific countries we already cover in depth.

## Why students look at Europe

- **Tuition-free or low-cost public universities** in several countries — see our [Study Abroad for Free](/study-abroad-for-free.html) coverage of Germany, Austria, Italy, and the Netherlands.
- **English-taught programs** are increasingly common at the master's level, even in non-English-speaking countries.
- **Schengen-area travel** means a student based in one country can easily explore many others during their studies.
- **Shorter, more affordable master's degrees** compared to some other regions, particularly in Germany and the Netherlands.

## Countries we already cover in depth

- [Germany](countryPages/germany.html) — free tuition at public universities, plus an 18-month post-study work window.
- [United Kingdom](countryPages/uk.html) — one-year master's degrees and a graduate work visa route.
- Austria, Italy (including the University of Padua), and the Netherlands — see [Study Abroad for Free](/study-abroad-for-free.html) for country-specific write-ups.

Talk to a counsellor to figure out which European country actually fits your budget, course, and language comfort — "Europe" is a starting conversation, not a single application.`,
  sections: null,
  sortOrder: 1,
};

async function upsertPages(knex, category, pages) {
  for (const page of pages) {
    await knex("content_pages")
      .insert({
        category,
        slug: page.slug,
        title: page.title,
        summary: page.summary,
        content_markdown: page.contentMarkdown,
        sections: page.sections ? JSON.stringify(page.sections) : null,
        is_published: true,
        sort_order: page.sortOrder,
      })
      .onConflict(["category", "slug"])
      .ignore();
  }
}

exports.seed = async function (knex) {
  await upsertPages(knex, "visa", VISA_PAGES);
  await upsertPages(knex, "test_prep", TEST_PREP_PAGES);
  await upsertPages(knex, "language", LANGUAGE_PAGES);
  await upsertPages(knex, "europe", [EUROPE_PAGE]);
};
