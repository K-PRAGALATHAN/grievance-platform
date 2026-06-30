const officerService = require("../services/officer.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const createOfficer = async (req, res) => {
  try {
    const officer = await officerService.createOfficer(req.body);
    return sendSuccess(res, "Officer created successfully", { officer }, 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listOfficers = async (req, res) => {
  try {
    const officers = await officerService.listOfficers();
    return sendSuccess(res, "Officers fetched successfully", { officers });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getOfficer = async (req, res) => {
  try {
    const officer = await officerService.getOfficer(req.user, req.params.id);
    return sendSuccess(res, "Officer fetched successfully", { officer });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateOfficer = async (req, res) => {
  try {
    const officer = await officerService.updateOfficer(req.params.id, req.body);
    return sendSuccess(res, "Officer updated successfully", { officer });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const deleteOfficer = async (req, res) => {
  try {
    await officerService.deleteOfficer(req.params.id);
    return sendSuccess(res, "Officer deleted successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const listOfficerComplaints = async (req, res) => {
  try {
    const complaints = await officerService.listOfficerComplaints(req.user, req.params.id);
    return sendSuccess(res, "Officer complaints fetched successfully", { complaints });
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createOfficer,
  listOfficers,
  getOfficer,
  updateOfficer,
  deleteOfficer,
  listOfficerComplaints,
};
