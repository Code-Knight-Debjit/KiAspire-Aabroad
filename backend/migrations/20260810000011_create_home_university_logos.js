// Admin-configurable list backing the home page's auto-scrolling university
// logo strip (CLAUDE.md Phase 0). logo_url is nullable on purpose: no real
// logo image files have been supplied yet, so a NULL logo_url renders a
// text-badge placeholder on the frontend until an admin uploads/links a
// real asset — see the seed comment for the flagged starter list.
exports.up = function (knex) {
  return knex.schema.createTable("home_university_logos", (table) => {
    table.increments("id").primary();
    table.text("university_name").notNullable();
    table.text("country").notNullable().defaultTo("");
    table.text("logo_url").nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.integer("sort_order").notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("home_university_logos");
};
