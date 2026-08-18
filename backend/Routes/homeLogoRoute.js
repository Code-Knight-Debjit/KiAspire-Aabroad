const express = require("express");

const {
  getActiveLogos,
  getAllLogosForAdmin,
  createLogo,
  updateLogo,
  deleteLogo,
} = require("../controllers/homeLogoController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public
router.get("/", getActiveLogos);

// Admin
router.get("/admin/all", protect, adminOnly, getAllLogosForAdmin);
router.post("/", protect, adminOnly, createLogo);
router.patch("/:id", protect, adminOnly, updateLogo);
router.delete("/:id", protect, adminOnly, deleteLogo);

module.exports = router;
