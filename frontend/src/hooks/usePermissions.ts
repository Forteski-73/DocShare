import { useAuth } from "./useAuth";

// Admin, Editor e Aprovador podem gerenciar categorias e documentos em qualquer produto
// (Aprovador tem todas as permissoes de Editor, mais a capacidade de aprovar/reprovar).
export function useCanManageContent() {
  const { user } = useAuth();
  return user?.role === "ADMIN" || user?.role === "EDITOR" || user?.role === "APPROVER";
}

export function useIsApprover() {
  const { user } = useAuth();
  return user?.role === "ADMIN" || user?.role === "APPROVER";
}
