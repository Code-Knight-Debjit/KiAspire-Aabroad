const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
      trim: true,
    },
    // lastName: {
    //   type: String,
    //   required: true, 
    //   trim: true,
    // },

    email: {
      type: String,
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true, 
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin", "counsellor"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

   
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);