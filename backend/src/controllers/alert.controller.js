const alertService = require("../services/notification.service");
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
  listAlerts: wrap((req) => alertService.listAlerts(req.user), "Alerts fetched successfully"),
  markAlertRead: wrap((req) => alertService.markAlertRead(req.user, req.params.id), "Alert marked as read"),
  markAllAlertsRead: wrap((req) => alertService.markAllAlertsRead(req.user), "All alerts marked as read"),
  deleteAlert: wrap((req) => alertService.deleteAlert(req.user, req.params.id), "Alert deleted successfully"),
};
