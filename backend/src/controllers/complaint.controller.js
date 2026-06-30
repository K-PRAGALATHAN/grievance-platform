const complaintService = require("../services/complaint.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const createComplaint = async (req, res) => {
  try {
    const complaint = await complaintService.createComplaint(req.user, req.body);
    return sendSuccess(res, "Complaint created successfully", { complaint }, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listComplaints = async (req, res) => {
  try {
    const complaints = await complaintService.listComplaints(req.user);
    return sendSuccess(res, "Complaints fetched successfully", { complaints });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getComplaint = async (req, res) => {
  try {
    const complaint = await complaintService.getComplaint(req.user, req.params.id);
    return sendSuccess(res, "Complaint fetched successfully", { complaint });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateComplaint = async (req, res) => {
  try {
    const complaint = await complaintService.updateComplaint(req.user, req.params.id, req.body);
    return sendSuccess(res, "Complaint updated successfully", { complaint });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await complaintService.updateComplaintStatus(req.user, req.params.id, req.body);
    return sendSuccess(res, "Complaint status updated successfully", { complaint });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const assignComplaint = async (req, res) => {
  try {
    const complaint = await complaintService.assignComplaint(req.user, req.params.id, req.body);
    return sendSuccess(res, "Complaint assigned successfully", { complaint });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const deleteComplaint = async (req, res) => {
  try {
    await complaintService.deleteComplaint(req.params.id);
    return sendSuccess(res, "Complaint deleted successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getComplaintHistory = async (req, res) => {
  try {
    const history = await complaintService.getComplaintHistory(req.user, req.params.id);
    return sendSuccess(res, "Complaint history fetched successfully", { history });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const createInternalNote = async (req, res) => {
  try {
    const note = await complaintService.createInternalNote(req.user, req.params.id, req.body);
    return sendSuccess(res, "Internal note created successfully", { note }, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listInternalNotes = async (req, res) => {
  try {
    const notes = await complaintService.listInternalNotes(req.user, req.params.id);
    return sendSuccess(res, "Internal notes fetched successfully", { notes });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const createResponse = async (req, res) => {
  try {
    const response = await complaintService.createResponse(req.user, req.params.id, req.body);
    return sendSuccess(res, "Response created successfully", { response }, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listResponses = async (req, res) => {
  try {
    const responses = await complaintService.listResponses(req.user, req.params.id);
    return sendSuccess(res, "Responses fetched successfully", { responses });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const createResolutionDraft = async (req, res) => {
  try {
    const draft = await complaintService.createResolutionDraft(req.user, req.params.id, req.body);
    return sendSuccess(res, "Resolution draft created successfully", { draft }, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listResolutionDrafts = async (req, res) => {
  try {
    const drafts = await complaintService.listResolutionDrafts(req.user, req.params.id);
    return sendSuccess(res, "Resolution drafts fetched successfully", { drafts });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateResolutionDraft = async (req, res) => {
  try {
    const draft = await complaintService.updateResolutionDraft(req.user, req.params.draftId, req.body);
    return sendSuccess(res, "Resolution draft updated successfully", { draft });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const approveResolutionDraft = async (req, res) => {
  try {
    const draft = await complaintService.approveResolutionDraft(req.user, req.params.draftId);
    return sendSuccess(res, "Resolution draft approved successfully", { draft });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const sendResolutionDraft = async (req, res) => {
  try {
    const response = await complaintService.sendResolutionDraft(req.user, req.params.draftId);
    return sendSuccess(res, "Resolution draft sent successfully", { response });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createComplaint,
  listComplaints,
  getComplaint,
  updateComplaint,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  getComplaintHistory,
  createInternalNote,
  listInternalNotes,
  createResponse,
  listResponses,
  createResolutionDraft,
  listResolutionDrafts,
  updateResolutionDraft,
  approveResolutionDraft,
  sendResolutionDraft,
};
