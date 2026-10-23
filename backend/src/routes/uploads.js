import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import multer from "multer";
const router = Router();
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const MAX_UPLOAD_BYTES = Number(process.env["MAX_FILE_SIZE"]) || 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf"
]);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  }
});
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_BYTES
  }
});
function resolveUploadPath(filename) {
  const resolved = path.resolve(UPLOAD_DIR, filename);
  if (resolved !== UPLOAD_DIR && !resolved.startsWith(UPLOAD_DIR + path.sep)) {
    return null;
  }
  return resolved;
}
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    await ensureUploadDir();
    upload.single("file")(req, res, (err) => {
      if (err) {
        const message = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit` : err.message || "Upload failed";
        const statusCode = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        res.status(statusCode).json({ error: message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      const url = `/uploads/${req.file.filename}`;
      res.status(201).json({
        url,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = resolveUploadPath(filename);
    if (!filePath) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf"
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.send(data);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});
router.delete(
  "/:filename",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = resolveUploadPath(filename);
      if (!filePath) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
      await fs.unlink(filePath);
      res.json({ message: "File deleted" });
    } catch {
      res.status(404).json({ error: "File not found" });
    }
  }
);
var stdin_default = router;
export {
  stdin_default as default
};
