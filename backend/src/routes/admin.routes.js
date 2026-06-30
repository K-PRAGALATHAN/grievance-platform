const express = require("express");
const adminController = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.patch("/users/:id", adminController.updateUser);
router.patch("/users/:id/activate", adminController.activateUser);
router.patch("/users/:id/deactivate", adminController.deactivateUser);
router.get("/audit-logs", adminController.listAuditLogs);

module.exports = router;
