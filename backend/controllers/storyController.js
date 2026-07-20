const Story = require("../models/storyModel");

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
      youtubeVideoId,
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
      !youtubeVideoId
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
      youtubeVideoId,
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
    console.log(error);
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
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Story
const updateStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
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