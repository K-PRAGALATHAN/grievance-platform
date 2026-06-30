const express = require("express");
const analyticsController = require("../controllers/analytics.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN", "OFFICER"));

router.get("/overview", analyticsController.overview);
router.get("/complaints-by-status", analyticsController.complaintsByStatus);
router.get("/complaints-by-department", analyticsController.complaintsByDepartment);
router.get("/complaints-by-priority", analyticsController.complaintsByPriority);
router.get("/sla-breaches", analyticsController.slaBreaches);
router.get("/officer-workload", analyticsController.officerWorkload);

module.exports = router;
