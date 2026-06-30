const express = require("express");
const aiController = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/analyze/:complaintId", authorize("ADMIN", "OFFICER"), aiController.analyzeComplaint);
router.post("/route/:complaintId", authorize("ADMIN", "OFFICER"), aiController.routeComplaint);
router.post("/draft-response/:complaintId", authorize("ADMIN", "OFFICER"), aiController.draftResponse);
router.get("/complaints/:id/ai-analyses", aiController.listAnalyses);
router.get("/complaints/:id/agent-runs", authorize("ADMIN", "OFFICER"), aiController.listAgentRuns);

module.exports = router;
