const express = require("express");
const cors = require("cors");
const path = require("node:path");
const authRoutes = require("./routes/auth.routes");
const departmentRoutes = require("./routes/department.routes");
const complaintRoutes = require("./routes/complaint.routes");
const officerRoutes = require("./routes/officer.routes");
const attachmentRoutes = require("./routes/attachment.routes");
const aiRoutes = require("./routes/ai.routes");
const alertRoutes = require("./routes/alert.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const adminRoutes = require("./routes/admin.routes");
const jurisdictionRoutes = require("./routes/jurisdiction.routes");
const slaRoutes = require("./routes/sla.routes");
const escalationRoutes = require("./routes/escalation.routes");
const { sendError } = require("./utils/responseHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api", departmentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api", attachmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", adminRoutes);
app.use("/api/jurisdictions", jurisdictionRoutes);
app.use("/api/sla-policies", slaRoutes);
app.use("/api", escalationRoutes);

app.use((req, res) => {
  return sendError(res, "Route not found", 404);
});

module.exports = app;
