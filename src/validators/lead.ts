import { body, param } from "express-validator";
import { handleValidationErrors } from "./middleware";

export const createLeadValidator = () => [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("phone").notEmpty().withMessage("Phone is required"),
  handleValidationErrors,
];

export const updateLeadValidator = () => [
  param("id").isMongoId().withMessage("Invalid lead ID format"),
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
  body("status")
    .optional()
    .isIn(["open", "contacted", "closed"])
    .withMessage("Invalid status value"),
  body("assignedTo")
    .optional()
    .notEmpty()
    .withMessage("Assigned user is required"),
  handleValidationErrors,
];

export const getLeadByIdValidator = () => [
  param("id").isMongoId().withMessage("Invalid lead ID format"),
  handleValidationErrors,
];

export const deleteLeadValidator = () => [
  param("id").isMongoId().withMessage("Invalid lead ID format"),
  handleValidationErrors,
];
