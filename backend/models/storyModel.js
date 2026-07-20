const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    university: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
    },

    course: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },

    title: {
      type: String,
      required: [true, "Story title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    youtubeUrl: {
      type: String,
      required: [true, "YouTube URL is required"],
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Story", storySchema);