const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Set env before requiring routes
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgres://localhost:5432/slack_clone";

const authRoutes = require("../routes/auth");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth API", () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: "testpass123",
  };

  describe("POST /api/auth/signup", () => {
    it("should create a new user and return token", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.username).toBe(testUser.username);
    });

    it("should reject duplicate username", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Username already taken");
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ username: "nopass" });

      expect(res.status).toBe(400);
    });

    it("should reject short password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ username: "shortpass", password: "ab" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login and return token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.username).toBe(testUser.username);
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: testUser.username, password: "wrongpass" });

      expect(res.status).toBe(401);
    });

    it("should reject nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "nobody_here", password: "whatever" });

      expect(res.status).toBe(401);
    });

    it("should reject missing username", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "testpass123" });

      expect(res.status).toBe(400);
    });

    it("should reject missing password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "someuser" });

      expect(res.status).toBe(400);
    });

    it("should reject empty body", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Token validation", () => {
    it("should return a token with correct payload", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty("id");
      expect(decoded.username).toBe(testUser.username);
      expect(decoded).toHaveProperty("exp");
    });

    it("signup should not return password_hash", async () => {
      const newUser = {
        username: `edgeuser_${Date.now()}`,
        password: "edgepass123",
      };
      const res = await request(app)
        .post("/api/auth/signup")
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.user).not.toHaveProperty("password_hash");
      expect(res.body.user).not.toHaveProperty("password");
    });
  });
});
