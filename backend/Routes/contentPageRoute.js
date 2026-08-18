const express = require("express");

const {
  getPublishedByCategory,
  getPublishedByCategoryAndSlug,
  getAllByCategoryForAdmin,
  createPage,
  updatePage,
  deletePage,
} = require("../controllers/contentPageController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.get("/:category", getPublishedByCategory);
router.get("/admin/:category/all", protect, adminOnly, getAllByCategoryForAdmin);
router.get("/:category/:slug", getPublishedByCategoryAndSlug);

// Admin routes
router.post("/:category", protect, adminOnly, createPage);
router.patch("/:id", protect, adminOnly, updatePage);
router.delete("/:id", protect, adminOnly, deletePage);

module.exports = router;
