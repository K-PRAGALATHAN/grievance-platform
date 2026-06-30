const adminService = require("../services/admin.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const wrap = (fn, message) => async (req, res) => {
  try {
    const data = await fn(req);
    return sendSuccess(res, message, data);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  listUsers: wrap(() => adminService.listUsers(), "Users fetched successfully"),
  getUser: wrap((req) => adminService.getUser(req.params.id), "User fetched successfully"),
  updateUser: wrap((req) => adminService.updateUser(req.params.id, req.body), "User updated successfully"),
  activateUser: wrap((req) => adminService.setUserActive(req.params.id, true), "User activated successfully"),
  deactivateUser: wrap((req) => adminService.setUserActive(req.params.id, false), "User deactivated successfully"),
  listAuditLogs: wrap(() => adminService.listAuditLogs(), "Audit logs fetched successfully"),
};
