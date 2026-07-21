const bcrypt = require("bcryptjs");
const validator = require("validator");

const User = require("../models/userModel");
const generateToken = require("../utils/token");

// Admin login
// POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Password has select:false in the schema
    const admin = await User.findOne({
      email,
      role: "admin",
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your admin account is inactive",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    // FIX: previously called as generateToken(admin._id) — the role
    // claim was silently missing from every token. Now passes both.
    const token = generateToken(admin._id, admin.role);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Get logged-in admin profile
// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    // FIX: password is now select:false on the schema (and stripped again
    // by the toJSON transform as a second safety net), so this no longer
    // leaks the password hash to the client.
    const admin = await User.findOne({
      _id: req.user._id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Get all normal users
// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Get a single user
// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Activate or deactivate user
// PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "user",
      },
      {
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Delete a user
// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
