const express = require("express");
const alertController = require("../controllers/alert.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", alertController.listAlerts);
router.patch("/:id/read", alertController.markAlertRead);
router.patch("/read-all", alertController.markAllAlertsRead);
router.delete("/:id", alertController.deleteAlert);

module.exports = router;
