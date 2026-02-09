const pool = require("../config/db");

const Channel = {
  async getAll() {
    const result = await pool.query(
      "SELECT id, name, created_at FROM channels ORDER BY id"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT id, name, created_at FROM channels WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  async create(name) {
    const result = await pool.query(
      "INSERT INTO channels (name) VALUES ($1) RETURNING id, name, created_at",
      [name]
    );
    return result.rows[0];
  },
};

module.exports = Channel;
