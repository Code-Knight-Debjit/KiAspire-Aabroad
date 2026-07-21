const express = require("express");

const {
  createService,
  getAllServices,
  getAllServicesForAdmin,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public route
router.get("/", getAllServices);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllServicesForAdmin);
router.post("/", protect, adminOnly, createService);
router.patch("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;
