const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const generateToken  = require('./token')

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log(" Default admin already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    // Create admin
    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      phone: process.env.ADMIN_PHONE,
      password: hashedPassword,
      role: "admin",
     
    });

    console.log(" Default admin created successfully");
  } catch (error) {
    console.error(" Error creating default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;