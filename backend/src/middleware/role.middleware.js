const { sendError } = require("../utils/responseHandler");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication is required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", 403);
    }

    return next();
  };
};

module.exports = {
  authorize,
};
