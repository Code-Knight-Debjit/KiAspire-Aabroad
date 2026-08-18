// Generic admin-editable content table, reusing the free_study_countries
// pattern (markdown body, rendered+sanitized at request time — see
// ARCHITECTURE.md section 4a) across every new content area added in this
// round of work: Visa Services (Student/Visitor tabs), Test Preparation
// (7 tests), Language Classes (3 languages), and the Europe landing page.
// One shared table with a "category" discriminator instead of four
// near-identical sibling tables — same columns, same admin CRUD shape,
// just scoped by category + slug.
exports.up = function (knex) {
  return knex.schema.createTable("content_pages", (table) => {
    table.increments("id").primary();
    table.text("category").notNullable();
    table.text("slug").notNullable();
    table.text("title").notNullable();
    table.text("summary").notNullable().defaultTo("");
    // Intro/overview body, authored as Markdown.
    table.text("content_markdown").notNullable().defaultTo("");
    // Named sub-sections (e.g. "Batch Timings", "Fees", "Syllabus"), each
    // with its own Markdown body — array of {key, label, bodyMarkdown}.
    // JSONB rather than a child table: sections are always read/written as
    // a whole with their parent page, never queried individually.
    table.jsonb("sections").nullable();
    table.text("hero_image_url").nullable();
    table.boolean("is_published").notNullable().defaultTo(false);
    table.integer("sort_order").notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.unique(["category", "slug"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("content_pages");
};
