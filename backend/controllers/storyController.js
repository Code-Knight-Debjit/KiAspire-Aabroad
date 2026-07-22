const Story = require("../models/storyModel");

// Fields an admin is allowed to set/update on a story.
// Prevents accidentally overwriting fields like createdBy via a raw body.
const ALLOWED_FIELDS = [
  "studentName",
  "country",
  "university",
  "course",
  "title",
  "description",
  "youtubeUrl",
  "thumbnail",
  "isFeatured",
  "isActive",
  "sortOrder",
];

const pickAllowedFields = (body) => {
  const result = {};

  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }

  return result;
};

// Create Story
const createStory = async (req, res) => {
  try {
    const {
      studentName,
      country,
      university,
      course,
      title,
      description,
      // FIX: the schema requires "youtubeUrl", but this controller used
      // to read "youtubeVideoId" from the body and never set youtubeUrl
      // at all — every story creation failed schema validation. Now the
      // controller and schema agree on the same field name.
      youtubeUrl,
      thumbnail,
      isFeatured,
      sortOrder,
    } = req.body;

    if (
      !studentName ||
      !country ||
      !university ||
      !course ||
      !title ||
      !youtubeUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const story = await Story.create({
      studentName,
      country,
      university,
      course,
      title,
      description,
      youtubeUrl,
      thumbnail,
      isFeatured,
      sortOrder,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story,
    });
  } catch (error) {
    console.error("Create story error:", error.message);

    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all active stories
const getStories = async (req, res) => {
  try {
    const stories = await Story.find({ isActive: true })
      .sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      count: stories.length,
      stories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get story by ID
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid story ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Story
const updateStory = async (req, res) => {
  try {
    // FIX: previously passed req.body straight through to
    // findByIdAndUpdate, which would let a caller set arbitrary fields
    // (e.g. createdBy). Now only whitelisted fields are applied.
    const updateData = pickAllowedFields(req.body);

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Story updated successfully",
      story,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid story ID",
      });
    }

    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Story
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid story ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
};
