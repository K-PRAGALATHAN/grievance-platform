const parseId = (value, fieldName = "id") => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(`${fieldName} must be a valid positive integer`);
    error.statusCode = 400;
    throw error;
  }

  return id;
};

const assertRole = (user, roles) => {
  if (!roles.includes(user.role)) {
    const error = new Error("You do not have permission to perform this action");
    error.statusCode = 403;
    throw error;
  }
};

const canAccessComplaint = (user, complaint) => {
  if (user.role === "ADMIN") return true;
  if (user.role === "CITIZEN") return complaint.citizenId === user.id;
  if (user.role === "OFFICER") return complaint.assignedOfficerId === user.id;
  return false;
};

module.exports = {
  parseId,
  assertRole,
  canAccessComplaint,
};
