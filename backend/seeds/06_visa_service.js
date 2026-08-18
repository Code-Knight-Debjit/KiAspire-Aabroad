// Adds "Visa Services" as a new top-level service (CLAUDE.md Phase 1),
// alongside the existing Study Abroad / Test Prep / Foreign Language
// Training / Career Counselling / Loan Assistance / Book a Consultation
// services from 03_services.js. Seeded with a minimal starter field set —
// same convention as Study Abroad's two mandated fields in
// 04_study_abroad_fields.js — since no exact field list was specified by
// the client; admin can add more from the Manage Services panel.
exports.seed = async function (knex) {
  await knex("services")
    .insert({
      name: "Visa Services",
      slug: "visa-services",
      kind: "form",
      description:
        "Student and visitor visa filing support — document prep, application review, and interview coaching, handled end to end.",
      sort_order: 7,
    })
    .onConflict("slug")
    .ignore();

  const visaService = await knex("services").where({ slug: "visa-services" }).first();

  if (!visaService) return;

  await knex("service_fields")
    .insert([
      {
        service_id: visaService.id,
        field_key: "visa_type",
        label: "Which visa do you need help with?",
        field_type: "select",
        allow_multiple: false,
        is_ordered: false,
        options: JSON.stringify([
          { label: "Student Visa", value: "student" },
          { label: "Visitor Visa", value: "visitor" },
        ]),
        is_required: true,
        sort_order: 1,
      },
      {
        service_id: visaService.id,
        field_key: "destination_country",
        label: "Destination country",
        field_type: "text",
        allow_multiple: false,
        is_ordered: false,
        options: null,
        is_required: true,
        placeholder: "e.g. United Kingdom",
        sort_order: 2,
      },
    ])
    .onConflict(["service_id", "field_key"])
    .ignore();
};
