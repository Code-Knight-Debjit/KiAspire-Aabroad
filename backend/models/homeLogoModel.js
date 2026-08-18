const db = require("../db/knex");

const TABLE = "home_university_logos";

function findActive() {
  return db(TABLE).where({ is_active: true }).orderBy("sort_order");
}

function findAll() {
  return db(TABLE).orderBy("sort_order");
}

function findById(id) {
  return db(TABLE).where({ id }).first();
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
  findActive,
  findAll,
  findById,
  create,
  update,
  deleteById,
};
