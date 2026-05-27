import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageShell } from "../shared/components/PageShell";
import { ErrorState } from "../shared/components/ErrorState";
import { LoginPage } from "../features/auth/LoginPage";
import { ProductsPage } from "../features/products/ProductsPage";
import { AdminReferenceManagementPage } from "../features/admin/AdminReferenceManagementPage";
import { ReferenceListPage } from "../features/references/ReferenceListPage";
import { CapturePage } from "../features/inspection/CapturePage";
import { ProcessingPage } from "../features/inspection/ProcessingPage";
import { ResultPage } from "../features/inspection/ResultPage";
import { HistoryPage } from "../features/inspection/HistoryPage";
import { useFrontendServices } from "./serviceContext";
import { toApiError } from "../api/errors";
import type { CurrentUser } from "../api/contracts";

const ADMIN_REQUIRED_ERROR = {
  kind: "permission" as const,
  message: "관리자 권한이 필요합니다.",
};

export function App() {
  const { apiClient } = useFrontendServices();
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);
  const [bootstrapError, setBootstrapError] = useState<unknown>(null);

  useEffect(() => {
    let ignore = false;

    apiClient
      .getCurrentUser()
      .then((currentUser) => {
        if (!ignore) {
          setBootstrapError(null);
          setUser(currentUser);
        }
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        const apiError = toApiError(error);
        if (apiError.kind === "auth") {
          setUser(null);
          return;
        }

        setBootstrapError(apiError);
      });

    return () => {
      ignore = true;
    };
  }, [apiClient]);

  if (bootstrapError) {
    return <ErrorState error={bootstrapError} />;
  }

  if (user === undefined) {
    return <div className="state-panel">앱을 준비하는 중</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route element={<PageShell user={user} />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route
          path="/admin/references"
          element={user.authority === "ADMIN" ? <AdminReferenceManagementPage /> : <ErrorState error={ADMIN_REQUIRED_ERROR} />}
        />
        <Route path="/products/:productUuid/references" element={<ReferenceListPage />} />
        <Route path="/inspections/:inspectionSessionUuid/capture/:stepOrder" element={<CapturePage />} />
        <Route path="/inspections/:inspectionSessionUuid/processing" element={<ProcessingPage />} />
        <Route path="/inspections/:inspectionSessionUuid/result" element={<ResultPage />} />
        <Route path="/inspections/history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
