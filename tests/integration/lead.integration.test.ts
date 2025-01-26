import bcrypt from "bcrypt";
import request from "supertest";
import app from "../../src/app";
import Lead from "../../src/models/Lead";
import User, { IUser } from "../../src/models/User";
import mongoose from "mongoose";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../src/constants/messages";

describe("Lead Routes", () => {
  let token: string;
  let user: IUser;

  beforeAll(async () => {
    const email = "test@test.com";
    const password = "Password123";

    user = new User({ email, password: await bcrypt.hash(password, 10) });
    await user.save();

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email, password });
    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Lead.deleteMany({});
  });

  describe("POST /api/leads", () => {
    it("should create a new lead", async () => {
      const response = await request(app)
        .post("/api/leads")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Lead",
          email: "lead@test.com",
          phone: "1234567890",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        SUCCESS_MESSAGES.LEAD_CREATED
      );
      expect(response.body.lead).toMatchObject({
        name: "Test Lead",
        email: "lead@test.com",
        phone: "1234567890",
      });
    });

    it("should return 400 for invalid payload", async () => {
      const response = await request(app)
        .post("/api/leads")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/leads", () => {
    it("should return all leads", async () => {
      await Lead.create([
        {
          name: "Lead1",
          email: "lead1@test.com",
          phone: "1234567890",
          assignedTo: user._id,
        },
        {
          name: "Lead2",
          email: "lead2@test.com",
          phone: "1234567890",
          assignedTo: user._id,
        },
      ]);

      const response = await request(app)
        .get("/api/leads")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it("should return an empty array if no leads exist", async () => {
      const response = await request(app)
        .get("/api/leads")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/leads/:id", () => {
    it("should return the lead by ID", async () => {
      const lead = await Lead.create({
        name: "Lead1",
        email: "lead1@test.com",
        phone: "1234567890",
        assignedTo: user._id,
      });

      const response = await request(app)
        .get(`/api/leads/${lead.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ name: "Lead1" });
    });

    it("should return 404 if lead is not found", async () => {
      const response = await request(app)
        .get("/api/leads/123456789012345678901234")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "error",
        ERROR_MESSAGES.LEAD_NOT_FOUND
      );
    });
  });

  describe("PUT /api/leads/:id", () => {
    it("should update the lead", async () => {
      const lead = await Lead.create({
        name: "Lead1",
        email: "lead1@test.com",
        phone: "1234567890",
        assignedTo: user._id,
      });

      const response = await request(app)
        .put(`/api/leads/${lead.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Lead" });

      expect(response.status).toBe(200);
      expect(response.body.lead).toMatchObject({ name: "Updated Lead" });
    });

    it("should return 404 if lead is not found", async () => {
      const response = await request(app)
        .put("/api/leads/123456789012345678901234")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Lead" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "error",
        ERROR_MESSAGES.LEAD_NOT_FOUND
      );
    });
  });

  describe("DELETE /leads/:id", () => {
    it("should delete the lead", async () => {
      const lead = await Lead.create({
        name: "Lead1",
        email: "lead1@test.com",
        phone: "1234567890",
        assignedTo: user._id,
      });

      const response = await request(app)
        .delete(`/api/leads/${lead.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        SUCCESS_MESSAGES.LEAD_DELETED
      );
    });

    it("should return 404 if lead is not found", async () => {
      const response = await request(app)
        .delete("/api/leads/123456789012345678901234")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "error",
        ERROR_MESSAGES.LEAD_NOT_FOUND
      );
    });
  });
});
