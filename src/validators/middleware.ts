import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ERROR_MESSAGES } from "../constants/messages";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: ERROR_MESSAGES.VALIDATION_FAILED,
      details: errors.array(),
    });
    return;
  }
  next();
};
