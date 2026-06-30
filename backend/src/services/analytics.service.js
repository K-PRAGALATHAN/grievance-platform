const prisma = require("../config/prisma");

const complaintScope = (user) => {
  if (user.role === "OFFICER") {
    return { assignedOfficerId: user.id };
  }
  return {};
};

const overview = async (user) => {
  const where = complaintScope(user);
  const [totalComplaints, openComplaints, resolvedComplaints, escalatedComplaints, alertsUnread] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.count({ where: { ...where, status: { notIn: ["RESOLVED", "REJECTED"] } } }),
    prisma.complaint.count({ where: { ...where, status: "RESOLVED" } }),
    prisma.complaint.count({ where: { ...where, status: "ESCALATED" } }),
    prisma.alert.count({ where: user.role === "ADMIN" ? { isRead: false } : { userId: user.id, isRead: false } }),
  ]);

  return { totalComplaints, openComplaints, resolvedComplaints, escalatedComplaints, alertsUnread };
};

const groupComplaints = async (user, by) => {
  return prisma.complaint.groupBy({
    by: [by],
    where: complaintScope(user),
    _count: { _all: true },
  });
};

const complaintsByStatus = (user) => groupComplaints(user, "status");
const complaintsByDepartment = (user) => groupComplaints(user, "departmentId");
const complaintsByPriority = (user) => groupComplaints(user, "priority");

const slaBreaches = async (user) => {
  const where = complaintScope(user);
  return prisma.complaint.findMany({
    where: { ...where, status: { notIn: ["RESOLVED", "REJECTED"] } },
    orderBy: { createdAt: "asc" },
    include: { department: true, assignedOfficer: { select: { id: true, name: true, email: true } } },
  });
};

const officerWorkload = () => {
  return prisma.user.findMany({
    where: { role: "OFFICER" },
    select: {
      id: true,
      name: true,
      email: true,
      officerProfile: { include: { department: true, jurisdiction: true } },
      _count: { select: { assignedComplaints: true } },
    },
    orderBy: { name: "asc" },
  });
};

module.exports = {
  overview,
  complaintsByStatus,
  complaintsByDepartment,
  complaintsByPriority,
  slaBreaches,
  officerWorkload,
};
