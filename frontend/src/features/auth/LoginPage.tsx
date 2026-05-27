import { LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import type { CurrentUser } from "../../api/contracts";

interface LoginPageProps {
  onLogin: (user: CurrentUser) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { apiClient } = useFrontendServices();
  const navigate = useNavigate();
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);
    try {
      const user = await apiClient.login({
        loginId: String(form.get("loginId") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      onLogin(user);
      navigate("/products");
    } catch (nextError) {
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-layout">
      <section className="login-panel">
        <div className="brand-block brand-block--large">
          <span className="brand-mark">S</span>
          <div>
            <strong>SANIL QA</strong>
            <small>Photo inspection workflow</small>
          </div>
        </div>
        <form onSubmit={submit} className="login-form">
          <label>
            로그인 ID
            <input name="loginId" defaultValue="qa.admin" autoComplete="username" />
          </label>
          <label>
            비밀번호
            <input name="password" type="password" defaultValue="mock-password" autoComplete="current-password" />
          </label>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            <LogIn size={18} />
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>
        </form>
        {error ? <ErrorState error={error} /> : null}
      </section>
    </main>
  );
}
