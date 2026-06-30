const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const SALT_ROUNDS = 10;

const parseId = (value, fieldName = "id") => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(`${fieldName} must be a valid positive integer`);
    error.statusCode = 400;
    throw error;
  }

  return id;
};

const officerInclude = {
  officerProfile: {
    include: {
      department: true,
      jurisdiction: true,
    },
  },
};

const publicOfficerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  officerProfile: {
    include: {
      department: true,
      jurisdiction: true,
    },
  },
};

const assertOfficerAccess = (requestUser, officerId) => {
  if (requestUser.role === "ADMIN") {
    return;
  }

  if (requestUser.id !== officerId) {
    const error = new Error("You do not have access to this officer");
    error.statusCode = 403;
    throw error;
  }
};

const createOfficer = async ({ name, email, phone, password, departmentId, designation, jurisdictionId }) => {
  if (!name || !email || !password || !departmentId) {
    const error = new Error("Name, email, password, and departmentId are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || null,
      passwordHash,
      role: "OFFICER",
      officerProfile: {
        create: {
          departmentId: parseId(departmentId, "departmentId"),
          designation: designation || null,
          jurisdictionId: jurisdictionId ? parseId(jurisdictionId, "jurisdictionId") : null,
        },
      },
    },
    select: publicOfficerSelect,
  });
};

const listOfficers = () => {
  return prisma.user.findMany({
    where: { role: "OFFICER" },
    orderBy: { name: "asc" },
    select: publicOfficerSelect,
  });
};

const getOfficer = async (requestUser, officerId) => {
  const id = parseId(officerId, "officerId");
  assertOfficerAccess(requestUser, id);

  const officer = await prisma.user.findFirst({
    where: { id, role: "OFFICER" },
    select: publicOfficerSelect,
  });

  if (!officer) {
    const error = new Error("Officer not found");
    error.statusCode = 404;
    throw error;
  }

  return officer;
};

const updateOfficer = async (officerId, payload) => {
  const id = parseId(officerId, "officerId");

  const data = {
    name: payload.name?.trim(),
    phone: payload.phone,
    isActive: payload.isActive,
  };

  if (payload.email) {
    data.email = payload.email.trim().toLowerCase();
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...data,
      officerProfile: {
        update: {
          departmentId: payload.departmentId ? parseId(payload.departmentId, "departmentId") : undefined,
          designation: payload.designation,
          jurisdictionId: payload.jurisdictionId ? parseId(payload.jurisdictionId, "jurisdictionId") : undefined,
        },
      },
    },
    select: publicOfficerSelect,
  });
};

const deleteOfficer = async (officerId) => {
  const id = parseId(officerId, "officerId");

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
};

const listOfficerComplaints = async (requestUser, officerId) => {
  const id = parseId(officerId, "officerId");
  assertOfficerAccess(requestUser, id);

  return prisma.complaint.findMany({
    where: { assignedOfficerId: id },
    orderBy: { createdAt: "desc" },
    include: {
      citizen: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      category: true,
      department: true,
      jurisdiction: true,
    },
  });
};

module.exports = {
  createOfficer,
  listOfficers,
  getOfficer,
  updateOfficer,
  deleteOfficer,
  listOfficerComplaints,
};
