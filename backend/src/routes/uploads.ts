/**
 * File upload routes.
 *
 * Handles file uploads (images, PDFs, etc.), serving uploaded files,
 * and deleting them.
 *
 * Routes:
 *   POST   /api/uploads — upload a file (auth required, multer-validated)
 *   GET    /api/uploads/:filename — serve an uploaded file (public)
 *   DELETE /api/uploads/:filename — delete an uploaded file (auth required)
 *
 * Upload details:
 *   - Uses multer for multipart/form-data handling
 *   - Allowed MIME types: jpeg, png, webp, gif, svg, pdf
 *   - Max file size: 10MB (configurable via MAX_FILE_SIZE env var)
 *   - Files are stored with a UUID-based filename to prevent collisions
 *   - Files are saved to the ./uploads directory
 *
 * Security:
 *   - Path traversal is prevented by resolving and validating file paths
 *   - Only authenticated users can upload or delete files
 *   - Multer fileFilter rejects disallowed MIME types
 *   - Multer limits rejects files exceeding the size limit
 *
 * Exports:
 *   - router (default): the Express Router with upload routes
 */

import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import multer from "multer";

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

// Max upload size in bytes (default: 10MB, configurable via env)
const MAX_UPLOAD_BYTES = Number(process.env["MAX_FILE_SIZE"]) || 10 * 1024 * 1024;

// Allowed MIME types for upload
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

// Multer storage: UUID-based filename with original extension
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

// Multer file filter: reject disallowed MIME types
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

// Multer instance with storage, limits, and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
  },
});

/**
 * Resolve a filename inside UPLOAD_DIR, preventing path traversal.
 *
 * Returns null if the resolved path escapes the upload directory.
 * Note: `startsWith(UPLOAD_DIR)` alone would accept a sibling such as
 * `/app/uploads-evil`, so we also check for the path separator.
 *
 * @param filename - the requested filename
 * @returns the resolved path, or null if it escapes UPLOAD_DIR
 */
function resolveUploadPath(filename: string): string | null {
  const resolved = path.resolve(UPLOAD_DIR, filename);
  if (resolved !== UPLOAD_DIR && !resolved.startsWith(UPLOAD_DIR + path.sep)) {
    return null;
  }
  return resolved;
}

/** Ensure the upload directory exists, creating it if necessary. */
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * POST /api/uploads — upload a file (multipart/form-data).
 *
 * Expects a single file in the `file` field.
 * Multer validates MIME type (fileFilter) and size (limits.fileSize).
 * The file is saved to the uploads directory with a UUID-based filename
 * to prevent collisions and path traversal.
 */
// POST /api/uploads - upload a file
router.post("/", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    await ensureUploadDir();

    upload.single("file")(req, res, (err) => {
      if (err) {
        const message =
          err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
            ? `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit`
            : err.message || "Upload failed";

        const statusCode =
          err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

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
        mimetype: req.file.mimetype,
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

/**
 * GET /api/uploads/:filename — serve an uploaded file.
 *
 * Publicly accessible. The filename is validated to prevent path traversal.
 * Returns 403 if the path escapes the upload directory, 404 if not found.
 */
// GET /api/uploads/:filename - serve uploaded file
router.get("/:filename", async (req: Request, res: Response) => {
  try {
    const { filename } = req.params as Record<string, string>;
    const filePath = resolveUploadPath(filename);

    if (!filePath) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const data = await fs.readFile(filePath);
    res.send(data);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

/**
 * DELETE /api/uploads/:filename — delete an uploaded file.
 *
 * Requires authentication. The filename is validated to prevent path traversal.
 * Returns 403 if the path escapes the upload directory, 404 if not found.
 */
// DELETE /api/uploads/:filename - delete uploaded file
router.delete(
  "/:filename",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params as Record<string, string>;
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
  },
);

export default router;
