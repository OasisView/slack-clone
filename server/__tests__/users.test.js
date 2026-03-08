const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgres://localhost:5432/slack_clone";

const userRoutes = require("../routes/users");

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

const testToken = jwt.sign(
  { id: 1, username: "testuser" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("Users API", () => {
  describe("GET /api/users", () => {
    it("should return list of users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should return id, username, created_at but not password_hash", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${testToken}`);

      const user = res.body[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("created_at");
      expect(user).not.toHaveProperty("password_hash");
    });

    it("should return users in consistent order", async () => {
      const res1 = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${testToken}`);

      const res2 = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res1.body.map(u => u.username)).toEqual(res2.body.map(u => u.username));
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer bad-token");
      expect(res.status).toBe(401);
    });

    it("should reject malformed auth header", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "NotBearer sometoken");
      expect(res.status).toBe(401);
    });
  });
});
