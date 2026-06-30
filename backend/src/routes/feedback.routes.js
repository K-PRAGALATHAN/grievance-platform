const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/complaints/:id/feedback", authorize("CITIZEN"), feedbackController.createFeedback);
router.get("/complaints/:id/feedback", feedbackController.getComplaintFeedback);
router.get("/feedback", authorize("ADMIN", "OFFICER"), feedbackController.listFeedback);

module.exports = router;
