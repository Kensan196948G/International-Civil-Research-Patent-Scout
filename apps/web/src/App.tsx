import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from "react-router";
import { AuthProvider } from "./auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StandaloneView } from "./components/StandaloneView";
import { useStandaloneData, type Page } from "./lib/standalone-data";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

function StandalonePage({ page }: { page: Page }) {
  const { documentId, reportId } = useParams<{ documentId?: string; reportId?: string }>();
  const v = useStandaloneData({ page, documentId, reportId });
  return <StandaloneView v={v} />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StandalonePage page="dashboard" />} />
            <Route path="/feed" element={<StandalonePage page="feed" />} />
            <Route path="/search" element={<StandalonePage page="search" />} />
            <Route path="/documents" element={<StandalonePage page="document" />} />
            <Route path="/documents/:documentId" element={<StandalonePage page="document" />} />
            <Route path="/compare" element={<StandalonePage page="compare" />} />
            <Route path="/fit" element={<StandalonePage page="fit" />} />
            <Route path="/report" element={<StandalonePage page="report" />} />
            <Route path="/reports" element={<StandalonePage page="report" />} />
            <Route path="/reports/:reportId" element={<StandalonePage page="report" />} />
            <Route path="/chat" element={<StandalonePage page="chat" />} />
            <Route path="/watch" element={<StandalonePage page="watch" />} />
            <Route path="/projects" element={<StandalonePage page="projects" />} />
            <Route path="/admin" element={<StandalonePage page="admin" />} />
            <Route path="/settings" element={<StandalonePage page="settings" />} />
            <Route path="/projects/:projectId" element={<StandalonePage page="projects" />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
