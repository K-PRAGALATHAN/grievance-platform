const prisma = require("../config/prisma");
const generateComplaintNumber = require("../utils/generateComplaintNumber");

const complaintInclude = {
  citizen: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  assignedOfficer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  category: true,
  department: true,
  jurisdiction: true,
};

const parseOptionalId = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a valid positive integer`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const parseOptionalFloat = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const canViewComplaint = (user, complaint) => {
  if (user.role === "ADMIN") {
    return true;
  }

  if (user.role === "CITIZEN") {
    return complaint.citizenId === user.id;
  }

  if (user.role === "OFFICER") {
    return complaint.assignedOfficerId === user.id;
  }

  return false;
};

const canUpdateComplaint = (user, complaint) => {
  if (user.role === "ADMIN") {
    return true;
  }

  if (user.role === "CITIZEN") {
    return complaint.citizenId === user.id && complaint.status === "SUBMITTED";
  }

  if (user.role === "OFFICER") {
    return complaint.assignedOfficerId === user.id;
  }

  return false;
};

const assertComplaintAccess = (user, complaint) => {
  if (!canViewComplaint(user, complaint)) {
    const error = new Error("You do not have access to this complaint");
    error.statusCode = 403;
    throw error;
  }
};

const getComplaintForAccess = async (complaintId) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: parseOptionalId(complaintId, "complaintId") },
  });

  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    throw error;
  }

  return complaint;
};

const validStatuses = new Set([
  "SUBMITTED",
  "TRIAGED",
  "ASSIGNED",
  "IN_REVIEW",
  "RESOLVED",
  "REJECTED",
  "ESCALATED",
]);

const createComplaint = async (user, payload) => {
  if (!payload.title || !payload.description) {
    const error = new Error("Title and description are required");
    error.statusCode = 400;
    throw error;
  }

  const complaint = await prisma.complaint.create({
    data: {
      complaintNumber: generateComplaintNumber(),
      citizenId: user.id,
      title: payload.title.trim(),
      description: payload.description.trim(),
      categoryId: parseOptionalId(payload.categoryId, "categoryId"),
      departmentId: parseOptionalId(payload.departmentId, "departmentId"),
      jurisdictionId: parseOptionalId(payload.jurisdictionId, "jurisdictionId"),
      locationText: payload.locationText || null,
      latitude: parseOptionalFloat(payload.latitude, "latitude"),
      longitude: parseOptionalFloat(payload.longitude, "longitude"),
      language: payload.language || null,
      sourceChannel: payload.sourceChannel || "WEB",
    },
    include: complaintInclude,
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaint.id,
      newStatus: complaint.status,
      changedBy: user.id,
      note: "Complaint submitted",
    },
  });

  return complaint;
};

const listComplaints = async (user) => {
  const where = {};

  if (user.role === "CITIZEN") {
    where.citizenId = user.id;
  }

  if (user.role === "OFFICER") {
    where.assignedOfficerId = user.id;
  }

  return prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: complaintInclude,
  });
};

const getComplaint = async (user, complaintId) => {
  const id = parseOptionalId(complaintId, "complaintId");

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      ...complaintInclude,
      attachments: true,
      aiAnalyses: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      responses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    throw error;
  }

  assertComplaintAccess(user, complaint);

  return complaint;
};

const updateComplaint = async (user, complaintId, payload) => {
  const existingComplaint = await getComplaintForAccess(complaintId);

  if (!canUpdateComplaint(user, existingComplaint)) {
    const error = new Error("You do not have permission to update this complaint");
    error.statusCode = 403;
    throw error;
  }

  return prisma.complaint.update({
    where: { id: existingComplaint.id },
    data: {
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      categoryId: payload.categoryId ? parseOptionalId(payload.categoryId, "categoryId") : undefined,
      departmentId: payload.departmentId ? parseOptionalId(payload.departmentId, "departmentId") : undefined,
      jurisdictionId: payload.jurisdictionId ? parseOptionalId(payload.jurisdictionId, "jurisdictionId") : undefined,
      locationText: payload.locationText,
      latitude: payload.latitude !== undefined ? parseOptionalFloat(payload.latitude, "latitude") : undefined,
      longitude: payload.longitude !== undefined ? parseOptionalFloat(payload.longitude, "longitude") : undefined,
      language: payload.language,
    },
    include: complaintInclude,
  });
};

const updateComplaintStatus = async (user, complaintId, { status, note }) => {
  if (!validStatuses.has(status)) {
    const error = new Error("Invalid complaint status");
    error.statusCode = 400;
    throw error;
  }

  const existingComplaint = await getComplaintForAccess(complaintId);

  if (user.role === "OFFICER" && existingComplaint.assignedOfficerId !== user.id) {
    const error = new Error("You can update only complaints assigned to you");
    error.statusCode = 403;
    throw error;
  }

  const complaint = await prisma.complaint.update({
    where: { id: existingComplaint.id },
    data: { status },
    include: complaintInclude,
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaint.id,
      oldStatus: existingComplaint.status,
      newStatus: status,
      changedBy: user.id,
      note: note || null,
    },
  });

  return complaint;
};

const assignComplaint = async (user, complaintId, { officerId, departmentId, note }) => {
  const id = parseOptionalId(complaintId, "complaintId");
  const parsedOfficerId = parseOptionalId(officerId, "officerId");

  const officer = await prisma.user.findFirst({
    where: { id: parsedOfficerId, role: "OFFICER", isActive: true },
    include: { officerProfile: true },
  });

  if (!officer || !officer.officerProfile) {
    const error = new Error("Active officer not found");
    error.statusCode = 404;
    throw error;
  }

  const existingComplaint = await getComplaintForAccess(id);
  const nextDepartmentId = departmentId
    ? parseOptionalId(departmentId, "departmentId")
    : officer.officerProfile.departmentId;

  const complaint = await prisma.complaint.update({
    where: { id },
    data: {
      assignedOfficerId: parsedOfficerId,
      departmentId: nextDepartmentId,
      status: "ASSIGNED",
    },
    include: complaintInclude,
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: id,
      oldStatus: existingComplaint.status,
      newStatus: "ASSIGNED",
      changedBy: user.id,
      note: note || `Assigned to officer ${parsedOfficerId}`,
    },
  });

  await prisma.routingDecision.create({
    data: {
      complaintId: id,
      departmentId: nextDepartmentId,
      officerId: parsedOfficerId,
      reason: note || "Manual assignment",
      isAiDecided: false,
      approvedBy: user.id,
    },
  });

  return complaint;
};

const deleteComplaint = async (complaintId) => {
  await prisma.complaint.delete({
    where: { id: parseOptionalId(complaintId, "complaintId") },
  });
};

const getComplaintHistory = async (user, complaintId) => {
  const complaint = await getComplaintForAccess(complaintId);
  assertComplaintAccess(user, complaint);

  return prisma.complaintStatusHistory.findMany({
    where: { complaintId: complaint.id },
    orderBy: { createdAt: "desc" },
  });
};

const createInternalNote = async (user, complaintId, { note }) => {
  if (!note) {
    const error = new Error("Note is required");
    error.statusCode = 400;
    throw error;
  }

  const complaint = await getComplaintForAccess(complaintId);

  if (user.role === "OFFICER" && complaint.assignedOfficerId !== user.id) {
    const error = new Error("You can add notes only to complaints assigned to you");
    error.statusCode = 403;
    throw error;
  }

  return prisma.internalNote.create({
    data: {
      complaintId: complaint.id,
      officerId: user.id,
      note: note.trim(),
    },
  });
};

const listInternalNotes = async (user, complaintId) => {
  const complaint = await getComplaintForAccess(complaintId);

  if (user.role === "OFFICER" && complaint.assignedOfficerId !== user.id) {
    const error = new Error("You can view notes only for complaints assigned to you");
    error.statusCode = 403;
    throw error;
  }

  return prisma.internalNote.findMany({
    where: { complaintId: complaint.id },
    orderBy: { createdAt: "desc" },
  });
};

const assertOfficerCanWork = (user, complaint) => {
  if (user.role === "ADMIN") return;
  if (user.role === "OFFICER" && complaint.assignedOfficerId === user.id) return;

  const error = new Error("You can work only on complaints assigned to you");
  error.statusCode = 403;
  throw error;
};

const createResponse = async (user, complaintId, { message, isFinalResponse = false }) => {
  if (!message) {
    const error = new Error("Response message is required");
    error.statusCode = 400;
    throw error;
  }

  const complaint = await getComplaintForAccess(complaintId);
  assertOfficerCanWork(user, complaint);

  return prisma.response.create({
    data: {
      complaintId: complaint.id,
      officerId: user.id,
      message: message.trim(),
      isFinalResponse: Boolean(isFinalResponse),
      sentAt: isFinalResponse ? new Date() : null,
    },
  });
};

const listResponses = async (user, complaintId) => {
  const complaint = await getComplaintForAccess(complaintId);
  assertComplaintAccess(user, complaint);

  return prisma.response.findMany({
    where: { complaintId: complaint.id },
    orderBy: { createdAt: "desc" },
  });
};

const createResolutionDraft = async (user, complaintId, { draftText }) => {
  if (!draftText) {
    const error = new Error("Draft text is required");
    error.statusCode = 400;
    throw error;
  }

  const complaint = await getComplaintForAccess(complaintId);
  assertOfficerCanWork(user, complaint);

  return prisma.resolutionDraft.create({
    data: {
      complaintId: complaint.id,
      officerId: user.id,
      draftText: draftText.trim(),
      generatedByAi: false,
    },
  });
};

const listResolutionDrafts = async (user, complaintId) => {
  const complaint = await getComplaintForAccess(complaintId);
  assertOfficerCanWork(user, complaint);

  return prisma.resolutionDraft.findMany({
    where: { complaintId: complaint.id },
    orderBy: { createdAt: "desc" },
  });
};

const getDraftForWork = async (user, draftId) => {
  const draft = await prisma.resolutionDraft.findUnique({
    where: { id: parseOptionalId(draftId, "draftId") },
    include: { complaint: true },
  });

  if (!draft) {
    const error = new Error("Resolution draft not found");
    error.statusCode = 404;
    throw error;
  }

  assertOfficerCanWork(user, draft.complaint);
  return draft;
};

const updateResolutionDraft = async (user, draftId, { editedText, draftText }) => {
  const draft = await getDraftForWork(user, draftId);

  return prisma.resolutionDraft.update({
    where: { id: draft.id },
    data: {
      editedText: editedText || undefined,
      draftText: draftText || undefined,
    },
  });
};

const approveResolutionDraft = async (user, draftId) => {
  const draft = await getDraftForWork(user, draftId);

  return prisma.resolutionDraft.update({
    where: { id: draft.id },
    data: { status: "APPROVED" },
  });
};

const sendResolutionDraft = async (user, draftId) => {
  const draft = await getDraftForWork(user, draftId);
  const message = draft.editedText || draft.draftText;

  const response = await prisma.response.create({
    data: {
      complaintId: draft.complaintId,
      officerId: user.id,
      message,
      isAiGenerated: draft.generatedByAi,
      isFinalResponse: true,
      sentAt: new Date(),
    },
  });

  await prisma.resolutionDraft.update({
    where: { id: draft.id },
    data: { status: "SENT" },
  });

  return response;
};

module.exports = {
  createComplaint,
  listComplaints,
  getComplaint,
  updateComplaint,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  getComplaintHistory,
  createInternalNote,
  listInternalNotes,
  createResponse,
  listResponses,
  createResolutionDraft,
  listResolutionDrafts,
  updateResolutionDraft,
  approveResolutionDraft,
  sendResolutionDraft,
};
