import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function AdminUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user-profile/${id}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("USER PROFILE ERROR =", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Available";
    return new Date(dateStr.replace(" ", "T")).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getRoleColor = (role) => {
    if (!role) return "#22c55e";
    const r = role.toLowerCase();
    if (r === "admin") return "#ef4444";
    if (r === "staff") return "#f59e0b";
    return "#22c55e";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user || !user.status) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <p>User not found.</p>
        <button
          onClick={() => navigate("/users")}
          style={{
            marginTop: "20px",
            padding: "10px 24px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "650px",
          background: "#1e293b",
          borderRadius: "20px",
          padding: "40px",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/users")}
          style={{
            background: "transparent",
            border: "1px solid #334155",
            color: "#94a3b8",
            padding: "8px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Back to Users
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "70px" }}>👤</div>
          <h1 style={{ color: "#3b82f6", margin: "10px 0 4px" }}>
            {user.name}
          </h1>
          <span
            style={{
              background: getRoleColor(user.role),
              padding: "4px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            {user.role}
          </span>
        </div>

        {/* Info Cards */}
        {[
          { label: "ID", value: `#${user.id}` },
          { label: "Name", value: user.name },
          { label: "Email", value: user.email },
          { label: "Role", value: user.role },
          user.college && { label: "🏫 College", value: user.college },
          user.department && { label: "📚 Department", value: user.department },
          user.year && { label: "🎓 Year", value: user.year },
          { label: "Joined Date", value: formatDate(user.created_at) },
          { label: "Last Login", value: formatDate(user.last_login) },
        ]
          .filter(Boolean)
          .map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "#0f172a",
                padding: "16px 20px",
                borderRadius: "12px",
                marginBottom: "12px",
                display: "flex",
                gap: "10px",
              }}
            >
              <b style={{ color: "#94a3b8", minWidth: "120px" }}>
                {item.label}:
              </b>
              <span>{item.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
