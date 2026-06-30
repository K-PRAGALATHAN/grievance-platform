const jurisdictionService = require("../services/jurisdiction.service");
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
  createJurisdiction: wrap((req) => jurisdictionService.createJurisdiction(req.body), "Jurisdiction created successfully", 201),
  listJurisdictions: wrap(() => jurisdictionService.listJurisdictions(), "Jurisdictions fetched successfully"),
  getJurisdiction: wrap((req) => jurisdictionService.getJurisdiction(req.params.id), "Jurisdiction fetched successfully"),
  updateJurisdiction: wrap((req) => jurisdictionService.updateJurisdiction(req.params.id, req.body), "Jurisdiction updated successfully"),
  deleteJurisdiction: wrap((req) => jurisdictionService.deleteJurisdiction(req.params.id), "Jurisdiction deleted successfully"),
};
