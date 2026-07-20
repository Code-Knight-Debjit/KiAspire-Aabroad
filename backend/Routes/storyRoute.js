const express = require("express");

const {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
} = require("../controllers/storyController");

const {
  protect,
  adminOnly,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/", getStories);
router.get("/:id", getStoryById);

// Admin Routes
router.post("/", protect, adminOnly, createStory);
router.patch("/:id", protect, adminOnly, updateStory);
router.delete("/:id", protect, adminOnly, deleteStory);

module.exports = router;