const analyticsService = require("../services/analytics.service");
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
  overview: wrap((req) => analyticsService.overview(req.user), "Analytics overview fetched successfully"),
  complaintsByStatus: wrap((req) => analyticsService.complaintsByStatus(req.user), "Complaints by status fetched successfully"),
  complaintsByDepartment: wrap((req) => analyticsService.complaintsByDepartment(req.user), "Complaints by department fetched successfully"),
  complaintsByPriority: wrap((req) => analyticsService.complaintsByPriority(req.user), "Complaints by priority fetched successfully"),
  slaBreaches: wrap((req) => analyticsService.slaBreaches(req.user), "SLA breaches fetched successfully"),
  officerWorkload: wrap(() => analyticsService.officerWorkload(), "Officer workload fetched successfully"),
};
