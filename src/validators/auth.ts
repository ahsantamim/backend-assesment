import { body } from "express-validator";
import { ERROR_MESSAGES } from "../constants/messages";
import { handleValidationErrors } from "./middleware";

export const signupValidator = () => {
  return [
    body("email")
      .exists()
      .withMessage(ERROR_MESSAGES.EMAIL_IS_REQUIRED)
      .isEmail()
      .withMessage(ERROR_MESSAGES.INVALID_EMAIL_ADDRESS)
      .normalizeEmail(),
    body("password")
      .exists()
      .withMessage(ERROR_MESSAGES.PASSWORD_IS_REQUIRED)
      .isLength({ min: 8 })
      .withMessage(ERROR_MESSAGES.PASSWORD_MUST_CONTAIN_AT_LEAST_EIGHT_CHAR)
      .matches(/^(?=.*[A-Z]).*$/)
      .withMessage(
        ERROR_MESSAGES.PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_UPPERCASE_LETTER
      )
      .matches(/^(?=.*\d).*$/)
      .withMessage(ERROR_MESSAGES.PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_NUMBER)
      .trim(),
    handleValidationErrors,
  ];
};

export const loginValidator = () => [
  body("email")
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL_ADDRESS)
    .notEmpty()
    .withMessage(ERROR_MESSAGES.EMAIL_IS_REQUIRED)
    .trim()
    .normalizeEmail(),
  body("password").notEmpty().withMessage(ERROR_MESSAGES.PASSWORD_IS_REQUIRED),
  handleValidationErrors,
];
