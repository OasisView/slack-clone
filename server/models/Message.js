const pool = require("../config/db");

const Message = {
  async create(content, userId, channelId) {
    const result = await pool.query(
      `INSERT INTO messages (content, user_id, channel_id)
       VALUES ($1, $2, $3)
       RETURNING id, content, user_id, channel_id, created_at`,
      [content, userId, channelId]
    );
    return result.rows[0];
  },

  async getByChannel(channelId, limit = 50) {
    const result = await pool.query(
      `SELECT m.id, m.content, m.created_at, m.channel_id,
              u.username
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2`,
      [channelId, limit]
    );
    return result.rows;
  },
};

module.exports = Message;
