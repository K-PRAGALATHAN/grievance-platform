const prisma = require("../config/prisma");
const { parseId } = require("./common.service");

const getOwnedAlert = async (user, alertId) => {
  const alert = await prisma.alert.findUnique({ where: { id: parseId(alertId, "alertId") } });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  if (alert.userId !== user.id && user.role !== "ADMIN") {
    const error = new Error("You do not have access to this alert");
    error.statusCode = 403;
    throw error;
  }

  return alert;
};

const listAlerts = (user) => {
  return prisma.alert.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { complaint: true },
  });
};

const markAlertRead = async (user, alertId) => {
  const alert = await getOwnedAlert(user, alertId);
  return prisma.alert.update({ where: { id: alert.id }, data: { isRead: true } });
};

const markAllAlertsRead = (user) => {
  return prisma.alert.updateMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    data: { isRead: true },
  });
};

const deleteAlert = async (user, alertId) => {
  const alert = await getOwnedAlert(user, alertId);
  await prisma.alert.delete({ where: { id: alert.id } });
  return null;
};

module.exports = {
  listAlerts,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
};
