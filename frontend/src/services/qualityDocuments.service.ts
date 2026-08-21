import { api } from "./api";
import type { DocumentApprovalHistoryEvent, QualityDocument, QualityDocumentType, Role } from "../types";

export type ApproverUser = { id: string; badgeNumber: string; role: Role };

export type ListQualityDocumentsParams = {
  type: QualityDocumentType;
  active?: boolean;
};

export async function list(params: ListQualityDocumentsParams) {
  const { data } = await api.get<{ documents: QualityDocument[] }>("/quality-documents", {
    params,
  });
  return data.documents;
}

export async function listApprovers() {
  const { data } = await api.get<{ approvers: ApproverUser[] }>("/quality-documents/approvers");
  return data.approvers;
}

export async function listPendingForApprover() {
  const { data } = await api.get<{ documents: QualityDocument[] }>(
    "/quality-documents/pending-approvals"
  );
  return data.documents;
}

export async function getById(id: string) {
  const { data } = await api.get<{ document: QualityDocument }>(`/quality-documents/${id}`);
  return data.document;
}

export async function getHistory(id: string) {
  const { data } = await api.get<{ events: DocumentApprovalHistoryEvent[] }>(
    `/quality-documents/${id}/history`
  );
  return data.events;
}

export async function upload(input: {
  type: QualityDocumentType;
  title: string;
  approverId: string;
  requesterNote?: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  formData.append("approverId", input.approverId);
  if (input.requesterNote) formData.append("requesterNote", input.requesterNote);
  formData.append("file", input.file);

  const { data } = await api.post<{ document: QualityDocument }>("/quality-documents", formData);
  return data.document;
}

export async function resubmit(
  id: string,
  input: { approverId: string; requesterNote?: string; file?: File }
) {
  const formData = new FormData();
  formData.append("approverId", input.approverId);
  if (input.requesterNote) formData.append("requesterNote", input.requesterNote);
  if (input.file) formData.append("file", input.file);

  const { data } = await api.post<{ document: QualityDocument }>(
    `/quality-documents/${id}/resubmit`,
    formData
  );
  return data.document;
}

export async function decide(
  id: string,
  input: { decision: "APROVAR" | "REPROVAR"; approverNote?: string }
) {
  const { data } = await api.post<{ document: QualityDocument }>(
    `/quality-documents/${id}/decision`,
    input
  );
  return data.document;
}

export async function toggleActive(id: string, active: boolean) {
  const { data } = await api.patch<{ document: QualityDocument }>(
    `/quality-documents/${id}/active`,
    { active }
  );
  return data.document;
}

export async function remove(id: string) {
  await api.delete(`/quality-documents/${id}`);
}

export function downloadUrl(id: string) {
  return `${api.defaults.baseURL}/quality-documents/${id}/download`;
}

export function viewUrl(id: string) {
  return `${api.defaults.baseURL}/quality-documents/${id}/download?inline=true`;
}
