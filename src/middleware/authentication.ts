import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ERROR_MESSAGES } from "../constants/messages";
import { redisClient } from "../controllers/authController"; // Import the Redis client

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

// Define the JWT payload type with `exp` property
interface JwtPayloadWithExp extends jwt.JwtPayload {
  id: string;
  exp?: number; // Optional, but should be checked for existence
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).send(ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  try {
    // Check if the token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    // Verify and decode the JWT with explicit type assertion
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayloadWithExp;

    // Check if `exp` exists and is valid
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      res.status(401).json({ error: "Token is expired" });
      return;
    }

    req.user = decoded; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    return;
  }
};
