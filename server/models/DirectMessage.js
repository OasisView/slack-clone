const pool = require("../config/db");

const DirectMessage = {
  async create(content, senderId, conversationId) {
    const result = await pool.query(
      `INSERT INTO direct_messages (content, sender_id, conversation_id)
       VALUES ($1, $2, $3)
       RETURNING id, content, sender_id, conversation_id, created_at`,
      [content, senderId, conversationId]
    );
    return result.rows[0];
  },

  async getByConversation(conversationId, limit = 50) {
    const result = await pool.query(
      `SELECT dm.id, dm.content, dm.created_at, dm.conversation_id,
              u.username
       FROM direct_messages dm
       JOIN users u ON dm.sender_id = u.id
       WHERE dm.conversation_id = $1
       ORDER BY dm.created_at ASC
       LIMIT $2`,
      [conversationId, limit]
    );
    return result.rows;
  },
};

module.exports = DirectMessage;
