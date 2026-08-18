const homeLogoModel = require("../models/homeLogoModel");
const { rowToCamel, rowsToCamel } = require("../utils/caseConvert");

// GET /api/home-logos
// Public — feeds the home page's auto-scrolling logo strip.
const getActiveLogos = async (req, res) => {
  try {
    const logos = await homeLogoModel.findActive();

    return res.status(200).json({
      success: true,
      count: logos.length,
      logos: rowsToCamel(logos),
    });
  } catch (error) {
    console.error("Get home logos error:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/home-logos/admin/all
// Admin only
const getAllLogosForAdmin = async (req, res) => {
  try {
    const logos = await homeLogoModel.findAll();

    return res.status(200).json({
      success: true,
      count: logos.length,
      logos: rowsToCamel(logos),
    });
  } catch (error) {
    console.error("Get admin home logos error:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// POST /api/home-logos
// Admin only
const createLogo = async (req, res) => {
  try {
    const { universityName, country, logoUrl, isActive, sortOrder } = req.body;

    if (!universityName || !universityName.trim()) {
      return res.status(400).json({ success: false, message: "universityName is required" });
    }

    const logo = await homeLogoModel.create({
      university_name: universityName.trim(),
      country: country?.trim() || "",
      logo_url: logoUrl?.trim() || null,
      is_active: isActive === undefined ? true : Boolean(isActive),
      sort_order: Number(sortOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Logo entry created successfully",
      logo: rowToCamel(logo),
    });
  } catch (error) {
    console.error("Create home logo error:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PATCH /api/home-logos/:id
// Admin only
const updateLogo = async (req, res) => {
  try {
    const existing = await homeLogoModel.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Logo entry not found" });
    }

    const { universityName, country, logoUrl, isActive, sortOrder } = req.body;

    const updateData = {};

    if (universityName !== undefined) {
      if (!universityName.trim()) {
        return res.status(400).json({ success: false, message: "universityName cannot be empty" });
      }
      updateData.university_name = universityName.trim();
    }

    if (country !== undefined) updateData.country = country.trim();
    if (logoUrl !== undefined) updateData.logo_url = logoUrl ? logoUrl.trim() : null;
    if (typeof isActive === "boolean") updateData.is_active = isActive;

    if (sortOrder !== undefined) {
      const parsedSortOrder = Number(sortOrder);
      if (!Number.isFinite(parsedSortOrder) || parsedSortOrder < 0) {
        return res.status(400).json({ success: false, message: "sortOrder must be a non-negative number" });
      }
      updateData.sort_order = parsedSortOrder;
    }

    const logo = await homeLogoModel.update(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: "Logo entry updated successfully",
      logo: rowToCamel(logo),
    });
  } catch (error) {
    console.error("Update home logo error:", error.message);

    if (error.code === "22P02") {
      return res.status(400).json({ success: false, message: "Invalid logo ID" });
    }

    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// DELETE /api/home-logos/:id
// Admin only
const deleteLogo = async (req, res) => {
  try {
    const deletedCount = await homeLogoModel.deleteById(req.params.id);

    if (!deletedCount) {
      return res.status(404).json({ success: false, message: "Logo entry not found" });
    }

    return res.status(200).json({ success: true, message: "Logo entry deleted successfully" });
  } catch (error) {
    console.error("Delete home logo error:", error.message);

    if (error.code === "22P02") {
      return res.status(400).json({ success: false, message: "Invalid logo ID" });
    }

    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  getActiveLogos,
  getAllLogosForAdmin,
  createLogo,
  updateLogo,
  deleteLogo,
};
