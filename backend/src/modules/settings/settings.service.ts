import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { logActivity } from "../../services/activityLog.service";
import { SETTINGS_ROOT } from "../../config/multer";

const SETTINGS_ID = "singleton";

async function deleteLogoFile(logoPath: string | null) {
  if (!logoPath) return;
  try {
    await fs.unlink(path.join(SETTINGS_ROOT, logoPath));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }
}

const DEFAULT_HEADER_COLOR = "#005596";

export async function get() {
  const settings = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  return (
    settings ?? {
      id: SETTINGS_ID,
      logoPath: null,
      logoMimeType: null,
      headerColor: DEFAULT_HEADER_COLOR,
    }
  );
}

export async function updateHeaderColor(headerColor: string, actingUserId: string) {
  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { headerColor },
    create: { id: SETTINGS_ID, headerColor },
  });

  await logActivity({
    userId: actingUserId,
    action: "UPDATE_HEADER_COLOR",
    entityType: "AppSettings",
    entityId: SETTINGS_ID,
    metadata: { headerColor },
  });

  return settings;
}

export async function uploadLogo(file: Express.Multer.File, actingUserId: string) {
  const current = await get();
  await deleteLogoFile(current.logoPath);

  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { logoPath: file.filename, logoMimeType: file.mimetype },
    create: { id: SETTINGS_ID, logoPath: file.filename, logoMimeType: file.mimetype },
  });

  await logActivity({
    userId: actingUserId,
    action: "UPDATE_LOGO",
    entityType: "AppSettings",
    entityId: SETTINGS_ID,
  });

  return settings;
}

export async function removeLogo(actingUserId: string) {
  const current = await get();
  await deleteLogoFile(current.logoPath);

  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { logoPath: null, logoMimeType: null },
    create: { id: SETTINGS_ID, logoPath: null, logoMimeType: null },
  });

  await logActivity({
    userId: actingUserId,
    action: "REMOVE_LOGO",
    entityType: "AppSettings",
    entityId: SETTINGS_ID,
  });

  return settings;
}

export async function getLogoForDownload() {
  const settings = await get();

  if (!settings.logoPath || !settings.logoMimeType) {
    throw ApiError.notFound("Nenhum logo cadastrado");
  }

  return {
    absolutePath: path.join(SETTINGS_ROOT, settings.logoPath),
    mimeType: settings.logoMimeType,
  };
}
