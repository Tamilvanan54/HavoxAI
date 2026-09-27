import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaGraduationCap,
  FaUserShield,
  FaBuilding,
  FaCalendarAlt,
  FaBook,
  FaFileAlt,
  FaRobot,
  FaDatabase,
  FaSlidersH,
  FaChartBar,
  FaChartLine,
  FaBullhorn,
  FaDesktop,
  FaHistory,
  FaCogs,
  FaCrown,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaBell,
  FaSun,
  FaTrash,
  FaArrowRight,
  FaClock,
  FaFileUpload,
  FaBookOpen,
  FaPaperPlane,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";

export default function SuperAdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [userName, setUserName] = useState("SuperAdmin");

  // Drawer Sidebar Open/Close state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Accordion & Selection states
  const [selectedInstitute, setSelectedInstitute] = useState("college"); // "college" or "school"
  const [instituteTypeOpen, setInstituteTypeOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(true);

  // Institutions & Users state
  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_institutions: 0,
    active_institutions: 0,
    total_students: 0,
    total_staff: 0,
    total_admins: 0
  });

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");
  const [newUserCollege, setNewUserCollege] = useState("");

  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (role !== "superadmin") {
      navigate("/");
      return;
    }

    const savedName = localStorage.getItem("name") || localStorage.getItem("email") || "SuperAdmin";
    setUserName(savedName);

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
            total_staff: res.data.total_staff || 0,
            total_admins: res.data.total_admins || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch superadmin overview:", err);
      }
    };

    fetchOverview();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDeleteUser = async (userId, userEmail) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user '${userEmail}'?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/delete-user/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user!");
    }
  };

  // Filtered users depending on tab, search, and college/school selection
  const getFilteredUsersList = (specificRole = null) => {
    return users.filter(u => {
      const matchRole = specificRole
        ? u.role?.toLowerCase() === specificRole.toLowerCase()
        : (roleFilter === "ALL" || u.role?.toLowerCase() === roleFilter.toLowerCase());

      const isSchool = (u.institution?.toLowerCase().includes("school")) ||
                       (u.department?.startsWith("Class ")) ||
                       (u.college?.toLowerCase().includes("school"));

      const matchInst = selectedInstitute === "school" ? isSchool : !isSchool;

      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.institution?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchRole && matchSearch && matchInst;
    });
  };

  const totalUsersCount = users.length || 2450;
  const activeTodayCount = Math.round(totalUsersCount * 0.32) || 780;
  const studentsCount = stats.total_students || users.filter(u => u.role?.toLowerCase() === "student").length || 2120;
  const facultyCount = stats.total_staff || users.filter(u => u.role?.toLowerCase() === "staff").length || 210;
  const adminsCount = stats.total_admins || users.filter(u => u.role?.toLowerCase() === "admin").length || 20;

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close drawer after selection
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#0b0f19",
        color: "#f8fafc",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* TOP NAVBAR (WITH HAMBURGER & LOGO & PROFILE) */}
      <div
        style={{
          height: "64px",
          background: "#111827",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        {/* TOP LEFT: HAMBURGER BUTTON & LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* HAMBURGER MENU BUTTON (THREE LINES) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#cbd5e1",
              padding: "10px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
            }}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* LOGO ICON & APP TITLE */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src="/havox-icon.png"
                alt="HavoxAI"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
                style={{ width: "24px", height: "24px", objectFit: "contain" }}
              />
              <FaBookOpen style={{ color: "#38bdf8", fontSize: "18px" }} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "-0.5px", color: "white" }}>
                HavoxAI
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Super Admin Portal</div>
            </div>
          </div>
        </div>

        {/* TOP CENTER / RIGHT: SEARCH BAR & PROFILE */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* SEARCH BAR */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "8px 16px", borderRadius: "10px", width: "320px" }}>
            <FaSearch style={{ color: "#64748b", fontSize: "13px" }} />
            <input
              type="text"
              placeholder="Search anything (users, subjects, documents...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <FaBell style={{ color: "#94a3b8", fontSize: "18px" }} />
              <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "white", fontSize: "10px", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                5
              </span>
            </div>

            <FaSun style={{ color: "#94a3b8", fontSize: "18px", cursor: "pointer" }} />

            {/* DYNAMIC USERNAME DISPLAY */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "16px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#6366f1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "white" }}>{userName}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Super Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY BACKDROP FOR SIDEBAR DRAWER */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 999
          }}
        />
      )}

      {/* DRAWER SIDEBAR (SLIDES IN ON HAMBURGER CLICK) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: "280px",
          background: "#111827",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          zIndex: 1000,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "10px 0 30px rgba(0, 0, 0, 0.5)",
          overflowY: "auto"
        }}
      >
        {/* SIDEBAR HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaBookOpen style={{ color: "#38bdf8" }} />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "white" }}>HavoxAI</div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}
          >
            <FaTimes />
          </button>
        </div>

        {/* SIDEBAR MENU ITEMS */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 1. DASHBOARD */}
          <button
            onClick={() => handleTabClick("dashboard")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "dashboard" ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "rgba(255,255,255,0.03)",
              color: activeTab === "dashboard" ? "white" : "#cbd5e1",
              fontWeight: activeTab === "dashboard" ? "700" : "600",
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            <FaTachometerAlt style={{ fontSize: "16px" }} /> Dashboard
          </button>

          {/* 2. INSTITUTE TYPE (CATEGORIZED SECTION) */}
          <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", background: "rgba(30, 41, 59, 0.3)", overflow: "hidden" }}>
            <div
              onClick={() => setInstituteTypeOpen(!instituteTypeOpen)}
              style={{
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                fontWeight: "700",
                fontSize: "13px",
                color: "#c084fc",
                letterSpacing: "0.5px"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaBuilding /> Institute Type
              </span>
              {instituteTypeOpen ? <FaChevronDown /> : <FaChevronRight />}
            </div>

            {instituteTypeOpen && (
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* COLLEGE / SCHOOL SELECTOR BUTTONS */}
                <div style={{ display: "flex", gap: "6px", background: "rgba(15, 23, 42, 0.6)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedInstitute("college")}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: "8px",
                      border: "none",
                      background: selectedInstitute === "college" ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "transparent",
                      color: selectedInstitute === "college" ? "white" : "#94a3b8",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px"
                    }}
                  >
                    🎓 College
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedInstitute("school")}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: "8px",
                      border: "none",
                      background: selectedInstitute === "school" ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "transparent",
                      color: selectedInstitute === "school" ? "white" : "#94a3b8",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px"
                    }}
                  >
                    🏫 School
                  </button>
                </div>

                {/* USER MANAGEMENT */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                    User Management ({selectedInstitute === "college" ? "College" : "School"})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {[
                      { id: "users", label: "Users", icon: <FaUsers /> },
                      { id: "departments", label: selectedInstitute === "college" ? "Departments" : "Classes", icon: <FaBuilding /> },
                      { id: "faculty", label: selectedInstitute === "college" ? "Faculty" : "Teachers", icon: <FaUserTie /> },
                      { id: "students", label: "Students", icon: <FaGraduationCap /> },
                      { id: "admins", label: "Admins", icon: <FaUserShield /> },
                      { id: "roles", label: "Roles & Permissions", icon: <FaShieldAlt /> }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "none",
                          background: activeTab === item.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                          color: activeTab === item.id ? "#a5b4fc" : "#94a3b8",
                          fontWeight: activeTab === item.id ? "600" : "400",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.icon} {item.label}
                        </span>
                        <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACADEMIC MANAGEMENT */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                    Academic Management
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {[
                      { id: "academic_year", label: "Academic Year", icon: <FaCalendarAlt /> },
                      { id: "semesters", label: "Semesters", icon: <FaBookOpen /> },
                      { id: "subjects", label: "Subjects", icon: <FaBook /> },
                      { id: "materials", label: "Syllabus & Materials", icon: <FaFileAlt /> }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "none",
                          background: activeTab === item.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                          color: activeTab === item.id ? "#a5b4fc" : "#94a3b8",
                          fontWeight: activeTab === item.id ? "600" : "400",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.icon} {item.label}
                        </span>
                        <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI MANAGEMENT */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                    AI Management
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {[
                      { id: "ai_models", label: "AI Models", icon: <FaRobot /> },
                      { id: "rag_vector", label: "RAG & Vector DB", icon: <FaDatabase /> },
                      { id: "prompts", label: "Prompt Settings", icon: <FaSlidersH /> },
                      { id: "evaluation", label: "Evaluation", icon: <FaChartBar /> }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "none",
                          background: activeTab === item.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                          color: activeTab === item.id ? "#a5b4fc" : "#94a3b8",
                          fontWeight: activeTab === item.id ? "600" : "400",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.icon} {item.label}
                        </span>
                        <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ANALYTICS */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                    Analytics
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {[
                      { id: "usage_analytics", label: "Usage Analytics", icon: <FaChartLine /> },
                      { id: "department_reports", label: "Department Reports", icon: <FaFileAlt /> },
                      { id: "query_analytics", label: "Query Analytics", icon: <FaSearch /> }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "none",
                          background: activeTab === item.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                          color: activeTab === item.id ? "#a5b4fc" : "#94a3b8",
                          fontWeight: activeTab === item.id ? "600" : "400",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.icon} {item.label}
                        </span>
                        <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* COMMUNICATION */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                    Communication
                  </div>
                  <button
                    onClick={() => handleTabClick("announcements")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background: activeTab === "announcements" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      color: activeTab === "announcements" ? "#a5b4fc" : "#94a3b8",
                      fontWeight: activeTab === "announcements" ? "600" : "400",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaBullhorn /> Announcements
                    </span>
                    <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === "announcements" ? 1 : 0.3 }} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. SYSTEM SECTION */}
          <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", background: "rgba(30, 41, 59, 0.3)", overflow: "hidden" }}>
            <div
              onClick={() => setSystemOpen(!systemOpen)}
              style={{
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                fontWeight: "700",
                fontSize: "13px",
                color: "#38bdf8",
                letterSpacing: "0.5px"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCogs /> System
              </span>
              {systemOpen ? <FaChevronDown /> : <FaChevronRight />}
            </div>

            {systemOpen && (
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                {[
                  { id: "system_monitoring", label: "System Monitoring", icon: <FaDesktop /> },
                  { id: "audit_logs", label: "Audit Logs", icon: <FaHistory /> },
                  { id: "settings", label: "Settings", icon: <FaCogs /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background: activeTab === item.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      color: activeTab === item.id ? "#a5b4fc" : "#94a3b8",
                      fontWeight: activeTab === item.id ? "600" : "400",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {item.icon} {item.label}
                    </span>
                    <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#f87171",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* PAGE CONTENT AREA */}
      <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
        {/* 1. DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* PAGE TITLE & DATE SELECTOR */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "white", margin: "0 0 4px 0" }}>
                  Super Admin Dashboard
                </h1>
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                  Complete overview of HAVOX AI – Users, Academic, AI System and Usage Analytics
                </p>
              </div>

              <div style={{ background: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalendarAlt style={{ color: "#818cf8" }} /> Sep 1, 2026 – Sep 30, 2026
              </div>
            </div>

            {/* ROW 1: USER METRIC CARDS (5 CARDS) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
              {[
                { title: "Total Users", count: totalUsersCount.toLocaleString(), change: "↑ 12% +260 this month", bg: "rgba(59, 130, 246, 0.1)", iconBg: "#3b82f6", icon: <FaUsers /> },
                { title: "Active Users (Today)", count: activeTodayCount.toLocaleString(), change: "↑ 18% out of 2,450", bg: "rgba(34, 197, 94, 0.1)", iconBg: "#22c55e", icon: <FaUsers /> },
                { title: "Students", count: studentsCount.toLocaleString(), change: "86% of total users", bg: "rgba(168, 85, 247, 0.1)", iconBg: "#a855f7", icon: <FaGraduationCap /> },
                { title: "Faculty", count: facultyCount.toLocaleString(), change: "9% of total users", bg: "rgba(236, 72, 153, 0.1)", iconBg: "#ec4899", icon: <FaUserTie /> },
                { title: "Admins", count: adminsCount.toLocaleString(), change: "Platform Controllers", bg: "rgba(249, 115, 22, 0.1)", iconBg: "#f97316", icon: <FaUserShield /> }
              ].map((card, idx) => (
                <div key={idx} style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{card.title}</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: card.bg, color: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                      {card.icon}
                    </div>
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "white", marginBottom: "4px" }}>{card.count}</div>
                  <div style={{ fontSize: "11px", color: "#34d399" }}>{card.change}</div>
                </div>
              ))}
            </div>

            {/* ROW 2: SYSTEM METRIC CARDS (5 CARDS) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
              {[
                { title: "Study Materials", count: "320", change: "+18 this month", color: "#ec4899", icon: <FaFileAlt /> },
                { title: "Total Questions Asked", count: "4,820", change: "↑ 25% today", color: "#3b82f6", icon: <FaBook /> },
                { title: "AI Responses", count: "4,795", change: "99.5% success rate", color: "#eab308", icon: <FaRobot /> },
                { title: "Avg. Response Time", count: "8.4 sec", change: "↓ 32% faster than last month", color: "#a855f7", icon: <FaClock /> },
                { title: "System Status", count: "Healthy", change: "All services running", color: "#22c55e", icon: <FaCheckCircle /> }
              ].map((card, idx) => (
                <div key={idx} style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{card.title}</span>
                    <span style={{ fontSize: "16px", color: card.color }}>{card.icon}</span>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "white", marginBottom: "4px" }}>{card.count}</div>
                  <div style={{ fontSize: "11px", color: card.title === "System Status" ? "#34d399" : "#a5b4fc" }}>{card.change}</div>
                </div>
              ))}
            </div>

            {/* ROW 3: CHARTS (USAGE TREND & USERS BY DEPARTMENT) */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              {/* USAGE TREND LINE CHART */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>Usage Trend</h3>
                    <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", gap: "16px" }}>
                      <span style={{ color: "#38bdf8" }}>● Questions Asked</span>
                      <span style={{ color: "#a855f7" }}>● Active Users</span>
                    </div>
                  </div>
                  <select style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px" }}>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                {/* SVG Line Chart Representation */}
                <div style={{ height: "180px", width: "100%", position: "relative" }}>
                  <svg viewBox="0 0 500 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    <path
                      d="M 0,100 Q 50,40 100,70 T 200,30 T 300,80 T 400,20 T 500,50"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <path
                      d="M 0,130 Q 50,90 100,100 T 200,70 T 300,110 T 400,60 T 500,90"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="3"
                    />
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", color: "#64748b" }}>
                    <span>Sep 1</span><span>Sep 5</span><span>Sep 10</span><span>Sep 15</span><span>Sep 20</span><span>Sep 25</span><span>Sep 30</span>
                  </div>
                </div>
              </div>

              {/* USERS BY DEPARTMENT DONUT */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>Users by Department</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", background: "conic-gradient(#3b82f6 0% 33%, #8b5cf6 33% 59%, #06b6d4 59% 77%, #ec4899 77% 92%, #f59e0b 92% 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#111827", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "white" }}>2,450</span>
                      <span style={{ fontSize: "9px", color: "#94a3b8" }}>Total Users</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                    <div><span style={{ color: "#3b82f6" }}>● CSE (AI & ML)</span>: 820 (33%)</div>
                    <div><span style={{ color: "#8b5cf6" }}>● CSE</span>: 640 (26%)</div>
                    <div><span style={{ color: "#06b6d4" }}>● Cyber Security</span>: 430 (18%)</div>
                    <div><span style={{ color: "#ec4899" }}>● ECE</span>: 380 (15%)</div>
                    <div><span style={{ color: "#f59e0b" }}>● EEE</span>: 120 (5%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4: ANALYTICS GRID (3 COLUMNS) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              {/* MOST ASKED SUBJECTS */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>Most Asked Subjects</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { name: "Machine Learning", count: "1,240", color: "#3b82f6", width: "85%" },
                    { name: "DBMS", count: "980", color: "#8b5cf6", width: "70%" },
                    { name: "Mathematics", count: "820", color: "#10b981", width: "60%" },
                    { name: "Python", count: "760", color: "#f59e0b", width: "55%" },
                    { name: "Data Structures", count: "540", color: "#ef4444", width: "40%" }
                  ].map((sub, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span style={{ color: "#cbd5e1" }}>{sub.name}</span>
                        <span style={{ color: "#94a3b8" }}>{sub.count}</span>
                      </div>
                      <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: sub.width, height: "100%", background: sub.color, borderRadius: "3px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* USER ACTIVITY HEATMAP */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>User Activity Heatmap</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
                  <span>12AM</span><span>4AM</span><span>8AM</span><span>12PM</span><span>4PM</span><span>8PM</span>
                  {[
                    [0.1, 0.1, 0.4, 0.8, 0.9, 0.5],
                    [0.1, 0.1, 0.5, 0.9, 0.8, 0.6],
                    [0.1, 0.2, 0.6, 0.9, 0.9, 0.7],
                    [0.1, 0.1, 0.5, 0.8, 0.7, 0.5],
                    [0.1, 0.2, 0.7, 0.9, 0.8, 0.4],
                    [0.1, 0.1, 0.3, 0.6, 0.5, 0.2]
                  ].map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        style={{
                          height: "20px",
                          borderRadius: "4px",
                          background: `rgba(99, 102, 241, ${val})`
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* RECENT ACTIVITIES */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "white" }}>Recent Activities</h3>
                  <span style={{ fontSize: "12px", color: "#6366f1", cursor: "pointer", fontWeight: "600" }}>View All</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
                  {[
                    { icon: "📄", title: "New PDF uploaded - ML Unit 4 Notes", sub: "by Akshaya (Faculty)", time: "10:24 AM" },
                    { icon: "👥", title: "New user added - 45 students", sub: "Department: CSE (AI & ML)", time: "09:18 AM" },
                    { icon: "🤖", title: "AI Model switched to qwen2.5:1.5b", sub: "by Super Admin", time: "08:45 AM" },
                    { icon: "⚙️", title: "Department 'ECE' enabled", sub: "by Super Admin", time: "08:30 AM" },
                    { icon: "🟢", title: "System backup completed", sub: "All services healthy", time: "07:15 AM" }
                  ].map((act, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <span>{act.icon}</span>
                        <div>
                          <div style={{ color: "white", fontWeight: "600" }}>{act.title}</div>
                          <div style={{ color: "#94a3b8", fontSize: "11px" }}>{act.sub}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 5: AI SYSTEM HEALTH, RESOURCES & QUICK ACTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              {/* AI SYSTEM HEALTH */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>AI System Health</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { name: "Backend", status: "Running" },
                    { name: "RAG Service", status: "Running" },
                    { name: "Vector DB", status: "Running" },
                    { name: "Ollama", status: "Running" },
                    { name: "Database", status: "Running" },
                    { name: "Storage", status: "Running" }
                  ].map((srv, idx) => (
                    <div key={idx} style={{ background: "#1e293b", padding: "10px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{srv.name}</span>
                      <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        ● {srv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SYSTEM RESOURCES */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>System Resources</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", textAlign: "center", marginBottom: "16px" }}>
                  {[
                    { label: "CPU", val: "32%", color: "#3b82f6" },
                    { label: "RAM", val: "58%", color: "#10b981" },
                    { label: "Disk", val: "41%", color: "#f59e0b" },
                    { label: "GPU", val: "22%", color: "#8b5cf6" }
                  ].map((res, i) => (
                    <div key={i} style={{ background: "#1e293b", padding: "12px 6px", borderRadius: "10px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: res.color }}>{res.val}</div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>{res.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                  <span>Uptime: 12 days 6 hours</span>
                  <span style={{ color: "#22c55e" }}>● Network Healthy</span>
                </div>
              </div>

              {/* QUICK ACTIONS GRID */}
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "white" }}>Quick Actions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Add User", icon: <FaUsers />, action: () => setActiveTab("users") },
                    { label: "Upload Material", icon: <FaFileUpload />, action: () => setActiveTab("materials") },
                    { label: "Add Subject", icon: <FaBook />, action: () => setActiveTab("subjects") },
                    { label: "Announcement", icon: <FaPaperPlane />, action: () => setActiveTab("announcements") },
                    { label: "AI Settings", icon: <FaRobot />, action: () => setActiveTab("ai_models") },
                    { label: "View Reports", icon: <FaChartLine />, action: () => setActiveTab("usage_analytics") }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={btn.action}
                      style={{
                        background: "#1e293b",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        padding: "12px 6px",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer"
                      }}
                    >
                      <span style={{ fontSize: "16px", color: "#818cf8" }}>{btn.icon}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS / FACULTY / STUDENTS / ADMINS VIEWS */}
        {["users", "faculty", "students", "admins"].includes(activeTab) && (
          <div style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "white", textTransform: "capitalize", display: "flex", alignItems: "center", gap: "10px" }}>
                👥 {activeTab} Management
              </h2>

              <button
                onClick={() => setShowAddUserModal(true)}
                style={{ background: "#6366f1", color: "white", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaPlus /> Add New User
              </button>
            </div>

            {/* Total Users Summary Card */}
            <div style={{ background: "#1e293b", padding: "16px 24px", borderRadius: "12px", width: "220px", marginBottom: "25px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "white", margin: "0 0 4px 0" }}>
                {getFilteredUsersList(activeTab === "users" ? null : activeTab).length}
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Total {activeTab}</div>
            </div>

            {/* Search & Role Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)", width: "350px" }}>
                <FaSearch style={{ color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
                />
              </div>

              {activeTab === "users" && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ padding: "8px 12px", background: "#1e293b", color: "white", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", fontSize: "13px" }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff / Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", background: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                  <th style={{ padding: "14px" }}>ID</th>
                  <th style={{ padding: "14px" }}>Name</th>
                  <th style={{ padding: "14px" }}>Email</th>
                  <th style={{ padding: "14px" }}>Institution / Dept</th>
                  <th style={{ padding: "14px" }}>Role</th>
                  <th style={{ padding: "14px" }}>Profile</th>
                  <th style={{ padding: "14px" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredUsersList(activeTab === "users" ? null : activeTab).length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                      No Users Found
                    </td>
                  </tr>
                ) : (
                  getFilteredUsersList(activeTab === "users" ? null : activeTab).map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "14px", color: "#94a3b8", fontWeight: "600" }}>{user.id}</td>
                      <td style={{ padding: "14px", fontWeight: "600", color: "white" }}>{user.name}</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{user.email}</td>
                      <td style={{ padding: "14px", color: "#38bdf8" }}>{user.institution || "HavoxAI Platform"}</td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            background: user.role?.toLowerCase() === "admin" ? "#ef4444" : user.role?.toLowerCase() === "staff" ? "#f59e0b" : "#22c55e",
                            color: "white",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-block"
                          }}
                        >
                          {user.role?.toLowerCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <button
                          onClick={() => navigate(`/user-profile/${user.id}`)}
                          title="View Profile"
                          style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
                        >
                          →
                        </button>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          title="Delete User"
                          style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* OTHER TABS GENERIC VIEW */}
        {!["dashboard", "users", "faculty", "students", "admins"].includes(activeTab) && (
          <div style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "white", margin: "0 0 12px 0", textTransform: "capitalize" }}>
              {activeTab.replace("_", " ")} Management
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>
              Managing {activeTab.replace("_", " ")} settings and system configurations for HAVOX AI Platform.
            </p>
            <div style={{ background: "#1e293b", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#cbd5e1" }}>
              <FaCogs style={{ fontSize: "36px", color: "#6366f1", marginBottom: "12px" }} />
              <div style={{ fontSize: "16px", fontWeight: "700" }}>{activeTab.toUpperCase().replace("_", " ")} CONTROL PANEL</div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>All platform configurations for this module are active and synced.</div>
            </div>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", padding: "30px", borderRadius: "20px", width: "420px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#818cf8" }}>Add New User</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", boxSizing: "border-box" }}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", boxSizing: "border-box" }}
            />
            <input
              type="text"
              placeholder="College / School Name"
              value={newUserCollege}
              onChange={(e) => setNewUserCollege(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", boxSizing: "border-box" }}
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "20px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", boxSizing: "border-box" }}
            >
              <option value="student">Student</option>
              <option value="staff">Staff / Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowAddUserModal(false)} style={{ flex: 1, padding: "10px", background: "#334155", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>
              <button
                onClick={() => {
                  alert(`User '${newUserName}' created!`);
                  setShowAddUserModal(false);
                }}
                style={{ flex: 1, padding: "10px", background: "#6366f1", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
