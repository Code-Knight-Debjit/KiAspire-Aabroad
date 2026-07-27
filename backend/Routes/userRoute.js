const express = require("express");

const {
  registerStudent,
  loginStudent,
  getMyDashboard,
} = require("../controllers/userController");

const { protect, studentOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/dashboard", protect, studentOnly, getMyDashboard);

module.exports = router;
