import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { FaEye, FaEyeSlash, FaShieldAlt, FaGraduationCap, FaUserShield, FaCrown } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("user"); // "user" or "superadmin"
  const [activeRole, setActiveRole] = useState("student"); // "student" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Email and Password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/login`, null, {
        params: { email, password }
      });

      if (response.data.status === true) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email || email);
        localStorage.setItem("name", response.data.name || email.split("@")[0]);
        localStorage.setItem("department", response.data.department || "");
        localStorage.setItem("year", response.data.year || "");
        localStorage.setItem("college", response.data.college || "");
        localStorage.removeItem("activeChatId");

        if (response.data.role === "superadmin") {
          navigate("/super-admin");
        } else {
          navigate("/chat");
        }
      } else {
        setError(response.data.message || "Invalid Email or Password");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Login failed. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Super Admin Username and Password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/login`, null, {
        params: { email, password }
      });

      if (response.data.status === true && response.data.role === "superadmin") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "superadmin");
        localStorage.setItem("email", "superadmin2024@gmail.com");
        localStorage.setItem("name", "Super Admin");
        localStorage.setItem("department", "ALL");
        localStorage.setItem("year", "ALL");
        localStorage.setItem("college", "ALL");
        localStorage.removeItem("activeChatId");

        navigate("/super-admin");
      } else {
        setError("Invalid Super Admin credentials. Username: SuperAdmin & Password: 12345");
      }
    } catch (err) {
      console.error("SUPER ADMIN LOGIN ERROR:", err);
      setError("Super Admin Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate(`/signup?role=${activeRole}`);
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#090d16",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "440px",
          padding: "36px",
          borderRadius: "24px",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.08)",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {/* LOGO & BRANDING */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 12px auto",
              padding: "10px",
              background: "rgba(56, 189, 248, 0.1)",
              borderRadius: "16px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src="/havox-icon.png"
              alt="HavoxAI"
              style={{ width: "42px", height: "42px", objectFit: "contain" }}
            />
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "white", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
            HavoxAI
          </h1>

          {mode === "superadmin" ? (
            <>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#a855f7", marginTop: "2px" }}>
                Platform Admin
              </div>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                Secure access for platform administrators
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" }}>
                Learn · Access · Grow
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                Your AI-powered learning platform
              </p>
            </>
          )}
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid #ef4444",
              color: "#fca5a5",
              padding: "10px 14px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "13px",
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}

        {mode === "user" ? (
          <>
            {/* ROLE SELECTION CARD */}
            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "12px",
                marginBottom: "20px"
              }}
            >
              {/* TOP ROW: STUDENT & ADMIN TABS */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() => setActiveRole("student")}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: activeRole === "student" ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                    background: activeRole === "student" ? "rgba(56, 189, 248, 0.15)" : "rgba(15, 23, 42, 0.6)",
                    color: activeRole === "student" ? "#38bdf8" : "#94a3b8",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <FaGraduationCap fontSize="15px" /> Student
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRole("admin")}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: activeRole === "admin" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.06)",
                    background: activeRole === "admin" ? "rgba(245, 158, 11, 0.15)" : "rgba(15, 23, 42, 0.6)",
                    color: activeRole === "admin" ? "#f59e0b" : "#94a3b8",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <FaUserShield fontSize="15px" /> Admin
                </button>
              </div>

              {/* BOTTOM ROW: SUPER ADMIN PLATFORM OWNER ACCESS BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setMode("superadmin");
                  setEmail("");
                  setPassword("");
                  setError("");
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  background: "linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)",
                  color: "#c084fc",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 0 15px rgba(168, 85, 247, 0.15)",
                  transition: "all 0.2s ease"
                }}
              >
                <FaCrown style={{ color: "#fbbf24" }} /> Super Admin
                <span style={{ fontSize: "11px", fontWeight: "400", opacity: 0.8 }}>(Platform Owner Access)</span>
              </button>
            </div>

            {/* INPUT FIELDS */}
            <div style={{ marginBottom: "14px" }}>
              <input
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(30, 41, 59, 0.8)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ position: "relative", width: "100%", marginBottom: "14px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 16px",
                  background: "rgba(30, 41, 59, 0.8)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontSize: "14px"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3af",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", fontSize: "13px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3af", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#38bdf8" }}
                />
                Remember Me
              </label>
              <span
                onClick={() => navigate("/forgot-password")}
                style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
              >
                Forgot Password?
              </span>
            </div>

            {/* CONTINUE / LOGIN BUTTON */}
            <button
              onClick={handleUserLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "30px",
                border: "none",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
                marginBottom: "16px"
              }}
            >
              {loading ? "Signing In..." : "Continue"}
            </button>

            {/* NEW USER CREATE ACCOUNT */}
            <div style={{ textAlign: "center", fontSize: "14px", color: "#94a3af" }}>
              <span onClick={handleCreateAccount} style={{ cursor: "pointer" }}>
                New User? <span style={{ color: "#38bdf8", textDecoration: "underline", fontWeight: "600" }}>Create Account ({activeRole.toUpperCase()})</span>
              </span>
            </div>
          </>
        ) : (
          /* SUPER ADMIN LOGIN CARD */
          <>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#94a3af", display: "block", marginBottom: "4px" }}>
                Super Admin Username / Email
              </label>
              <input
                type="text"
                placeholder="SuperAdmin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(30, 41, 59, 0.8)",
                  color: "white",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ position: "relative", width: "100%", marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 16px",
                  background: "rgba(30, 41, 59, 0.8)",
                  color: "white",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontSize: "14px"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "34px",
                  background: "transparent",
                  border: "none",
                  color: "#94a3af",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", fontSize: "13px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3af", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#c084fc" }}
                />
                Remember Me
              </label>
              <span
                onClick={() => navigate("/forgot-password")}
                style={{ color: "#c084fc", cursor: "pointer", textDecoration: "underline" }}
              >
                Forgot Password?
              </span>
            </div>

            <button
              onClick={handleSuperAdminLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "30px",
                border: "none",
                background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
                marginBottom: "20px"
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* BACK TO USER LOGIN */}
            <div style={{ textAlign: "center", fontSize: "14px" }}>
              <span
                onClick={() => {
                  setMode("user");
                  setEmail("");
                  setPassword("");
                  setError("");
                }}
                style={{ color: "#94a3af", cursor: "pointer", textDecoration: "underline" }}
              >
                ← Back to User Login
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
