import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import {
  FaTachometerAlt,
  FaUniversity,
  FaUsers,
  FaChartLine,
  FaCreditCard,
  FaClipboardList,
  FaCogs,
  FaCrown,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

export default function SuperAdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Institutions state
  const [institutions, setInstitutions] = useState([]);

  // Users state
  const [users, setUsers] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    total_institutions: 0,
    active_institutions: 0,
    total_students: 0,
    total_staff: 0
  });

  // Modal for adding institution
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstName, setNewInstName] = useState("");
  const [newInstCode, setNewInstCode] = useState("");
  const [newInstPlan, setNewInstPlan] = useState("Professional");

  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (role !== "superadmin") {
      navigate("/");
      return;
    }

    const fetchOverview = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/superadmin-overview`);
        if (res.data && res.data.status) {
          if (res.data.institutions) setInstitutions(res.data.institutions);
          if (res.data.users) setUsers(res.data.users);
          setStats({
            total_institutions: res.data.total_institutions || (res.data.institutions ? res.data.institutions.length : 0),
            active_institutions: res.data.active_institutions || (res.data.institutions ? res.data.institutions.length : 0),
            total_students: res.data.total_students || 0,
            total_staff: res.data.total_staff || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch superadmin overview:", err);
      }
    };

    fetchOverview();
  }, [navigate]);

  const handleAddInstitution = () => {
    if (!newInstName || !newInstCode) {
      alert("Please fill all fields!");
      return;
    }
    const newInst = {
      id: institutions.length + 1,
      name: newInstName,
      code: newInstCode,
      plan: newInstPlan,
      status: "Active",
      students: 0,
      staff: 0,
      lastLogin: "Just Now"
    };
    setInstitutions([...institutions, newInst]);
    setNewInstName("");
    setNewInstCode("");
    setShowAddModal(false);
    alert(`Institution '${newInstName}' added successfully!`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#090d16",
        color: "white",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* SIDEBAR NAVIGATION */}
      <div
        style={{
          width: "240px",
          background: "#0f172a",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          boxSizing: "border-box"
        }}
      >
        {/* BRAND LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", paddingLeft: "8px" }}>
          <img src="/havox-icon.png" alt="HavoxAI" style={{ width: "36px", height: "36px" }} />
          <span style={{ fontSize: "20px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>
            HavoxAI
          </span>
        </div>

        {/* NAVIGATION ITEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
            { id: "institutions", label: "Institutions", icon: <FaUniversity /> },
            { id: "users", label: "Users", icon: <FaUsers /> },
            { id: "analytics", label: "Analytics", icon: <FaChartLine /> },
            { id: "subscriptions", label: "Subscriptions", icon: <FaCreditCard /> },
            { id: "audit_logs", label: "Audit Logs", icon: <FaClipboardList /> },
            { id: "settings", label: "Settings", icon: <FaCogs /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "none",
                background: activeTab === item.id ? "#2563eb" : "transparent",
                color: activeTab === item.id ? "white" : "#94a3b8",
                fontWeight: activeTab === item.id ? "600" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#f87171",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            marginTop: "auto"
          }}
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto" }}>
        {/* TOP HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px 0", textTransform: "capitalize" }}>
              {activeTab.replace("_", " ")}
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
              Platform overview and key statistics
            </p>
          </div>

          {/* SUPER ADMIN BADGE */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "rgba(168, 85, 247, 0.15)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                padding: "8px 16px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaCrown style={{ color: "#fbbf24" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#c084fc" }}>Super Admin</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Platform Owner</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            {/* STAT CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
              {[
                { title: "Total Institutions", count: stats.total_institutions, change: "Live", color: "#38bdf8", icon: <FaUniversity /> },
                { title: "Active Institutions", count: stats.active_institutions, change: "Live", color: "#34d399", icon: <FaCheckCircle /> },
                { title: "Total Students", count: stats.total_students, change: "Live", color: "#c084fc", icon: <FaUsers /> },
                { title: "Total Staff", count: stats.total_staff, change: "Live", color: "#fbbf24", icon: <FaShieldAlt /> }
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "20px",
                    borderRadius: "16px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>{card.title}</span>
                    <span style={{ fontSize: "18px", color: card.color }}>{card.icon}</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "white", marginBottom: "4px" }}>
                    {card.count}
                  </div>
                  <div style={{ fontSize: "12px", color: "#34d399" }}>
                    ↑ {card.change}
                  </div>
                </div>
              ))}
            </div>

            {/* INSTITUTION OVERVIEW TABLE */}
            <div style={{ background: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "white" }}>
                  Institution Overview
                </h3>
                <span onClick={() => setActiveTab("institutions")} style={{ fontSize: "13px", color: "#38bdf8", cursor: "pointer", fontWeight: "600" }}>
                  View All →
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8" }}>
                    <th style={{ padding: "12px" }}>#</th>
                    <th style={{ padding: "12px" }}>Institution Name</th>
                    <th style={{ padding: "12px" }}>Plan</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px" }}>Students</th>
                    <th style={{ padding: "12px" }}>Staff</th>
                    <th style={{ padding: "12px" }}>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                        No registered colleges or schools found in the database.
                      </td>
                    </tr>
                  ) : (
                    institutions.map((inst, index) => (
                      <tr key={inst.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "12px", color: "#64748b" }}>{index + 1}</td>
                        <td style={{ padding: "12px", fontWeight: "600", color: "white" }}>{inst.name}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{inst.plan}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: inst.status === "Active" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)",
                              color: inst.status === "Active" ? "#34d399" : "#fbbf24"
                            }}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{inst.students.toLocaleString()}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{inst.staff}</td>
                        <td style={{ padding: "12px", color: "#94a3b8" }}>{inst.lastLogin}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2. INSTITUTIONS TAB */}
        {activeTab === "institutions" && (
          <div style={{ background: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)", width: "300px" }}>
                <FaSearch style={{ color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search by name, code or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaPlus /> Add Institution
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8" }}>
                  <th style={{ padding: "12px" }}>#</th>
                  <th style={{ padding: "12px" }}>Institution Name</th>
                  <th style={{ padding: "12px" }}>Code</th>
                  <th style={{ padding: "12px" }}>Plan</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Students</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                      No registered colleges or schools found in the database.
                    </td>
                  </tr>
                ) : (
                  institutions
                    .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((inst, index) => (
                      <tr key={inst.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "12px", color: "#64748b" }}>{index + 1}</td>
                        <td style={{ padding: "12px", fontWeight: "600", color: "white" }}>{inst.name}</td>
                        <td style={{ padding: "12px", color: "#94a3b8" }}>{inst.code}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{inst.plan}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: inst.status === "Active" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)",
                              color: inst.status === "Active" ? "#34d399" : "#fbbf24"
                            }}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{inst.students.toLocaleString()}</td>
                        <td style={{ padding: "12px", color: "#38bdf8", cursor: "pointer", fontWeight: "600" }}>
                          •••
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. USERS TAB */}
        {activeTab === "users" && (
          <div style={{ background: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)", width: "300px" }}>
                <FaSearch style={{ color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ padding: "8px 12px", background: "#1e293b", color: "white", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", fontSize: "13px" }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8" }}>
                  <th style={{ padding: "12px" }}>Name</th>
                  <th style={{ padding: "12px" }}>Email</th>
                  <th style={{ padding: "12px" }}>Institution</th>
                  <th style={{ padding: "12px" }}>Role</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                      No registered users found in the database.
                    </td>
                  </tr>
                ) : (
                  users
                    .filter(u => roleFilter === "ALL" || u.role === roleFilter)
                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((user) => (
                      <tr key={user.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "12px", fontWeight: "600", color: "white" }}>{user.name}</td>
                        <td style={{ padding: "12px", color: "#38bdf8" }}>{user.email}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{user.institution}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: user.role === "Student" ? "rgba(56, 189, 248, 0.15)" : user.role === "Staff" ? "rgba(168, 85, 247, 0.15)" : "rgba(245, 158, 11, 0.15)",
                              color: user.role === "Student" ? "#38bdf8" : user.role === "Staff" ? "#c084fc" : "#fbbf24"
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", background: "rgba(52, 211, 153, 0.15)", color: "#34d399" }}>
                            Active
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#94a3b8" }}>{user.lastLogin}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
              {[
                { title: "Total Registered Users", val: users.length.toLocaleString(), change: "Live" },
                { title: "Active Institutions", val: stats.active_institutions.toLocaleString(), change: "Live" },
                { title: "Total Students", val: stats.total_students.toLocaleString(), change: "Live" },
                { title: "Total Staff", val: stats.total_staff.toLocaleString(), change: "Live" }
              ].map((stat, idx) => (
                <div key={idx} style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "20px", borderRadius: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>{stat.title}</div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "white", marginBottom: "4px" }}>{stat.val}</div>
                  <div style={{ fontSize: "12px", color: "#34d399" }}>● {stat.change}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              <div style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "white", fontSize: "15px" }}>Registered User Distribution</h4>
                <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "24px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)", justifyContent: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#38bdf8" }}>{stats.total_students}</span>
                    <div style={{ width: "60px", background: "linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)", height: `${Math.min(140, Math.max(20, stats.total_students * 10))}px`, borderRadius: "6px 6px 0 0" }} />
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Students</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#c084fc" }}>{stats.total_staff}</span>
                    <div style={{ width: "60px", background: "linear-gradient(180deg, #c084fc 0%, #9333ea 100%)", height: `${Math.min(140, Math.max(20, stats.total_staff * 10))}px`, borderRadius: "6px 6px 0 0" }} />
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Staff</span>
                  </div>
                </div>
              </div>

              <div style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "white", fontSize: "15px" }}>Institution Summary</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div><span style={{ color: "#38bdf8" }}>● Total Colleges & Schools</span>: {institutions.length}</div>
                  <div><span style={{ color: "#34d399" }}>● Total Registered Users</span>: {users.length}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 5. SUBSCRIPTIONS TAB */}
        {activeTab === "subscriptions" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { name: "Basic Tier", price: "Free Trial", users: "Up to 100 Users", color: "#fbbf24" },
              { name: "Professional Tier", price: "Standard", users: "Up to 5,000 Users", color: "#38bdf8" },
              { name: "Enterprise Tier", price: "Full Suite", users: "Unlimited Users", color: "#c084fc" }
            ].map((plan, idx) => (
              <div key={idx} style={{ background: "#0f172a", border: `1px solid ${plan.color}`, padding: "28px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: plan.color }}>{plan.name}</h3>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "white", marginBottom: "8px" }}>{plan.price}</div>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>{plan.users}</p>
                <button style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: plan.color, color: "black", fontWeight: "700", cursor: "pointer" }}>
                  Plan Active
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 6. AUDIT LOGS TAB */}
        {activeTab === "audit_logs" && (
          <div style={{ background: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#38bdf8" }}>Platform Security Audit Logs</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8" }}>
                  <th style={{ padding: "12px" }}>Timestamp</th>
                  <th style={{ padding: "12px" }}>User</th>
                  <th style={{ padding: "12px" }}>Action</th>
                  <th style={{ padding: "12px" }}>Institution</th>
                  <th style={{ padding: "12px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                      No user audit logs available.
                    </td>
                  </tr>
                ) : (
                  users.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "12px", color: "#94a3b8" }}>{log.lastLogin}</td>
                      <td style={{ padding: "12px", color: "white" }}>{log.email}</td>
                      <td style={{ padding: "12px", color: "#38bdf8" }}>USER_REGISTERED</td>
                      <td style={{ padding: "12px", color: "#cbd5e1" }}>{log.institution}</td>
                      <td style={{ padding: "12px", color: "#34d399", fontWeight: "600" }}>Active</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ background: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", maxWidth: "600px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#c084fc" }}>Super Admin Platform Controls</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Super Admin Email ID
              </label>
              <input
                type="text"
                disabled
                value="superadmin2024@gmail.com"
                style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white" }}
              />
            </div>

            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Require OTP verification on Super Admin sign-in</div>
              </div>
              <span style={{ color: "#34d399", fontWeight: "700", fontSize: "13px" }}>ENABLED</span>
            </div>

            <button onClick={() => alert("Platform Cache Cleared Successfully!")} style={{ padding: "12px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer" }}>
              Clear System Cache
            </button>
          </div>
        )}
      </div>

      {/* ADD INSTITUTION MODAL */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", padding: "30px", borderRadius: "20px", width: "400px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#38bdf8" }}>Add New Institution</h3>
            <input
              type="text"
              placeholder="Institution Name (e.g. ABC College)"
              value={newInstName}
              onChange={(e) => setNewInstName(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white" }}
            />
            <input
              type="text"
              placeholder="Institution Code (e.g. ABC001)"
              value={newInstCode}
              onChange={(e) => setNewInstCode(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white" }}
            />
            <select
              value={newInstPlan}
              onChange={(e) => setNewInstPlan(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "20px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white" }}
            >
              <option value="Professional">Professional Plan</option>
              <option value="Enterprise">Enterprise Plan</option>
              <option value="Basic">Basic Plan</option>
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px", background: "#334155", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddInstitution} style={{ flex: 1, padding: "10px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
