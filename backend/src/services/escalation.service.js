const prisma = require("../config/prisma");
const { parseId, canAccessComplaint } = require("./common.service");

const validStatuses = new Set(["OPEN", "ACKNOWLEDGED", "CLOSED"]);

const getComplaint = async (user, complaintId) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: parseId(complaintId, "complaintId") } });
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    throw error;
  }
  if (!canAccessComplaint(user, complaint)) {
    const error = new Error("You do not have access to this complaint");
    error.statusCode = 403;
    throw error;
  }
  return complaint;
};

const createEscalation = async (user, complaintId, { reason, escalatedTo, escalationLevel }) => {
  if (!reason) {
    const error = new Error("Escalation reason is required");
    error.statusCode = 400;
    throw error;
  }
  const complaint = await getComplaint(user, complaintId);
  const escalation = await prisma.escalation.create({
    data: {
      complaintId: complaint.id,
      reason: reason.trim(),
      escalatedBy: user.id,
      escalatedTo: escalatedTo ? parseId(escalatedTo, "escalatedTo") : null,
      escalationLevel: escalationLevel ? parseId(escalationLevel, "escalationLevel") : 1,
    },
  });
  await prisma.complaint.update({ where: { id: complaint.id }, data: { status: "ESCALATED" } });
  return escalation;
};

const listComplaintEscalations = async (user, complaintId) => {
  const complaint = await getComplaint(user, complaintId);
  return prisma.escalation.findMany({ where: { complaintId: complaint.id }, orderBy: { escalatedAt: "desc" } });
};

const updateEscalation = async (user, escalationId, { status, resolvedAt }) => {
  const escalation = await prisma.escalation.findUnique({
    where: { id: parseId(escalationId, "escalationId") },
    include: { complaint: true },
  });
  if (!escalation) {
    const error = new Error("Escalation not found");
    error.statusCode = 404;
    throw error;
  }
  if (!canAccessComplaint(user, escalation.complaint)) {
    const error = new Error("You do not have access to this escalation");
    error.statusCode = 403;
    throw error;
  }
  if (status && !validStatuses.has(status)) {
    const error = new Error("Invalid escalation status");
    error.statusCode = 400;
    throw error;
  }
  return prisma.escalation.update({
    where: { id: escalation.id },
    data: { status, resolvedAt: status === "CLOSED" ? resolvedAt ? new Date(resolvedAt) : new Date() : undefined },
  });
};

module.exports = { createEscalation, listComplaintEscalations, updateEscalation };
