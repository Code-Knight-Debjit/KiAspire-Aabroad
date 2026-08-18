require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const db = require("./db/knex");
const createDefaultAdmin = require("./utils/defaultAdmin");
const { guardStudentPage, guardAdminPage } = require("./middlewares/pageGuard");

const userRoutes = require("./Routes/userRoute");
const adminRoutes = require("./Routes/adminRoute");
const serviceRoutes = require("./Routes/serviceRoute");
const storyRoutes = require("./Routes/storyRoute");
const applicationRoutes = require("./Routes/applicationRoute");
const freeStudyRoutes = require("./Routes/freeStudyRoute");
const siteSettingRoutes = require("./Routes/siteSettingRoute");
const contentPageRoutes = require("./Routes/contentPageRoute");
const homeLogoRoutes = require("./Routes/homeLogoRoute");

const app = express();

// cPanel/Passenger terminates TLS itself and proxies to this process over
// plain HTTP, so req.secure is false in production unless Express is told to
// trust the proxy's X-Forwarded-Proto header. Without this, the Secure flag
// authCookie.js derives from req.secure never actually gets applied to the
// session cookies on the live HTTPS site. One hop — Passenger is the only
// proxy in front of the app, so don't blanket-trust the whole chain.
app.set("trust proxy", 1);

// Fail fast if Postgres isn't reachable, then ensure the default admin
// exists (mirrors the previous Mongo-connect-then-seed boot sequence).
db.raw("select 1")
  .then(() => {
    console.log("✅ PostgreSQL Connected: Successfully");
    return createDefaultAdmin();
  })
  .catch((error) => {
    console.error("❌ PostgreSQL Connection Error:", error.message);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Render (and similar PaaS) health check for zero-downtime deploy cutover.
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/applications", applicationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/free-study", freeStudyRoutes);
app.use("/api/site-settings", siteSettingRoutes);
app.use("/api/content-pages", contentPageRoutes);
app.use("/api/home-logos", homeLogoRoutes);

// Server-side page guards — must run before express.static, otherwise an
// unauthenticated request could reach these HTML shells directly. The
// actual data on these pages still only ever comes from the bearer-token
// protected API routes above; this just stops the shell itself (and a
// same-session admin.js/dashboard script) from loading pre-login.
app.get("/dashboard.html", guardStudentPage);
app.use("/admin", guardAdminPage);

// Serves the whole static frontend from this same process/port — the hard
// hosting constraint in CLAUDE.md (single Node process, no separate static
// server). Registered after /api routes so a route typo there 404s instead
// of silently falling through to the static handler.
app.use(express.static(path.join(__dirname, "..", "frontend")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
