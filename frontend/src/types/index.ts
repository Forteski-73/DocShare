export type Role = "ADMIN" | "EDITOR" | "READER" | "APPROVER";
export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE";

export type User = {
  id: string;
  badgeNumber: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarPath: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CurrentUser = User;

export type LabelType = "PISO_LAMINADO" | "ACESSORIO" | "DOCUMENTO";

export type Label = {
  id: string;
  name: string;
  description: string | null;
  type: LabelType;
  photoPath: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: { categories: number };
};

export type LabelDetail = Label & {
  categories: CategoryWithCount[];
};

export type Category = {
  id: string;
  labelId: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryWithCount = Category & {
  _count: { documents: number };
};

export type CategoryDetail = Category & {
  label: { id: string; name: string; type: LabelType; photoPath: string | null };
  documents: DocumentItem[];
};

export type DocumentItem = {
  id: string;
  categoryId: string;
  originalName: string;
  storedFileName: string;
  mimeType: string;
  sizeBytes: number;
  filePath: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; badgeNumber: string; email: string };
  category?: {
    id: string;
    name: string;
    label: { id: string; name: string; photoPath: string | null };
  };
};

export type QualityDocumentType = "FORMULARIO" | "PROCEDIMENTO_INTERNO";

export type ApprovalStatus = "PENDENTE_APROVACAO" | "APROVADO" | "NAO_APROVADO";

export type ApprovalEventType = "SOLICITACAO" | "APROVACAO" | "REPROVACAO" | "REENVIO";

export type QualityDocument = {
  id: string;
  type: QualityDocumentType;
  title: string;
  originalName: string;
  storedFileName: string;
  mimeType: string;
  sizeBytes: number;
  filePath: string;
  active: boolean;
  approvalStatus: ApprovalStatus;
  currentApproverId: string | null;
  currentRequesterId: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; badgeNumber: string; email: string };
};

export type DocumentApprovalHistoryEvent = {
  id: string;
  qualityDocumentId: string;
  cycleNumber: number;
  eventType: ApprovalEventType;
  note: string | null;
  createdAt: string;
  user: { id: string; badgeNumber: string; email: string };
  approver: { id: string; badgeNumber: string; email: string };
};

export type AppSettings = {
  id: string;
  logoPath: string | null;
  logoMimeType: string | null;
  headerColor: string;
};

export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
  user: { id: string; badgeNumber: string; email: string };
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiErrorPayload = {
  message: string;
  errors?: { path: string; message: string }[];
};
