const express = require("express");
const departmentController = require("../controllers/department.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/departments", authorize("ADMIN"), departmentController.createDepartment);
router.get("/departments", departmentController.listDepartments);
router.get("/departments/:id", departmentController.getDepartment);
router.patch("/departments/:id", authorize("ADMIN"), departmentController.updateDepartment);
router.delete("/departments/:id", authorize("ADMIN"), departmentController.deleteDepartment);

router.post("/departments/:id/categories", authorize("ADMIN"), departmentController.createCategory);
router.get("/categories", departmentController.listCategories);
router.get("/categories/:id", departmentController.getCategory);
router.patch("/categories/:id", authorize("ADMIN"), departmentController.updateCategory);
router.delete("/categories/:id", authorize("ADMIN"), departmentController.deleteCategory);

module.exports = router;
