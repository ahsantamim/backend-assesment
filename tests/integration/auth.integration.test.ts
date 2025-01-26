import bcrypt from "bcrypt";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../src/app";
import User from "../../src/models/User";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../src/constants/messages";

describe("POST /auth/signup", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should create a new user", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ email: "testuser@test.com", password: "Password123" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      SUCCESS_MESSAGES.USER_CREATED
    );
  });

  it("should return 400 for invalid payload", async () => {
    const response = await request(app).post("/auth/signup").send({});

    expect(response.status).toBe(400);
  });

  it("should return 400 for existing email", async () => {
    const response = await request(app).post("/auth/signup").send({
      email: "testuser@test.com",
      password: "Password123",
    });
    expect(response.status).toBe(201);

    const secondResponse = await request(app).post("/auth/signup").send({
      email: "testuser@test.com",
      password: "Password123",
    });

    expect(secondResponse.status).toBe(400);
  });

  it("should return 500 for internal server error", async () => {
    await mongoose.disconnect();
    const response = await request(app).post("/auth/signup").send({
      email: "testuser@test.com",
      password: "Password123",
    });
    expect(response.status).toBe(500);
    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME,
    });
  });
});

describe("POST /auth/login", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should return 200 for successful login", async () => {
    const email = "testuser@test.com";
    const password = "Password123";

    await User.create({
      email,
      password: await bcrypt.hash(password, 10),
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      SUCCESS_MESSAGES.LOGIN_SUCCESSFUL
    );
    expect(response.body).toHaveProperty("accessToken");
    const setCookieHeader = response.headers["set-cookie"];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    const refreshTokenCookie = cookies.find((cookie) =>
      cookie?.startsWith("refreshToken=")
    );

    expect(refreshTokenCookie).toBeDefined();
  });

  it("should return 400 for invalid payload", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(ERROR_MESSAGES.VALIDATION_FAILED);
  });

  it("should return 401 for invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "nonexistentuser@test.com", password: "WrongPassword" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  it("should return 500 for internal server error", async () => {
    await mongoose.disconnect();
    const response = await request(app).post("/auth/login").send({
      email: "testuser@test.com",
      password: "Password123",
    });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);

    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME,
    });
  });
});

describe("POST /auth/logout", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should return 204 for successful logout", async () => {
    const email = "testuser@test.com";
    const password = "Password123";

    await User.create({
      email,
      password: await bcrypt.hash(password, 10),
    });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty(
      "message",
      SUCCESS_MESSAGES.LOGIN_SUCCESSFUL
    );

    const token = loginResponse.body.accessToken;

    const cookies = loginResponse.headers["set-cookie"];
    expect(cookies).toBeDefined();

    // @ts-ignore
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );
    expect(refreshTokenCookie).toBeDefined();

    const logoutResponse = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("Cookie", `refreshToken=${refreshTokenCookie}`)
      .timeout(2000);

    expect(logoutResponse.status).toBe(204);

    const leadCreationResponse = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Lead",
        email: "lead@test.com",
        phone: "1234567890",
      });

    expect(leadCreationResponse.status).toBe(401);
    expect(leadCreationResponse.body).toHaveProperty(
      "error",
      ERROR_MESSAGES.UNAUTHORIZED
    );
  });

  it("should not invalidate all accessToken-s of a single user account if one account is logged out", async () => {
    const email = "testuser@test.com";
    const password = "Password123";

    await User.create({
      email,
      password: await bcrypt.hash(password, 10),
    });

    const firstLoginResponse = await request(app)
      .post("/auth/login")
      .send({ email, password });
    const secondLoginResponse = await request(app)
      .post("/auth/login")
      .send({ email, password });

    const tokenOne = firstLoginResponse.body.accessToken;
    const tokenTwo = secondLoginResponse.body.accessToken;

    const cookies = firstLoginResponse.headers["set-cookie"];
    // @ts-ignore
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );

    const logoutResponseOne = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${tokenOne}`)
      .set("Cookie", `refreshToken=${refreshTokenCookie}`)
      .timeout(2000);

    expect(logoutResponseOne.status).toBe(204);

    const leadCreationResponse = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${tokenTwo}`)
      .send({
        name: "Test Lead",
        email: "lead@test.com",
        phone: "1234567890",
      });

    expect(leadCreationResponse.status).toBe(201);
  });
});
