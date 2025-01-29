import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { createClient } from "redis";
import User from "../models/User";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import jwt from "jsonwebtoken";

// Define the JWT payload type
interface JwtPayloadWithExp extends jwt.JwtPayload {
  id: string;
  exp?: number; // Optional because it may not always be present
}

// Redis client setup
export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("Redis Client Error", err);
  }
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Error connecting to Redis", err);
  }
};

connectRedis();

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: SUCCESS_MESSAGES.USER_CREATED });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: ERROR_MESSAGES.SIGNUP_FAILED });
    } else {
      res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await redisClient.set(refreshToken, user._id.toString(), {
      EX: 7 * 24 * 60 * 60, // Set expiration for 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      accessToken,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ error: ERROR_MESSAGES.MISSING_REFRESH_TOKEN });
      return;
    }

    await redisClient.del(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Return a success message with a 200 OK status instead of 204
    res.status(200).json({
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL,
    });
  } catch (err) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const validateAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayloadWithExp;

    res.status(200).json({
      message: SUCCESS_MESSAGES.TOKEN_VALID,
      userId: payload.id,
    });
  } catch (err) {
    console.error("Invalid token:", err); // Debug log for token validation error
    res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
  }
};
