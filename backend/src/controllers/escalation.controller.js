const escalationService = require("../services/escalation.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const wrap = (fn, message, statusCode = 200) => async (req, res) => {
  try {
    const data = await fn(req);
    return sendSuccess(res, message, data, statusCode);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createEscalation: wrap((req) => escalationService.createEscalation(req.user, req.params.id, req.body), "Escalation created successfully", 201),
  listComplaintEscalations: wrap((req) => escalationService.listComplaintEscalations(req.user, req.params.id), "Escalations fetched successfully"),
  updateEscalation: wrap((req) => escalationService.updateEscalation(req.user, req.params.id, req.body), "Escalation updated successfully"),
};
