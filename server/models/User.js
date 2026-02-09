const pool = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const User = {
  async create(username, password) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, passwordHash]
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT id, username, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  async verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  },
};

module.exports = User;
