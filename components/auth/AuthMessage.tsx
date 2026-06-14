'use client';

// ── Shared message component ──────────────────────────────────
interface AuthMessageProps {
  error?: string;
  message?: string;
}

export default function AuthMessage({ error, message }: AuthMessageProps) {
  if (!error && !message) return null;
  return (
    <>
      {error   && <div className="auth-alert error">⚠️ {error}</div>}
      {message && <div className="auth-alert success">✅ {message}</div>}
    </>
  );
}
