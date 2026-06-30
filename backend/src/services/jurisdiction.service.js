const prisma = require("../config/prisma");
const { parseId } = require("./common.service");

const createJurisdiction = ({ name, type, parentId }) => {
  if (!name || !type) {
    const error = new Error("Jurisdiction name and type are required");
    error.statusCode = 400;
    throw error;
  }
  return prisma.jurisdiction.create({ data: { name: name.trim(), type: type.trim(), parentId: parentId ? parseId(parentId, "parentId") : null } });
};

const listJurisdictions = () => prisma.jurisdiction.findMany({ orderBy: { name: "asc" } });

const getJurisdiction = async (id) => {
  const jurisdiction = await prisma.jurisdiction.findUnique({
    where: { id: parseId(id, "jurisdictionId") },
    include: { complaints: true, officers: true },
  });
  if (!jurisdiction) {
    const error = new Error("Jurisdiction not found");
    error.statusCode = 404;
    throw error;
  }
  return jurisdiction;
};

const updateJurisdiction = (id, payload) => {
  return prisma.jurisdiction.update({
    where: { id: parseId(id, "jurisdictionId") },
    data: { name: payload.name?.trim(), type: payload.type?.trim(), parentId: payload.parentId ? parseId(payload.parentId, "parentId") : undefined },
  });
};

const deleteJurisdiction = async (id) => {
  await prisma.jurisdiction.delete({ where: { id: parseId(id, "jurisdictionId") } });
  return null;
};

module.exports = { createJurisdiction, listJurisdictions, getJurisdiction, updateJurisdiction, deleteJurisdiction };
