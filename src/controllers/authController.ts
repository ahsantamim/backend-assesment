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

// Create a Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379", // Redis URL from environment or default to localhost
});

redisClient.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("Redis Client Error", err);
  }
});

// Attempt to connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Error connecting to Redis", err);
  }
};

connectRedis(); // Try to connect to Redis when the service starts

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: SUCCESS_MESSAGES.USER_CREATED });
  } catch (err: Error | any) {
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

    // Store the refresh token in the browser cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure cookies in production
      sameSite: "strict",
    });

    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL, accessToken });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    return;
  }

  try {
    // Add the token to Redis with an expiration time
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayloadWithExp;

    if (!decoded.exp) {
      res.status(400).json({ error: "Token expiration not found" });
      return;
    }

    const expiration = decoded.exp - Math.floor(Date.now() / 1000);

    // Set the JWT to be blacklisted in Redis with the expiration time of the original token
    await redisClient.set(`blacklist:${token}`, "logged_out", {
      EX: expiration, // Expire the key when the JWT expires
    });

    res.status(200).json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
