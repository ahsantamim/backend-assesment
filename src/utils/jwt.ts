import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    {
      id: userId,
      timestamp: Date.now(),
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    {
      id: userId,
      timestamp: Date.now(),
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (
  token: string,
  secret: string
): string | jwt.JwtPayload => {
  return jwt.verify(token, secret);
};
