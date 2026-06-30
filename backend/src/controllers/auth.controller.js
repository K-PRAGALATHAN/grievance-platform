const authService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    return sendSuccess(res, "User registered successfully", data, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    return sendSuccess(res, "Login successful", data);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, "Current user fetched successfully", { user });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  register,
  login,
  me,
};
