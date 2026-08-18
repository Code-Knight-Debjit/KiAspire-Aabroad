// Admin-configurable home page destination order (CLAUDE.md Phase 0.3/0.4).
// Reuses the existing generic site_settings key/value editor rather than
// building bespoke UI — value is a JSON array of slugs matching the
// data-slug attributes on each destination card in index.html. The default
// order below is the client-flagged suggestion (open item #1 in the phase
// prompt): USA -> UK -> Canada -> Australia -> Germany -> Europe ->
// New Zealand -> remaining destinations alphabetically (Dubai, Singapore).
// Not final — flagged for Debjit's review.
exports.seed = async function (knex) {
  await knex("site_settings")
    .insert({
      key: "home_country_order",
      value: JSON.stringify([
        "us",
        "uk",
        "canada",
        "australia",
        "germany",
        "europe",
        "new-zealand",
        "dubai",
        "singapore",
      ]),
      label:
        "Home page destination order (JSON array of slugs — not final, flagged for review)",
    })
    .onConflict("key")
    .ignore();
};
