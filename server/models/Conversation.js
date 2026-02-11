const pool = require("../config/db");

const Conversation = {
  async findOrCreate(userIdA, userIdB) {
    const user1 = Math.min(userIdA, userIdB);
    const user2 = Math.max(userIdA, userIdB);

    let result = await pool.query(
      "SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2",
      [user1, user2]
    );

    if (result.rows[0]) return result.rows[0];

    result = await pool.query(
      `INSERT INTO conversations (user1_id, user2_id)
       VALUES ($1, $2)
       RETURNING id, user1_id, user2_id, created_at`,
      [user1, user2]
    );
    return result.rows[0];
  },

  async getByUserId(userId) {
    const result = await pool.query(
      `SELECT c.id, c.user1_id, c.user2_id, c.created_at,
              CASE WHEN c.user1_id = $1 THEN u2.username ELSE u1.username END AS other_username,
              CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END AS other_user_id
       FROM conversations c
       JOIN users u1 ON c.user1_id = u1.id
       JOIN users u2 ON c.user2_id = u2.id
       WHERE c.user1_id = $1 OR c.user2_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM conversations WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Conversation;
