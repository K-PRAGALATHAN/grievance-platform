const prisma = require("../config/prisma");
const { parseId } = require("./common.service");

const validPriorities = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const validatePriority = (priority) => {
  if (!validPriorities.has(priority)) {
    const error = new Error("Invalid priority");
    error.statusCode = 400;
    throw error;
  }
  return priority;
};

const createSlaPolicy = ({ priority, departmentId, responseTimeHours, resolutionTimeHours }) => {
  if (!priority || !departmentId || !responseTimeHours || !resolutionTimeHours) {
    const error = new Error("Priority, departmentId, responseTimeHours, and resolutionTimeHours are required");
    error.statusCode = 400;
    throw error;
  }
  return prisma.slaPolicy.create({
    data: {
      priority: validatePriority(priority),
      departmentId: parseId(departmentId, "departmentId"),
      responseTimeHours: parseId(responseTimeHours, "responseTimeHours"),
      resolutionTimeHours: parseId(resolutionTimeHours, "resolutionTimeHours"),
    },
    include: { department: true },
  });
};

const listSlaPolicies = () => prisma.slaPolicy.findMany({ orderBy: { id: "asc" }, include: { department: true } });

const updateSlaPolicy = (id, payload) => {
  return prisma.slaPolicy.update({
    where: { id: parseId(id, "slaPolicyId") },
    data: {
      priority: payload.priority ? validatePriority(payload.priority) : undefined,
      departmentId: payload.departmentId ? parseId(payload.departmentId, "departmentId") : undefined,
      responseTimeHours: payload.responseTimeHours ? parseId(payload.responseTimeHours, "responseTimeHours") : undefined,
      resolutionTimeHours: payload.resolutionTimeHours ? parseId(payload.resolutionTimeHours, "resolutionTimeHours") : undefined,
    },
    include: { department: true },
  });
};

const deleteSlaPolicy = async (id) => {
  await prisma.slaPolicy.delete({ where: { id: parseId(id, "slaPolicyId") } });
  return null;
};

module.exports = { createSlaPolicy, listSlaPolicies, updateSlaPolicy, deleteSlaPolicy };
