const jwt = require("jsonwebtoken");
const env = require("../config/env");
const prisma = require("../config/prisma");
const { sendError } = require("../utils/responseHandler");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authorization token is required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, "Invalid or inactive user", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

module.exports = {
  authenticate,
};
