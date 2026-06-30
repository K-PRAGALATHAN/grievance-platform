const express = require("express");
const jurisdictionController = require("../controllers/jurisdiction.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("ADMIN"), jurisdictionController.createJurisdiction);
router.get("/", jurisdictionController.listJurisdictions);
router.get("/:id", jurisdictionController.getJurisdiction);
router.patch("/:id", authorize("ADMIN"), jurisdictionController.updateJurisdiction);
router.delete("/:id", authorize("ADMIN"), jurisdictionController.deleteJurisdiction);

module.exports = router;
