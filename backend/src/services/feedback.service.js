const prisma = require("../config/prisma");
const { parseId, canAccessComplaint } = require("./common.service");

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

const createFeedback = async (user, complaintId, { rating, comment }) => {
  const complaint = await getComplaint(user, complaintId);
  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    const error = new Error("Rating must be an integer between 1 and 5");
    error.statusCode = 400;
    throw error;
  }
  if (complaint.citizenId !== user.id) {
    const error = new Error("Only the complaint owner can submit feedback");
    error.statusCode = 403;
    throw error;
  }
  return prisma.citizenFeedback.upsert({
    where: { complaintId: complaint.id },
    update: { rating: parsedRating, comment: comment || null },
    create: { complaintId: complaint.id, citizenId: user.id, rating: parsedRating, comment: comment || null },
  });
};

const getComplaintFeedback = async (user, complaintId) => {
  const complaint = await getComplaint(user, complaintId);
  return prisma.citizenFeedback.findUnique({ where: { complaintId: complaint.id } });
};

const listFeedback = () => {
  return prisma.citizenFeedback.findMany({ orderBy: { createdAt: "desc" }, include: { complaint: true } });
};

module.exports = { createFeedback, getComplaintFeedback, listFeedback };
