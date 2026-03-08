const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgres://localhost:5432/slack_clone";

const channelRoutes = require("../routes/channels");

const app = express();
app.use(express.json());
app.use("/api/channels", channelRoutes);

// Generate a valid test token
const testToken = jwt.sign(
  { id: 1, username: "testuser" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("Channels API", () => {
  describe("GET /api/channels", () => {
    it("should return channels when authenticated", async () => {
      const res = await request(app)
        .get("/api/channels")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      const names = res.body.map((c) => c.name);
      expect(names).toContain("general");
      expect(names).toContain("random");
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/channels");

      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/channels")
        .set("Authorization", "Bearer garbage-token");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/channels", () => {
    const uniqueChannel = `test-ch-${Date.now()}`;

    it("should create a new channel", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ name: uniqueChannel });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe(uniqueChannel);
    });

    it("should reject duplicate channel name", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ name: uniqueChannel });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Channel already exists");
    });

    it("should reject empty channel name", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ name: "" });

      expect(res.status).toBe(400);
    });

    it("should reject missing name field", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${testToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should reject whitespace-only name", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ name: "   " });

      expect(res.status).toBe(400);
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app)
        .post("/api/channels")
        .send({ name: "sneaky" });

      expect(res.status).toBe(401);
    });
  });
});
