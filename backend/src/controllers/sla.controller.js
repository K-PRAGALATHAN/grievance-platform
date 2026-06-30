const slaService = require("../services/sla.service");
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
  createSlaPolicy: wrap((req) => slaService.createSlaPolicy(req.body), "SLA policy created successfully", 201),
  listSlaPolicies: wrap(() => slaService.listSlaPolicies(), "SLA policies fetched successfully"),
  updateSlaPolicy: wrap((req) => slaService.updateSlaPolicy(req.params.id, req.body), "SLA policy updated successfully"),
  deleteSlaPolicy: wrap((req) => slaService.deleteSlaPolicy(req.params.id), "SLA policy deleted successfully"),
};
