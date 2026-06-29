import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAdminAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const redirectTo = location.state?.from?.pathname ?? "/admin";

  function updateField(event) {
    const { name, value } = event.target;
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await login(credentials);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
      setStatus("error");
    }
  }

  return (
    <main className="page-shell page-main">
      <section className="login-page">
        <div className="section-heading stack">
          <div>
            <p className="section-tag">Mi Cuenta</p>
            <h2>Acceso privado al panel administrativo.</h2>
          </div>
          <p>Ingresa con el usuario y contraseña configurados en las variables del backend.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={credentials.username}
              onChange={updateField}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={updateField}
              required
            />
          </div>

          <button className="primary-button form-button" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Ingresando..." : "Ingresar"}
          </button>

          {error ? <p className="admin-message error">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
