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
  });
});
