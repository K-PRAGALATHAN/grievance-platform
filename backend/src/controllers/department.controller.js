const departmentService = require("../services/department.service");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const handle = (fn, successMessage, statusCode = 200) => async (req, res) => {
  try {
    const data = await fn(req);
    return sendSuccess(res, successMessage, data, statusCode);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createDepartment: handle((req) => departmentService.createDepartment(req.body), "Department created successfully", 201),
  listDepartments: handle(() => departmentService.listDepartments(), "Departments fetched successfully"),
  getDepartment: handle((req) => departmentService.getDepartment(req.params.id), "Department fetched successfully"),
  updateDepartment: handle((req) => departmentService.updateDepartment(req.params.id, req.body), "Department updated successfully"),
  deleteDepartment: handle((req) => departmentService.deleteDepartment(req.params.id), "Department deleted successfully"),
  createCategory: handle((req) => departmentService.createCategory(req.params.id, req.body), "Category created successfully", 201),
  listCategories: handle(() => departmentService.listCategories(), "Categories fetched successfully"),
  getCategory: handle((req) => departmentService.getCategory(req.params.id), "Category fetched successfully"),
  updateCategory: handle((req) => departmentService.updateCategory(req.params.id, req.body), "Category updated successfully"),
  deleteCategory: handle((req) => departmentService.deleteCategory(req.params.id), "Category deleted successfully"),
};
