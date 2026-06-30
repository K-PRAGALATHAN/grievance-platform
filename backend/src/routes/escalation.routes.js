const express = require("express");
const escalationController = require("../controllers/escalation.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/complaints/:id/escalations", authorize("ADMIN", "OFFICER"), escalationController.createEscalation);
router.get("/complaints/:id/escalations", escalationController.listComplaintEscalations);
router.patch("/escalations/:id", authorize("ADMIN", "OFFICER"), escalationController.updateEscalation);

module.exports = router;
