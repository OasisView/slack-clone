const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgres://localhost:5432/slack_clone";

const messageRoutes = require("../routes/messages");

const app = express();
app.use(express.json());
app.use("/api/messages", messageRoutes);

const testToken = jwt.sign(
  { id: 1, username: "testuser" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("Messages API", () => {
  describe("GET /api/messages/:channelId", () => {
    it("should return messages for a channel", async () => {
      const res = await request(app)
        .get("/api/messages/1")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return empty array for channel with no messages", async () => {
      const res = await request(app)
        .get("/api/messages/999")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/messages/1");

      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/messages/1")
        .set("Authorization", "Bearer bad-token");

      expect(res.status).toBe(401);
    });

    it("should return messages with expected fields", async () => {
      const res = await request(app)
        .get("/api/messages/1")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        const msg = res.body[0];
        expect(msg).toHaveProperty("id");
        expect(msg).toHaveProperty("content");
        expect(msg).toHaveProperty("username");
        expect(msg).toHaveProperty("created_at");
        expect(msg).toHaveProperty("channel_id");
      }
    });

    it("should return messages in chronological order", async () => {
      const res = await request(app)
        .get("/api/messages/1")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      if (res.body.length > 1) {
        for (let i = 1; i < res.body.length; i++) {
          const prev = new Date(res.body[i - 1].created_at);
          const curr = new Date(res.body[i].created_at);
          expect(curr >= prev).toBe(true);
        }
      }
    });
  });
});
