const express = require("express");
const officerController = require("../controllers/officer.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("ADMIN"), officerController.createOfficer);
router.get("/", authorize("ADMIN", "OFFICER"), officerController.listOfficers);
router.get("/:id", authorize("ADMIN", "OFFICER"), officerController.getOfficer);
router.patch("/:id", authorize("ADMIN"), officerController.updateOfficer);
router.delete("/:id", authorize("ADMIN"), officerController.deleteOfficer);
router.get("/:id/complaints", authorize("ADMIN", "OFFICER"), officerController.listOfficerComplaints);

module.exports = router;
