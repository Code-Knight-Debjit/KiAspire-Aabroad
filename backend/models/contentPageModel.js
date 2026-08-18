const db = require("../db/knex");

const TABLE = "content_pages";

function findPublishedByCategory(category) {
  return db(TABLE)
    .where({ category, is_published: true })
    .orderBy("sort_order");
}

function findPublishedByCategoryAndSlug(category, slug) {
  return db(TABLE).where({ category, slug, is_published: true }).first();
}

function findAllByCategory(category) {
  return db(TABLE).where({ category }).orderBy("sort_order");
}

function findById(id) {
  return db(TABLE).where({ id }).first();
}

function findByCategoryAndSlug(category, slug) {
  return db(TABLE).where({ category, slug }).first();
}

function findByCategoryAndSlugExcludingId(category, slug, excludeId) {
  return db(TABLE)
    .where({ category, slug })
    .andWhereNot({ id: excludeId })
    .first();
}

async function create(data) {
  const [row] = await db(TABLE).insert(data).returning("*");
  return row;
}

async function update(id, data) {
  const [row] = await db(TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning("*");

  return row;
}

function deleteById(id) {
  return db(TABLE).where({ id }).del();
}

module.exports = {
  findPublishedByCategory,
  findPublishedByCategoryAndSlug,
  findAllByCategory,
  findById,
  findByCategoryAndSlug,
  findByCategoryAndSlugExcludingId,
  create,
  update,
  deleteById,
};
