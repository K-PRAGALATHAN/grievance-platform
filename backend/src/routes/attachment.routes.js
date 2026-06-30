const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");
const attachmentController = require("../controllers/attachment.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();
const uploadDir = path.resolve(__dirname, "../../uploads/complaints");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.use(authenticate);

router.post("/complaints/:id/attachments", upload.single("file"), attachmentController.uploadAttachment);
router.get("/complaints/:id/attachments", attachmentController.listComplaintAttachments);
router.get("/attachments/:id", attachmentController.getAttachment);
router.delete("/attachments/:id", attachmentController.deleteAttachment);

module.exports = router;
