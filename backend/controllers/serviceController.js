const Service = require("../models/serviceModel");

const createSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// POST /api/services
// Admin only
const createService = async (req, res) => {
  try {
    let { name, description, icon, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    name = name.trim();
    const slug = createSlug(name);

    const existingService = await Service.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
    }

    const service = await Service.create({
      name,
      slug,
      description: description?.trim() || "",
      icon: icon?.trim() || "",
      sortOrder: Number(sortOrder) || 0,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// GET /api/services
// Public
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select("-createdBy");

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// GET /api/services/admin/all
// Admin only
const getAllServicesForAdmin = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("createdBy", "name email")
      .sort({ sortOrder: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get admin services error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// PATCH /api/services/:id
// Admin only
const updateService = async (req, res) => {
  try {
    const { name, description, icon, isActive, sortOrder } = req.body;

    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Service name cannot be empty",
        });
      }

      updateData.name = name.trim();
      updateData.slug = createSlug(name);
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (icon !== undefined) {
      updateData.icon = icon.trim();
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another service already uses this name",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// DELETE /api/services/:id
// Admin only
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

module.exports = {
  createService,
  getAllServices,
  getAllServicesForAdmin,
  updateService,
  deleteService,
};