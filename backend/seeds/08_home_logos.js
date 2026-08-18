// Seeds the home page's university logo strip (CLAUDE.md Phase 0.2).
// logo_url is left NULL for every row — no real logo image files were
// supplied, so the frontend renders a text-badge placeholder for each
// until an admin uploads/links real assets from the Home Logos panel
// (flagged in ARCHITECTURE.md-style open items, and again here).
const LOGOS = [
  // United Kingdom — a few well-known Russell Group members (see also
  // CLAUDE.md Phase 4.1 — flagged for Debjit's confirmation, not final).
  { university_name: "University of Oxford", country: "United Kingdom" },
  { university_name: "University of Cambridge", country: "United Kingdom" },
  { university_name: "Imperial College London", country: "United Kingdom" },
  { university_name: "UCL", country: "United Kingdom" },
  { university_name: "London School of Economics", country: "United Kingdom" },
  // United States — Ivy League
  { university_name: "Harvard University", country: "United States" },
  { university_name: "Yale University", country: "United States" },
  { university_name: "Princeton University", country: "United States" },
  { university_name: "Columbia University", country: "United States" },
  { university_name: "University of Pennsylvania", country: "United States" },
  { university_name: "Cornell University", country: "United States" },
  { university_name: "Brown University", country: "United States" },
  { university_name: "Dartmouth College", country: "United States" },
  // Australia — Group of Eight (Go8)
  { university_name: "University of Melbourne", country: "Australia" },
  { university_name: "University of Sydney", country: "Australia" },
  { university_name: "Australian National University", country: "Australia" },
  { university_name: "University of Queensland", country: "Australia" },
  { university_name: "UNSW Sydney", country: "Australia" },
  { university_name: "Monash University", country: "Australia" },
  { university_name: "University of Western Australia", country: "Australia" },
  { university_name: "University of Adelaide", country: "Australia" },
  // New Zealand
  { university_name: "University of Auckland", country: "New Zealand" },
  // Italy
  { university_name: "University of Padua", country: "Italy" },
  // Germany — one representative public university
  { university_name: "Technical University of Munich", country: "Germany" },
];

exports.seed = async function (knex) {
  const existingCount = await knex("home_university_logos").count("id as count").first();

  // Additive seed, not upsert-by-name: university_name has no unique
  // constraint (two different admins could legitimately want the same
  // name twice, e.g. campuses), so re-running this after admin edits
  // would either duplicate or need a fragile match. Only runs once, on an
  // empty table, same as a fresh deploy.
  if (Number(existingCount.count) > 0) return;

  await knex("home_university_logos").insert(
    LOGOS.map((logo, index) => ({
      university_name: logo.university_name,
      country: logo.country,
      logo_url: null,
      is_active: true,
      sort_order: index + 1,
    }))
  );
};
