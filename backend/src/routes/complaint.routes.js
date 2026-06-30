const express = require("express");
const complaintController = require("../controllers/complaint.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", complaintController.createComplaint);
router.get("/", complaintController.listComplaints);
router.patch("/:id", complaintController.updateComplaint);
router.patch("/:id/status", authorize("ADMIN", "OFFICER"), complaintController.updateComplaintStatus);
router.patch("/:id/assign", authorize("ADMIN"), complaintController.assignComplaint);
router.delete("/:id", authorize("ADMIN"), complaintController.deleteComplaint);
router.get("/:id/history", complaintController.getComplaintHistory);
router.post("/:id/notes", authorize("ADMIN", "OFFICER"), complaintController.createInternalNote);
router.get("/:id/notes", authorize("ADMIN", "OFFICER"), complaintController.listInternalNotes);
router.post("/:id/responses", authorize("ADMIN", "OFFICER"), complaintController.createResponse);
router.get("/:id/responses", complaintController.listResponses);
router.post("/:id/resolution-drafts", authorize("ADMIN", "OFFICER"), complaintController.createResolutionDraft);
router.get("/:id/resolution-drafts", authorize("ADMIN", "OFFICER"), complaintController.listResolutionDrafts);
router.patch("/resolution-drafts/:draftId", authorize("ADMIN", "OFFICER"), complaintController.updateResolutionDraft);
router.post("/resolution-drafts/:draftId/approve", authorize("ADMIN", "OFFICER"), complaintController.approveResolutionDraft);
router.post("/resolution-drafts/:draftId/send", authorize("ADMIN", "OFFICER"), complaintController.sendResolutionDraft);
router.get("/:id", complaintController.getComplaint);

module.exports = router;
