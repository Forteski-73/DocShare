import type { Role, UserStatus } from "../types";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  READER: "Leitor",
  APPROVER: "Aprovador",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: "Pendente",
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
};
