import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { labelsRoutes } from "../modules/labels/labels.routes";
import { categoriesRoutes } from "../modules/categories/categories.routes";
import { documentsRoutes } from "../modules/documents/documents.routes";
import { qualityDocumentsRoutes } from "../modules/quality-documents/quality-documents.routes";
import { activityLogsRoutes } from "../modules/activity-logs/activity-logs.routes";
import { settingsRoutes } from "../modules/settings/settings.routes";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/users", usersRoutes);
apiRoutes.use("/labels", labelsRoutes);
apiRoutes.use("/categories", categoriesRoutes);
apiRoutes.use("/documents", documentsRoutes);
apiRoutes.use("/quality-documents", qualityDocumentsRoutes);
apiRoutes.use("/activity-logs", activityLogsRoutes);
apiRoutes.use("/settings", settingsRoutes);
