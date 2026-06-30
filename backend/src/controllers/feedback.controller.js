const feedbackService = require("../services/feedback.service");
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
  createFeedback: wrap((req) => feedbackService.createFeedback(req.user, req.params.id, req.body), "Feedback submitted successfully", 201),
  getComplaintFeedback: wrap((req) => feedbackService.getComplaintFeedback(req.user, req.params.id), "Feedback fetched successfully"),
  listFeedback: wrap((req) => feedbackService.listFeedback(req.user), "Feedback fetched successfully"),
};
