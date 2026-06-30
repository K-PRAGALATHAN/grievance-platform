const aiService = require("../services/ai.service");
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
  analyzeComplaint: wrap((req) => aiService.analyzeComplaint(req.user, req.params.complaintId), "Complaint analyzed successfully", 201),
  routeComplaint: wrap((req) => aiService.routeComplaint(req.user, req.params.complaintId), "Complaint routing generated successfully", 201),
  draftResponse: wrap((req) => aiService.draftResponse(req.user, req.params.complaintId, req.body), "Response draft generated successfully", 201),
  listAnalyses: wrap((req) => aiService.listAnalyses(req.user, req.params.id), "AI analyses fetched successfully"),
  listAgentRuns: wrap((req) => aiService.listAgentRuns(req.user, req.params.id), "AI agent runs fetched successfully"),
};
