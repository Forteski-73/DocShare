import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as usersController from "./users.controller";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from "./users.schemas";

export const usersRoutes = Router();

usersRoutes.use(authMiddleware, requireRole("ADMIN"));

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Lista usuarios (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 } }
 *       - { name: pageSize, in: query, schema: { type: integer, default: 20 } }
 *       - { name: role, in: query, schema: { type: string, enum: [ADMIN, EDITOR, READER, APPROVER] } }
 *       - { name: status, in: query, schema: { type: string, enum: [PENDING, ACTIVE, INACTIVE] } }
 *     responses:
 *       200: { description: Lista de usuarios }
 *   post:
 *     tags: [Users]
 *     summary: Cria um usuario e envia convite por e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [badgeNumber, email, role]
 *             properties:
 *               badgeNumber: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [EDITOR, READER, APPROVER] }
 *     responses:
 *       201: { description: Usuario criado }
 */
usersRoutes.get("/", validate(listUsersQuerySchema, "query"), usersController.list);
usersRoutes.post("/", validate(createUserSchema), usersController.create);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Detalhe de um usuario
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Usuario }
 *       404: { description: Nao encontrado }
 *   patch:
 *     tags: [Users]
 *     summary: Atualiza campos de um usuario
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               badgeNumber: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [ADMIN, EDITOR, READER, APPROVER] }
 *               status: { type: string, enum: [PENDING, ACTIVE, INACTIVE] }
 *     responses:
 *       200: { description: Usuario atualizado }
 *   delete:
 *     tags: [Users]
 *     summary: Desativa um usuario
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Usuario desativado }
 */
usersRoutes.get("/:id", validate(userIdParamSchema, "params"), usersController.getById);

/**
 * @openapi
 * /users/{id}/avatar:
 *   get:
 *     tags: [Users]
 *     summary: Avatar de um usuario
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Imagem do avatar }
 *       404: { description: Sem avatar }
 */
usersRoutes.get(
  "/:id/avatar",
  validate(userIdParamSchema, "params"),
  usersController.getAvatar
);
usersRoutes.patch(
  "/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  usersController.update
);
usersRoutes.delete("/:id", validate(userIdParamSchema, "params"), usersController.deactivate);

/**
 * @openapi
 * /users/{id}/resend-invite:
 *   post:
 *     tags: [Users]
 *     summary: Reenvia o e-mail de convite/ativacao
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Convite reenviado }
 */
usersRoutes.post(
  "/:id/resend-invite",
  validate(userIdParamSchema, "params"),
  usersController.resendInvite
);
