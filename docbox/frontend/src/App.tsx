import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { ActivateAccountPage } from "./pages/auth/ActivateAccountPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LabelsBrowsePage } from "./pages/shared/LabelsBrowsePage";
import { LabelCategoriesPage } from "./pages/shared/LabelCategoriesPage";
import { CategoryDocumentsPage } from "./pages/shared/CategoryDocumentsPage";
import { QualityDocumentsPage } from "./pages/shared/QualityDocumentsPage";
import { QualityDocumentApprovalPage } from "./pages/shared/QualityDocumentApprovalPage";
import { QualityDocumentPendingApprovalsPage } from "./pages/shared/QualityDocumentPendingApprovalsPage";
import { UsersListPage } from "./pages/admin/UsersListPage";
import { ActivityLogPage } from "./pages/admin/ActivityLogPage";
import { DocumentsPage } from "./pages/admin/DocumentsPage";
import { SettingsPage } from "./pages/admin/SettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ativar-conta" element={<ActivateAccountPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/nao-autorizado" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/produtos/piso-laminado" replace />} />
          <Route path="/labels" element={<Navigate to="/produtos/piso-laminado" replace />} />
          <Route path="/produtos/:type" element={<LabelsBrowsePage />} />
          <Route path="/labels/:labelId" element={<LabelCategoriesPage />} />
          <Route
            path="/labels/:labelId/categories/:categoryId"
            element={<CategoryDocumentsPage />}
          />
          <Route path="/qualidade/aprovacoes/:documentId" element={<QualityDocumentApprovalPage />} />
          <Route path="/qualidade/:type" element={<QualityDocumentsPage />} />

          <Route element={<RoleRoute allow={["ADMIN", "APPROVER"]} />}>
            <Route path="/qualidade/aprovacoes" element={<QualityDocumentPendingApprovalsPage />} />
          </Route>

          <Route element={<RoleRoute allow={["ADMIN"]} />}>
            <Route path="/admin/usuarios" element={<UsersListPage />} />
            <Route path="/admin/documentos" element={<DocumentsPage />} />
            <Route path="/admin/atividades" element={<ActivityLogPage />} />
            <Route path="/admin/configuracoes" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
