const express = require("express");
const slaController = require("../controllers/sla.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/", slaController.createSlaPolicy);
router.get("/", slaController.listSlaPolicies);
router.patch("/:id", slaController.updateSlaPolicy);
router.delete("/:id", slaController.deleteSlaPolicy);

module.exports = router;
