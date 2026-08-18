const contentPageModel = require("../models/contentPageModel");
const { renderMarkdown } = require("../utils/markdown");
const { rowToCamel, rowsToCamel } = require("../utils/caseConvert");

// Valid categories are fixed by what the frontend knows how to render for
// each — not admin-creatable, same reasoning as site_settings keys.
const CATEGORIES = ["visa", "test_prep", "language", "europe"];

const createSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

function withRenderedHtml(row) {
  if (!row) return row;

  const sections = Array.isArray(row.sections) ? row.sections : [];

  return {
    ...row,
    content_html: renderMarkdown(row.content_markdown),
    sections: sections.map((section) => ({
      ...section,
      bodyHtml: renderMarkdown(section.bodyMarkdown || section.body_markdown || ""),
    })),
  };
}

function isValidCategory(category) {
  return CATEGORIES.includes(category);
}

// GET /api/content-pages/:category
// Public — hub-page listing for a category.
const getPublishedByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!isValidCategory(category)) {
      return res.status(404).json({ success: false, message: "Unknown content category" });
    }

    const pages = await contentPageModel.findPublishedByCategory(category);

    return res.status(200).json({
      success: true,
      count: pages.length,
      pages: rowsToCamel(pages.map(withRenderedHtml)),
    });
  } catch (error) {
    console.error("Get content pages error:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/content-pages/:category/:slug
// Public
const getPublishedByCategoryAndSlug = async (req, res) => {
  try {
    const { category, slug } = req.params;

    if (!isValidCategory(category)) {
      return res.status(404).json({ success: false, message: "Unknown content category" });
    }

    const page = await contentPageModel.findPublishedByCategoryAndSlug(category, slug);

    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    return res.status(200).json({ success: true, page: rowToCamel(withRenderedHtml(page)) });
  } catch (error) {
    console.error("Get content page error:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/content-pages/admin/:category/all
// Admin only — includes unpublished drafts.
const getAllByCategoryForAdmin = async (req, res) => {
  try {
    const { category } = req.params;

    if (!isValidCategory(category)) {
      return res.status(404).json({ success: false, message: "Unknown content category" });
    }

    const pages = await contentPageModel.findAllByCategory(category);

    return res.status(200).json({
      success: true,
      count: pages.length,
      pages: rowsToCamel(pages.map(withRenderedHtml)),
    });
  } catch (error) {
    console.error("Get admin content pages error:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// POST /api/content-pages/:category
// Admin only
const createPage = async (req, res) => {
  try {
    const { category } = req.params;

    if (!isValidCategory(category)) {
      return res.status(404).json({ success: false, message: "Unknown content category" });
    }

    let { title, summary, contentMarkdown, sections, heroImageUrl, isPublished, sortOrder } =
      req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    title = title.trim();
    const slug = createSlug(title);

    const existing = await contentPageModel.findByCategoryAndSlug(category, slug);
    if (existing) {
      return res.status(409).json({ success: false, message: "A page with this title already exists in this category" });
    }

    const page = await contentPageModel.create({
      category,
      slug,
      title,
      summary: summary?.trim() || "",
      content_markdown: contentMarkdown || "",
      sections: Array.isArray(sections) ? JSON.stringify(sections) : null,
      hero_image_url: heroImageUrl?.trim() || null,
      is_published: Boolean(isPublished),
      sort_order: Number(sortOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Page created successfully",
      page: rowToCamel(withRenderedHtml(page)),
    });
  } catch (error) {
    console.error("Create content page error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A page with this title already exists in this category" });
    }

    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PATCH /api/content-pages/:id
// Admin only
const updatePage = async (req, res) => {
  try {
    const existing = await contentPageModel.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const { title, summary, contentMarkdown, sections, heroImageUrl, isPublished, sortOrder } =
      req.body;

    const updateData = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: "title cannot be empty" });
      }

      const newSlug = createSlug(title);
      const slugConflict = await contentPageModel.findByCategoryAndSlugExcludingId(
        existing.category,
        newSlug,
        existing.id
      );

      if (slugConflict) {
        return res.status(409).json({ success: false, message: "A page with this title already exists in this category" });
      }

      updateData.title = title.trim();
      updateData.slug = newSlug;
    }

    if (summary !== undefined) updateData.summary = summary.trim();
    if (contentMarkdown !== undefined) updateData.content_markdown = contentMarkdown;
    if (sections !== undefined) {
      updateData.sections = Array.isArray(sections) ? JSON.stringify(sections) : null;
    }
    if (heroImageUrl !== undefined) updateData.hero_image_url = heroImageUrl ? heroImageUrl.trim() : null;
    if (typeof isPublished === "boolean") updateData.is_published = isPublished;

    if (sortOrder !== undefined) {
      const parsedSortOrder = Number(sortOrder);
      if (!Number.isFinite(parsedSortOrder) || parsedSortOrder < 0) {
        return res.status(400).json({ success: false, message: "sortOrder must be a non-negative number" });
      }
      updateData.sort_order = parsedSortOrder;
    }

    const page = await contentPageModel.update(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      page: rowToCamel(withRenderedHtml(page)),
    });
  } catch (error) {
    console.error("Update content page error:", error.message);

    if (error.code === "22P02") {
      return res.status(400).json({ success: false, message: "Invalid page ID" });
    }

    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// DELETE /api/content-pages/:id
// Admin only
const deletePage = async (req, res) => {
  try {
    const deletedCount = await contentPageModel.deleteById(req.params.id);

    if (!deletedCount) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    return res.status(200).json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    console.error("Delete content page error:", error.message);

    if (error.code === "22P02") {
      return res.status(400).json({ success: false, message: "Invalid page ID" });
    }

    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  getPublishedByCategory,
  getPublishedByCategoryAndSlug,
  getAllByCategoryForAdmin,
  createPage,
  updatePage,
  deletePage,
};
