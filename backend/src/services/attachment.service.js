const fs = require("node:fs/promises");
const path = require("node:path");
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

const attachmentTypeFromMime = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType === "text/plain"
  ) {
    return "DOC";
  }

  return "OTHER";
};

const canAccessComplaint = (user, complaint) => {
  if (user.role === "ADMIN") return true;
  if (user.role === "CITIZEN") return complaint.citizenId === user.id;
  if (user.role === "OFFICER") return complaint.assignedOfficerId === user.id;
  return false;
};

const getAccessibleComplaint = async (user, complaintId) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: parseId(complaintId, "complaintId") },
  });

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

const uploadAttachment = async (user, complaintId, file) => {
  if (!file) {
    const error = new Error("Attachment file is required");
    error.statusCode = 400;
    throw error;
  }

  const complaint = await getAccessibleComplaint(user, complaintId);
  const fileUrl = `/uploads/complaints/${file.filename}`;

  return prisma.attachment.create({
    data: {
      complaintId: complaint.id,
      fileUrl,
      fileName: file.originalname,
      fileType: attachmentTypeFromMime(file.mimetype),
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: user.id,
    },
  });
};

const listComplaintAttachments = async (user, complaintId) => {
  const complaint = await getAccessibleComplaint(user, complaintId);

  return prisma.attachment.findMany({
    where: { complaintId: complaint.id },
    orderBy: { createdAt: "desc" },
  });
};

const getAttachment = async (user, attachmentId) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id: parseId(attachmentId, "attachmentId") },
    include: { complaint: true },
  });

  if (!attachment) {
    const error = new Error("Attachment not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessComplaint(user, attachment.complaint)) {
    const error = new Error("You do not have access to this attachment");
    error.statusCode = 403;
    throw error;
  }

  return attachment;
};

const deleteAttachment = async (user, attachmentId) => {
  const attachment = await getAttachment(user, attachmentId);

  if (user.role !== "ADMIN" && attachment.uploadedBy !== user.id) {
    const error = new Error("You do not have permission to delete this attachment");
    error.statusCode = 403;
    throw error;
  }

  await prisma.attachment.delete({
    where: { id: attachment.id },
  });

  const relativePath = attachment.fileUrl.replace(/^\/uploads\//, "");
  const absolutePath = path.resolve(__dirname, "../../uploads", relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

module.exports = {
  uploadAttachment,
  listComplaintAttachments,
  getAttachment,
  deleteAttachment,
};
