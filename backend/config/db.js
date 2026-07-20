const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log(`✅ MongoDB Connected: Successfully`);
    return conn
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Stop server if DB connection fails
  }
};

module.exports = connectDB;