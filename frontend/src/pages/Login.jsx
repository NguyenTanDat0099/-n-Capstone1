import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // --- NEW: auto-apply saved token and skip login if token exists ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("[login] tìm thấy token, chuyển đến /dashboard");
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // If both fields empty, bypass login and go straight to dashboard
    if ((email || "").trim() === "" && (password || "").trim() === "") {
      localStorage.setItem("guest", "true");
      console.log("[login] tiếp tục với tư cách khách");
      navigate("/dashboard");
      return;
    }

    try {
      const payload = { email: email.trim(), password };
      console.log("[login] Gửi payload:", payload);
      const res = await axios.post("http://localhost:5000/api/auth/login", payload);
      console.log("[login] Response:", res.status, res.data);

      if (res.data.success) {
        // save token if present
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        }
        // save user_id for Settings page
        if (res.data.user && res.data.user.id) {
          localStorage.setItem("user_id", res.data.user.id);
          localStorage.setItem("user_fullname", res.data.user.fullname);
          localStorage.setItem("user_email", res.data.user.email);
        }
        localStorage.removeItem("guest");
        navigate("/dashboard");
      } else {
        alert(res.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("[login] Lỗi response:", err.response || err);
      const msg = err.response?.data?.message || err.message || "Lỗi kết nối tới máy chủ";
      alert(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={{ textAlign: "center" }}>Đăng nhập Kỹ thuật viên</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} type="submit">Đăng nhập</button>

          {/* NEW: explicit button to continue as guest */}
          <button
            type="button"
            style={{ ...styles.button, background: "#6c757d", marginTop: 8 }}
            onClick={() => {
              localStorage.setItem("guest", "true");
              console.log("[login] Tiếp tục với tư cách khách được nhấn");
              navigate("/dashboard");
            }}
          >
            Tiếp tục với tư cách khách
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#f4f6f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "350px",
    padding: "30px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    background: "#2c7be5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
