// Seeds the 5 services named explicitly in CLAUDE.md's business context.
// Book a Consultation is the one "external_redirect" service (see
// ARCHITECTURE.md section 5); the rest are plain forms with no field
// definitions yet — those are added by an admin later, except Study
// Abroad's two CLAUDE.md-mandated fields, seeded separately (04_*).
const SERVICES = [
  {
    name: "Study Abroad",
    slug: "study-abroad",
    kind: "form",
    sort_order: 1,
  },
  {
    name: "Book a Consultation",
    slug: "book-a-consultation",
    kind: "external_redirect",
    redirect_url: "https://cal.com/code-knight-debjit/discovery-call",
    sort_order: 2,
  },
  {
    name: "Test Prep (IELTS/TOEFL/GRE)",
    slug: "test-prep",
    kind: "form",
    sort_order: 3,
  },
  {
    name: "Career Counselling",
    slug: "career-counselling",
    kind: "form",
    sort_order: 4,
  },
  {
    name: "Loan / Financial Assistance",
    slug: "loan-financial-assistance",
    kind: "form",
    sort_order: 5,
  },
];

exports.seed = async function (knex) {
  await knex("services")
    .insert(
      SERVICES.map((service) => ({
        name: service.name,
        slug: service.slug,
        kind: service.kind,
        redirect_url: service.redirect_url || null,
        sort_order: service.sort_order,
      }))
    )
    .onConflict("slug")
    .ignore();
};
