import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { env } from "./env";
import { ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "../utils/constants";
import { ApiError } from "../utils/apiError";

export const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);
export const LABEL_PHOTOS_ROOT = path.join(UPLOAD_ROOT, "label-photos");
export const SETTINGS_ROOT = path.join(UPLOAD_ROOT, "settings");
export const AVATARS_ROOT = path.join(UPLOAD_ROOT, "avatars");

for (const dir of [UPLOAD_ROOT, LABEL_PHOTOS_ROOT, SETTINGS_ROOT, AVATARS_ROOT]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();
  const expectedMime = ALLOWED_FILE_TYPES[ext];

  if (!expectedMime || file.mimetype !== expectedMime) {
    cb(ApiError.badRequest("Tipo de arquivo nao permitido. Envie PDF, DOC/DOCX ou XLS/XLSX."));
    return;
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

function imageFileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  const expectedMime = ALLOWED_IMAGE_TYPES[ext];

  if (!expectedMime || file.mimetype !== expectedMime) {
    cb(ApiError.badRequest("Tipo de imagem nao permitido. Envie JPG, PNG ou WEBP."));
    return;
  }

  cb(null, true);
}

function createImageUpload(destination: string) {
  const imageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  return multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    },
  });
}

export const uploadImage = createImageUpload(LABEL_PHOTOS_ROOT);
export const uploadSettingsImage = createImageUpload(SETTINGS_ROOT);
export const uploadAvatarImage = createImageUpload(AVATARS_ROOT);
