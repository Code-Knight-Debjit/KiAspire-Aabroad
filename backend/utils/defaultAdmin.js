const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

// Seeds the one default admin account from ADMIN_* env vars on boot.
//
// Email is trimmed + lowercased before it touches the database, matching what
// every other email path in the app does (adminController.adminLogin,
// userController register/login, applicationController). That convention is
// load-bearing: users.email is plain text, not citext (ARCHITECTURE.md 6b), so
// 'Admin@foo.com' and 'admin@foo.com' are two different rows as far as
// Postgres is concerned. This seeder previously passed ADMIN_EMAIL through
// raw, so an env value with any capital letter or stray whitespace got stored
// as-is while login looked for the lowercased form — correct credentials,
// permanent "Invalid admin email or password", and no way to notice, since the
// existence check used the same raw value and kept reporting success.
const createDefaultAdmin = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE } = process.env;

    // name/phone are NOT NULL columns and phone is UNIQUE — checking here
    // turns a cryptic Postgres constraint error into an actionable message.
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME || !ADMIN_PHONE) {
      console.error(
        "Skipping default admin: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME and ADMIN_PHONE must all be set."
      );
      return;
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const phone = ADMIN_PHONE.trim();

    // Case-insensitive on purpose: this also matches a row written by the old
    // raw-email behavior, so a deployment that's already locked out repairs
    // itself on the next restart instead of needing a manual SQL fix.
    const existingAdmin = await userModel.findByEmailInsensitiveAndRole(
      email,
      "admin"
    );

    if (existingAdmin) {
      if (existingAdmin.email !== email) {
        await userModel.updateEmail(existingAdmin.id, email);
        console.log(
          `Default admin email normalized: "${existingAdmin.email}" -> "${email}"`
        );
        return;
      }

      console.log("Default admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await userModel.create({
      name: ADMIN_NAME.trim(),
      email,
      phone,
      passwordHash: hashedPassword,
      role: "admin",
    });

    console.log("Default admin created successfully");
  } catch (error) {
    console.error("Error creating default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;
