import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "../../src/models/User";
import { ERROR_MESSAGES } from "../../src/constants/messages";
import { signup, login } from "../../src/controllers/authController";
jest.mock("../../src/models/User");

const getMockReqAndRes = () => {
  const mockReq = {
    body: { email: "test1@test.com", password: "passWord1" },
  } as Request;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  return { mockReq, mockRes };
};

describe("Signup Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = getMockReqAndRes().mockReq;
    mockRes = getMockReqAndRes().mockRes;

    (User.prototype.save as jest.Mock).mockResolvedValue({
      _id: "1",
      password: "hashed_value",
      email: "test1@test.com",
    });
  });

  it("should return 201 for creating a new user", async () => {
    await signup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      })
    );
  });

  it("should return 400 if email already exists", async () => {
    const duplicateKeyError: any = new Error("Duplicate key error");
    duplicateKeyError.code = 11000;

    (User.prototype.save as jest.Mock).mockRejectedValue(duplicateKeyError);

    await signup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.SIGNUP_FAILED,
    });
  });

  it("should return 500 for unexpected errors", async () => {
    (User.prototype.save as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await signup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });
});

describe("Login Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = getMockReqAndRes().mockReq;
    mockRes = getMockReqAndRes().mockRes;

    (User.findOne as jest.Mock).mockResolvedValue({
      _id: "1",
      password: "hashed_value",
      email: "test1@test.com",
    });
  });

  it("should return 200 for successful login", async () => {
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    mockRes.cookie = jest.fn().mockReturnValue(true);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        accessToken: expect.any(String),
      })
    );
    expect(mockRes.cookie).toHaveBeenCalled();
  });

  it("should return 401 for unmatched credential", async () => {
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  });

  it("should return 500 for error", async () => {
    bcrypt.compare = jest
      .fn()
      .mockRejectedValue(new Error("Something went wrong"));

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  });
});
