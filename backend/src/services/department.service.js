const prisma = require("../config/prisma");

const parseId = (value, fieldName = "id") => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(`${fieldName} must be a valid positive integer`);
    error.statusCode = 400;
    throw error;
  }

  return id;
};

const notFound = (entity) => {
  const error = new Error(`${entity} not found`);
  error.statusCode = 404;
  return error;
};

const createDepartment = async ({ name, code, description }) => {
  if (!name || !code) {
    const error = new Error("Department name and code are required");
    error.statusCode = 400;
    throw error;
  }

  return prisma.department.create({
    data: {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || null,
    },
  });
};

const listDepartments = () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { categories: true },
  });
};

const getDepartment = async (departmentId) => {
  const department = await prisma.department.findUnique({
    where: { id: parseId(departmentId, "departmentId") },
    include: { categories: true, officers: true, slaPolicies: true },
  });

  if (!department) {
    throw notFound("Department");
  }

  return department;
};

const updateDepartment = (departmentId, payload) => {
  return prisma.department.update({
    where: { id: parseId(departmentId, "departmentId") },
    data: {
      name: payload.name?.trim(),
      code: payload.code?.trim().toUpperCase(),
      description: payload.description,
    },
  });
};

const deleteDepartment = async (departmentId) => {
  await prisma.department.delete({
    where: { id: parseId(departmentId, "departmentId") },
  });

  return null;
};

const createCategory = async (departmentId, { name, description }) => {
  if (!name) {
    const error = new Error("Category name is required");
    error.statusCode = 400;
    throw error;
  }

  return prisma.complaintCategory.create({
    data: {
      name: name.trim(),
      description: description || null,
      departmentId: parseId(departmentId, "departmentId"),
    },
    include: { department: true },
  });
};

const listCategories = () => {
  return prisma.complaintCategory.findMany({
    orderBy: { name: "asc" },
    include: { department: true },
  });
};

const getCategory = async (categoryId) => {
  const category = await prisma.complaintCategory.findUnique({
    where: { id: parseId(categoryId, "categoryId") },
    include: { department: true },
  });

  if (!category) {
    throw notFound("Category");
  }

  return category;
};

const updateCategory = (categoryId, payload) => {
  return prisma.complaintCategory.update({
    where: { id: parseId(categoryId, "categoryId") },
    data: {
      name: payload.name?.trim(),
      description: payload.description,
      departmentId: payload.departmentId ? parseId(payload.departmentId, "departmentId") : undefined,
    },
    include: { department: true },
  });
};

const deleteCategory = async (categoryId) => {
  await prisma.complaintCategory.delete({
    where: { id: parseId(categoryId, "categoryId") },
  });

  return null;
};

module.exports = {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
