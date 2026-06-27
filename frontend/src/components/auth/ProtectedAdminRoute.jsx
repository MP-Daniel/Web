import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isCheckingSession } = useAdminAuth();

  if (isCheckingSession) {
    return (
      <main className="page-shell page-main">
        <div className="empty-state">
          <p className="eyebrow">Sesión</p>
          <h3>Validando acceso.</h3>
          <p>Estamos comprobando tu sesión de administrador.</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
