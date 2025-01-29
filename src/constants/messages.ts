export const SUCCESS_MESSAGES = {
  USER_CREATED: "Signup successful",
  LOGIN_SUCCESSFUL: "Login successful",
  LEAD_CREATED: "Lead created successfully",
  LEAD_UPDATED: "Lead updated successfully",
  LEAD_DELETED: "Lead deleted successfully",
  LOGOUT_SUCCESSFUL: "Logout successful",
  TOKEN_VALID: "Token is valid", // Added this line
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  INTERNAL_SERVER_ERROR: "Internal server error",
  SIGNUP_FAILED: "Signup failed. Please check your details.",
  VALIDATION_FAILED: "Validation failed",
  EMAIL_IS_REQUIRED: "Email is required",
  INVALID_EMAIL_ADDRESS: "Invalid email address",
  PASSWORD_IS_REQUIRED: "Password is required",
  PASSWORD_MUST_CONTAIN_AT_LEAST_EIGHT_CHAR:
    "Password must be at least 8 characters long",
  PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_UPPERCASE_LETTER:
    "Password must contain at least one uppercase letter",
  PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_NUMBER:
    "Password must contain at least one number",
  INVALID_CREDENTIALS: "Invalid credentials",
  EMAIL_ALREADY_EXISTS: "Email already exists", // Added this line
  MISSING_REFRESH_TOKEN: "Missing refresh token", // Added this line
  INVALID_TOKEN: "Invalid token", // Added this line
  LEAD_NOT_FOUND: "Lead not found",
};
