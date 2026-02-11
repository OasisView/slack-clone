const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgres://localhost:5432/slack_clone";

const dmRoutes = require("../routes/dm");

const app = express();
app.use(express.json());
app.use("/api/dm", dmRoutes);

const user1Token = jwt.sign(
  { id: 1, username: "ismael" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
const user2Token = jwt.sign(
  { id: 2, username: "testuser" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("DM API", () => {
  let conversationId;

  describe("POST /api/dm/conversations", () => {
    it("should create a new conversation", async () => {
      const res = await request(app)
        .post("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ userId: 2 });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      conversationId = res.body.id;
    });

    it("should return existing conversation on duplicate", async () => {
      const res = await request(app)
        .post("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ userId: 2 });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(conversationId);
    });

    it("should reject DM to self", async () => {
      const res = await request(app)
        .post("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ userId: 1 });

      expect(res.status).toBe(400);
    });

    it("should reject missing userId", async () => {
      const res = await request(app)
        .post("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app)
        .post("/api/dm/conversations")
        .send({ userId: 2 });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/dm/conversations", () => {
    it("should return user conversations", async () => {
      const res = await request(app)
        .get("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should include other_username and other_user_id", async () => {
      const res = await request(app)
        .get("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`);

      const conv = res.body.find(c => c.id === conversationId);
      expect(conv).toBeDefined();
      expect(conv.other_user_id).toBe(2);
      expect(conv).toHaveProperty("other_username");
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/dm/conversations");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/dm/messages/:conversationId", () => {
    it("should return empty array for new conversation", async () => {
      const res = await request(app)
        .get(`/api/dm/messages/${conversationId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get(`/api/dm/messages/${conversationId}`);
      expect(res.status).toBe(401);
    });

    it("should return empty array for nonexistent conversation", async () => {
      const res = await request(app)
        .get("/api/dm/messages/99999")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should create same conversation regardless of who initiates", async () => {
      // User 2 creates conversation with User 1 (reverse direction)
      const res = await request(app)
        .post("/api/dm/conversations")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ userId: 1 });

      expect(res.status).toBe(201);
      // Should be same conversation as user1 -> user2
      expect(res.body.id).toBe(conversationId);
    });

    it("should reject invalid token on conversations list", async () => {
      const res = await request(app)
        .get("/api/dm/conversations")
        .set("Authorization", "Bearer garbage");

      expect(res.status).toBe(401);
    });

    it("should reject invalid token on create conversation", async () => {
      const res = await request(app)
        .post("/api/dm/conversations")
        .set("Authorization", "Bearer garbage")
        .send({ userId: 2 });

      expect(res.status).toBe(401);
    });

    it("should reject invalid token on DM messages", async () => {
      const res = await request(app)
        .get(`/api/dm/messages/${conversationId}`)
        .set("Authorization", "Bearer garbage");

      expect(res.status).toBe(401);
    });

    it("both users should see the conversation in their list", async () => {
      const res1 = await request(app)
        .get("/api/dm/conversations")
        .set("Authorization", `Bearer ${user1Token}`);

      const res2 = await request(app)
        .get("/api/dm/conversations")
        .set("Authorization", `Bearer ${user2Token}`);

      const conv1 = res1.body.find(c => c.id === conversationId);
      const conv2 = res2.body.find(c => c.id === conversationId);

      expect(conv1).toBeDefined();
      expect(conv2).toBeDefined();
      // User 1 sees User 2 as the other person and vice versa
      expect(conv1.other_user_id).toBe(2);
      expect(conv2.other_user_id).toBe(1);
    });
  });
});
