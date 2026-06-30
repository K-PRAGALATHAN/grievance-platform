const attachmentService = require("../services/attachment.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const uploadAttachment = async (req, res) => {
  try {
    const attachment = await attachmentService.uploadAttachment(req.user, req.params.id, req.file);
    return sendSuccess(res, "Attachment uploaded successfully", { attachment }, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listComplaintAttachments = async (req, res) => {
  try {
    const attachments = await attachmentService.listComplaintAttachments(req.user, req.params.id);
    return sendSuccess(res, "Attachments fetched successfully", { attachments });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getAttachment = async (req, res) => {
  try {
    const attachment = await attachmentService.getAttachment(req.user, req.params.id);
    return sendSuccess(res, "Attachment fetched successfully", { attachment });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const deleteAttachment = async (req, res) => {
  try {
    await attachmentService.deleteAttachment(req.user, req.params.id);
    return sendSuccess(res, "Attachment deleted successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  uploadAttachment,
  listComplaintAttachments,
  getAttachment,
  deleteAttachment,
};
