import type { ApprovalEventType, ApprovalStatus } from "../types";

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDENTE_APROVACAO: "Pendente de aprovação",
  APROVADO: "Aprovado",
  NAO_APROVADO: "Não aprovado",
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  PENDENTE_APROVACAO: "yellow",
  APROVADO: "green",
  NAO_APROVADO: "red",
};

export const APPROVAL_EVENT_LABELS: Record<ApprovalEventType, string> = {
  SOLICITACAO: "Solicitação de aprovação",
  APROVACAO: "Aprovação",
  REPROVACAO: "Reprovação",
  REENVIO: "Reenvio para aprovação",
};
