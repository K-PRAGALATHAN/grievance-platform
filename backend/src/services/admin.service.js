const prisma = require("../config/prisma");
const { parseId } = require("./common.service");

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  languagePreference: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  citizenProfile: true,
  officerProfile: { include: { department: true, jurisdiction: true } },
};

const listUsers = () => prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: publicUserSelect });

const getUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: parseId(userId, "userId") }, select: publicUserSelect });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUser = (userId, payload) => {
  return prisma.user.update({
    where: { id: parseId(userId, "userId") },
    data: {
      name: payload.name?.trim(),
      email: payload.email?.trim().toLowerCase(),
      phone: payload.phone,
      languagePreference: payload.languagePreference,
      role: payload.role,
      isActive: payload.isActive,
    },
    select: publicUserSelect,
  });
};

const setUserActive = (userId, isActive) => {
  return prisma.user.update({ where: { id: parseId(userId, "userId") }, data: { isActive }, select: publicUserSelect });
};

const listAuditLogs = () => prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: publicUserSelect } } });

module.exports = { listUsers, getUser, updateUser, setUserActive, listAuditLogs };
