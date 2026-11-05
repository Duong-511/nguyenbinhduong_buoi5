import { useState } from "react";

const EXISTING_EMAILS = ["test@example.com", "admin@example.com"];

async function registerApi(hoTen, email) {
  const res = await fetch("http://localhost:8000/api/dang-ky", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ho_ten: hoTen.trim(), email: email.trim() }),
  });
  if (res.status === 201) return { ok: true };
  if (res.status === 409) throw new Error("EMAIL_EXISTS");
  throw new Error("OTHER_ERROR");
}

const styles = `
  .rf-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #f4f5f7;
    color: #1a1d23;
    box-sizing: border-box;
  }
  .rf-wrap *, .rf-wrap *::before, .rf-wrap *::after { box-sizing: border-box; }

  .rf-card {
    width: 100%;
    max-width: 400px;
    background: #fff;
    border: 1px solid #e3e5e9;
    border-radius: 12px;
    padding: 28px 24px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  }
  .rf-title { margin: 0 0 4px; font-size: 22px; font-weight: 600; }
  .rf-subtitle { margin: 0 0 24px; font-size: 14px; color: #5b616e; }

  .rf-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .rf-label { font-size: 14px; font-weight: 500; }
  .rf-input {
    height: 42px;
    padding: 0 12px;
    font: inherit;
    font-size: 15px;
    color: inherit;
    background: #fff;
    border: 1px solid #cfd3da;
    border-radius: 8px;
    transition: border-color .15s, box-shadow .15s;
  }
  .rf-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .18);
  }
  .rf-input:disabled { background: #f4f5f7; color: #8a909c; }
  .rf-input[aria-invalid="true"] { border-color: #dc2626; }

  .rf-button {
    width: 100%;
    height: 44px;
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font: inherit;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: #2563eb;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background .15s;
  }
  .rf-button:hover:not(:disabled) { background: #1d4ed8; }
  .rf-button:focus-visible { outline: 3px solid rgba(37, 99, 235, .35); outline-offset: 2px; }
  .rf-button:disabled { background: #93a9d8; cursor: not-allowed; }

  .rf-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, .45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rf-spin .7s linear infinite;
  }
  @keyframes rf-spin { to { transform: rotate(360deg); } }

  .rf-message {
    margin: 16px 0 0;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.45;
    border-radius: 8px;
    border: 1px solid;
  }
  .rf-message--success { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
  .rf-message--error { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }

  .rf-hint { margin: 20px 0 0; font-size: 12px; color: #8a909c; text-align: center; }
  .rf-hint code { background: #f4f5f7; padding: 1px 5px; border-radius: 4px; }

  @media (prefers-reduced-motion: reduce) {
    .rf-spinner { animation-duration: 2s; }
  }
`;

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const isSubmitting = status === "submitting";

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setStatus("submitting");
    try {
      await registerApi(name, email);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function resetStatusOnEdit(setter) {
    return (event) => {
      setter(event.target.value);
      if (status === "success" || status === "error") setStatus("idle");
    };
  }

  return (
    <div className="rf-wrap">
      <style>{styles}</style>

      <main className="rf-card">
        <h1 className="rf-title">Tạo tài khoản</h1>
        <p className="rf-subtitle">Điền thông tin bên dưới để đăng ký.</p>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <div className="rf-field">
            <label className="rf-label" htmlFor="rf-name">Họ tên</label>
            <input
              id="rf-name"
              className="rf-input"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              required
              value={name}
              onChange={resetStatusOnEdit(setName)}
              disabled={isSubmitting}
            />
          </div>

          <div className="rf-field">
            <label className="rf-label" htmlFor="rf-email">Email</label>
            <input
              id="rf-email"
              className="rf-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ban@example.com"
              required
              value={email}
              onChange={resetStatusOnEdit(setEmail)}
              disabled={isSubmitting}
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? "rf-status" : undefined}
            />
          </div>

          <button className="rf-button" type="submit" disabled={isSubmitting}>
            {isSubmitting && <span className="rf-spinner" aria-hidden="true" />}
            {isSubmitting ? "Đang gửi..." : "Đăng ký"}
          </button>
        </form>

        <div id="rf-status" aria-live="polite">
          {status === "success" && (
            <p className="rf-message rf-message--success" role="status">
              Đăng ký thành công! Chào mừng {name.trim()}, vui lòng kiểm tra email để xác nhận.
            </p>
          )}
          {status === "error" && (
            <p className="rf-message rf-message--error" role="alert">
              Email này đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.
            </p>
          )}
        </div>

        <p className="rf-hint">
          Demo: nhập <code>test@example.com</code> để xem trạng thái lỗi.
        </p>
      </main>
    </div>
  );
}