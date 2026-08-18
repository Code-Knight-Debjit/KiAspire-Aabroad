/* Read-only diagnostic for "admin login rejects correct credentials".
 *
 * Run inside the app's Node environment on the server:
 *     node scripts/diagnose-admin.js you@example.com
 *
 * The argument is the email you are actually typing into the login form.
 * Writes nothing to the database. Prints no passwords and no hashes — only
 * lengths, booleans, and emails, so the output is safe to paste back.
 */
require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../db/knex");

// Values are wrapped in [] so leading/trailing whitespace is actually visible.
function show(value) {
  return value === undefined ? "(not set)" : `[${value}]`;
}

function whitespaceNote(value) {
  if (!value) return "";
  return value !== value.trim() ? "  <-- HAS LEADING/TRAILING WHITESPACE" : "";
}

(async () => {
  const typedEmail = process.argv[2];

  console.log("\n=== 1. Environment ===");
  console.log("ADMIN_EMAIL :", show(process.env.ADMIN_EMAIL) + whitespaceNote(process.env.ADMIN_EMAIL));
  console.log("ADMIN_NAME  :", show(process.env.ADMIN_NAME));
  console.log("ADMIN_PHONE :", show(process.env.ADMIN_PHONE) + whitespaceNote(process.env.ADMIN_PHONE));
  console.log(
    "ADMIN_PASSWORD:",
    process.env.ADMIN_PASSWORD
      ? `set, length ${process.env.ADMIN_PASSWORD.length}` +
          whitespaceNote(process.env.ADMIN_PASSWORD)
      : "(not set)"
  );
  console.log("JWT_SECRET  :", process.env.JWT_SECRET ? "set" : "(NOT SET — login would 500, not 401)");

  try {
    console.log("\n=== 2. Admin rows in the database ===");
    const admins = await db("users").where({ role: "admin" }).orderBy("created_at");

    if (!admins.length) {
      console.log("NO ROWS with role='admin'. The default admin was never created.");
      console.log("Check the app boot log for 'Error creating default admin' or the");
      console.log("'Skipping default admin' message.");
    }

    for (const a of admins) {
      console.log("-".repeat(50));
      console.log("  email       :", show(a.email) + whitespaceNote(a.email));
      console.log("  is_active   :", a.is_active, a.is_active ? "" : "  <-- login returns 403, not 401");
      console.log("  password set:", Boolean(a.password_hash));
      console.log("  last_login  :", a.last_login || "(never)");

      if (process.env.ADMIN_PASSWORD && a.password_hash) {
        const matches = await bcrypt.compare(process.env.ADMIN_PASSWORD, a.password_hash);
        console.log("  ADMIN_PASSWORD matches this row's hash:", matches);
      }
    }

    if (typedEmail) {
      console.log("\n=== 3. The exact lookup adminLogin performs ===");
      const normalized = typedEmail.trim().toLowerCase();
      console.log("You typed      :", show(typedEmail));
      console.log("Login looks for:", show(normalized));

      const exact = await db("users").where({ email: normalized, role: "admin" }).first();
      console.log("Exact match found:", Boolean(exact), exact ? "" : "  <-- this is your 401");

      if (!exact) {
        const loose = await db("users")
          .whereRaw("lower(email) = ?", [normalized])
          .first();

        if (loose) {
          console.log(
            `\n  DIAGNOSIS: a row exists as ${show(loose.email)} but login searches for`,
            `${show(normalized)} — a case/whitespace mismatch. role=${loose.role}.`
          );
          console.log("  Fix: deploy the updated utils/defaultAdmin.js and restart; it");
          console.log("  normalizes this row automatically on boot.");
        } else {
          console.log("\n  DIAGNOSIS: no user at all has this email, in any casing.");
          console.log("  You are typing a different address than ADMIN_EMAIL.");
        }
      }
    } else {
      console.log("\n(Pass the email you type at the login form as an argument for a direct check.)");
    }
  } catch (error) {
    console.error("\nQuery failed:", error.message || error);
  } finally {
    await db.destroy();
  }
})();
