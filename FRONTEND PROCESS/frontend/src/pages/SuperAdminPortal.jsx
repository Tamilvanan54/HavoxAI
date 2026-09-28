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
  FaCogs,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaBell,
  FaSun,
  FaTrash,
  FaArrowRight,
  FaBookOpen,
  FaChevronDown,
  FaChevronRight,
  FaSchool
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
  const [instituteTypeOpen, setInstituteTypeOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);

  // Selected institute for scoped view (when clicking a college/school card)
  const [selectedInstitute, setSelectedInstitute] = useState(null); // { name, type }
  const [instituteSubMenuOpen, setInstituteSubMenuOpen] = useState(true);

  // Institutions & Users state
  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_institutions: 0,
    active_institutions: 0,
    total_students: 0,
    total_staff: 0,
    total_admins: 0,
    total_users: 0
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
            total_institutions: res.data.total_institutions || 0,
            active_institutions: res.data.active_institutions || 0,
            total_students: res.data.total_students || 0,
            total_staff: res.data.total_staff || 0,
            total_admins: res.data.total_admins || 0,
            total_users: res.data.total_users || 0
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

  // Helper: Is this institution a "School"?
  const isSchoolInstitution = (inst) => {
    return inst.type?.toLowerCase() === "school";
  };

  // Get colleges list
  const colleges = institutions.filter(i => !isSchoolInstitution(i));
  const schools = institutions.filter(i => isSchoolInstitution(i));

  // Filtered users based on active tab and optional institute scoping
  const getFilteredUsers = (specificRole = null) => {
    return users.filter(u => {
      // Role filter
      const matchRole = specificRole
        ? u.role?.toLowerCase() === specificRole.toLowerCase()
        : (roleFilter === "ALL" || u.role?.toLowerCase() === roleFilter.toLowerCase());

      // If a specific institute is selected, scope to that institute
      const matchInst = selectedInstitute
        ? (u.institution?.toLowerCase() === selectedInstitute.name?.toLowerCase())
        : true;

      // Search filter
      const matchSearch = !searchTerm || 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.institution?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchRole && matchInst && matchSearch;
    });
  };

  // Get unique departments for the selected institute (or all)
  const getDepartments = () => {
    const filteredUsers = selectedInstitute 
      ? users.filter(u => u.institution?.toLowerCase() === selectedInstitute.name?.toLowerCase())
      : users;
    
    const deptMap = {};
    filteredUsers.forEach(u => {
      const dept = u.department || "General";
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, students: 0, staff: 0, admins: 0, total: 0 };
      }
      deptMap[dept].total++;
      if (u.role?.toLowerCase() === "student") deptMap[dept].students++;
      else if (u.role?.toLowerCase() === "staff") deptMap[dept].staff++;
      else if (u.role?.toLowerCase() === "admin") deptMap[dept].admins++;
    });
    return Object.values(deptMap).filter(d => 
      !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Real counts from data
  const totalUsersCount = users.length;
  const studentsCount = stats.total_students || users.filter(u => u.role?.toLowerCase() === "student").length;
  const facultyCount = stats.total_staff || users.filter(u => u.role?.toLowerCase() === "staff").length;
  const adminsCount = stats.total_admins || users.filter(u => u.role?.toLowerCase() === "admin").length;

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // If clicking dashboard, college_list, school_list → clear selected institute
    if (["dashboard", "college_list", "school_list"].includes(tabId)) {
      setSelectedInstitute(null);
    }
    setSidebarOpen(false);
  };

  // When a college/school card is clicked
  const handleInstituteClick = (inst) => {
    setSelectedInstitute(inst);
    setInstituteSubMenuOpen(true);
    setActiveTab("inst_users"); // Default to users view for that institute
    setSidebarOpen(false);
  };

  // Sidebar button style helper
  const sidebarBtnStyle = (isActive) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "none",
    background: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
    color: isActive ? "#a5b4fc" : "#94a3b8",
    fontWeight: isActive ? "600" : "400",
    fontSize: "12px",
    cursor: "pointer"
  });

  // Institute card component
  const InstituteCard = ({ inst, index }) => {
    const totalUsers = (inst.students || 0) + (inst.staff || 0) + (inst.admins || 0);
    const isCollege = !isSchoolInstitution(inst);
    return (
      <div
        onClick={() => handleInstituteClick(inst)}
        style={{
          background: "#111827",
          border: selectedInstitute?.name === inst.name 
            ? "2px solid #6366f1" 
            : "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "14px",
          padding: "20px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = selectedInstitute?.name === inst.name 
            ? "#6366f1" : "rgba(255, 255, 255, 0.06)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: isCollege ? "rgba(99, 102, 241, 0.15)" : "rgba(168, 85, 247, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isCollege ? "#818cf8" : "#a855f7", fontSize: "18px"
            }}>
              {isCollege ? <FaGraduationCap /> : <FaSchool />}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "white", lineHeight: "1.3" }}>{inst.name}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{inst.code || `INST${String(index + 1).padStart(3, '0')}`}</div>
            </div>
          </div>
          <span style={{
            background: inst.status === "Active" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: inst.status === "Active" ? "#22c55e" : "#ef4444",
            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600"
          }}>
            {inst.status || "Active"}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          <div style={{ background: "#1e293b", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#38bdf8" }}>{inst.students || 0}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Students</div>
          </div>
          <div style={{ background: "#1e293b", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#a855f7" }}>{inst.staff || 0}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Faculty</div>
          </div>
          <div style={{ background: "#1e293b", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#f59e0b" }}>{inst.admins || 0}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Admins</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            Total: {totalUsers} users
          </div>
          <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            View Details <FaArrowRight style={{ fontSize: "9px" }} />
          </div>
        </div>
      </div>
    );
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
      {/* TOP NAVBAR */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <div
              style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <img
                src="/havox-icon.png"
                alt="HavoxAI"
                onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                style={{ width: "24px", height: "24px", objectFit: "contain" }}
              />
              <FaBookOpen style={{ color: "#38bdf8", fontSize: "18px" }} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "-0.5px", color: "white" }}>HavoxAI</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Super Admin Portal</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "8px 16px", borderRadius: "10px", width: "320px" }}>
            <FaSearch style={{ color: "#64748b", fontSize: "13px" }} />
            <input
              type="text"
              placeholder="Search users, colleges, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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

      {/* OVERLAY BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 999
          }}
        />
      )}

      {/* DRAWER SIDEBAR */}
      <div
        style={{
          position: "fixed", top: 0, bottom: 0, left: 0,
          width: "280px",
          background: "#111827",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px 18px",
          display: "flex", flexDirection: "column", gap: "16px",
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

        {/* SIDEBAR MENU */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* 1. DASHBOARD */}
          <button
            onClick={() => handleTabClick("dashboard")}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 14px", borderRadius: "10px", border: "none",
              background: activeTab === "dashboard" ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "rgba(255,255,255,0.03)",
              color: activeTab === "dashboard" ? "white" : "#cbd5e1",
              fontWeight: activeTab === "dashboard" ? "700" : "600",
              fontSize: "14px", cursor: "pointer", textAlign: "left"
            }}
          >
            <FaTachometerAlt style={{ fontSize: "16px" }} /> Dashboard
          </button>

          {/* 2. INSTITUTE TYPE SECTION */}
          <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", background: "rgba(30, 41, 59, 0.3)", overflow: "hidden" }}>
            <div
              onClick={() => setInstituteTypeOpen(!instituteTypeOpen)}
              style={{
                padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", background: "rgba(255,255,255,0.04)",
                fontWeight: "700", fontSize: "13px", color: "#c084fc", letterSpacing: "0.5px"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaBuilding /> Institute Type
              </span>
              {instituteTypeOpen ? <FaChevronDown /> : <FaChevronRight />}
            </div>

            {instituteTypeOpen && (
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* College */}
                <button
                  onClick={() => handleTabClick("college_list")}
                  style={sidebarBtnStyle(activeTab === "college_list")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    🎓 College
                    <span style={{ background: "#1e293b", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", color: "#94a3b8" }}>
                      {colleges.length}
                    </span>
                  </span>
                  <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === "college_list" ? 1 : 0.3 }} />
                </button>

                {/* School */}
                <button
                  onClick={() => handleTabClick("school_list")}
                  style={sidebarBtnStyle(activeTab === "school_list")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    🏫 School
                    <span style={{ background: "#1e293b", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", color: "#94a3b8" }}>
                      {schools.length}
                    </span>
                  </span>
                  <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === "school_list" ? 1 : 0.3 }} />
                </button>

                {/* If a specific institute is selected, show its sub-menu */}
                {selectedInstitute && (
                  <div style={{ marginTop: "8px", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "10px", background: "rgba(99, 102, 241, 0.05)", overflow: "hidden" }}>
                    <div
                      onClick={() => setInstituteSubMenuOpen(!instituteSubMenuOpen)}
                      style={{
                        padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        cursor: "pointer", background: "rgba(99, 102, 241, 0.1)",
                        fontWeight: "700", fontSize: "12px", color: "#a5b4fc"
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {isSchoolInstitution(selectedInstitute) ? "🏫" : "🎓"} {selectedInstitute.name?.length > 18 ? selectedInstitute.name.substring(0, 18) + "..." : selectedInstitute.name}
                      </span>
                      {instituteSubMenuOpen ? <FaChevronDown style={{ fontSize: "10px" }} /> : <FaChevronRight style={{ fontSize: "10px" }} />}
                    </div>

                    {instituteSubMenuOpen && (
                      <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
                        {/* User Management Sub-items */}
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: "4px 0 2px 4px" }}>
                          User Management
                        </div>
                        {[
                          { id: "inst_users", label: "Users", icon: <FaUsers /> },
                          { id: "inst_faculty", label: isSchoolInstitution(selectedInstitute) ? "Teachers" : "Faculty", icon: <FaUserTie /> },
                          { id: "inst_students", label: "Students", icon: <FaGraduationCap /> },
                          { id: "inst_admins", label: "Admins", icon: <FaUserShield /> },
                          { id: "inst_departments", label: isSchoolInstitution(selectedInstitute) ? "Classes" : "Departments", icon: <FaBuilding /> },
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            style={sidebarBtnStyle(activeTab === item.id)}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {item.icon} {item.label}
                            </span>
                            <FaArrowRight style={{ fontSize: "8px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                          </button>
                        ))}

                        {/* Academic Management Sub-items */}
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: "8px 0 2px 4px" }}>
                          Academic Management
                        </div>
                        {[
                          { id: "inst_academic_year", label: "Academic Year", icon: <FaCalendarAlt /> },
                          { id: "inst_semesters", label: isSchoolInstitution(selectedInstitute) ? "Terms / Standards" : "Semesters", icon: <FaBookOpen /> },
                          { id: "inst_subjects", label: "Subjects", icon: <FaBook /> },
                          { id: "inst_materials", label: "Syllabus & Materials", icon: <FaFileAlt /> },
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            style={sidebarBtnStyle(activeTab === item.id)}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {item.icon} {item.label}
                            </span>
                            <FaArrowRight style={{ fontSize: "8px", opacity: activeTab === item.id ? 1 : 0.3 }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. GLOBAL USER VIEWS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: "4px 0 4px 4px" }}>
              All Users
            </div>
            {[
              { id: "all_users", label: "Users", icon: <FaUsers />, count: totalUsersCount },
              { id: "all_faculty", label: "Faculty", icon: <FaUserTie />, count: facultyCount },
              { id: "all_students", label: "Students", icon: <FaGraduationCap />, count: studentsCount },
              { id: "all_admins", label: "Admins", icon: <FaUserShield />, count: adminsCount },
              { id: "all_departments", label: "Departments", icon: <FaBuilding />, count: null },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedInstitute(null); handleTabClick(item.id); }}
                style={sidebarBtnStyle(activeTab === item.id)}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {item.icon} {item.label}
                  {item.count !== null && (
                    <span style={{ background: "#1e293b", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", color: "#94a3b8" }}>
                      {item.count}
                    </span>
                  )}
                </span>
                <FaArrowRight style={{ fontSize: "9px", opacity: activeTab === item.id ? 1 : 0.3 }} />
              </button>
            ))}
          </div>

          {/* 4. SYSTEM SECTION */}
          <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", background: "rgba(30, 41, 59, 0.3)", overflow: "hidden" }}>
            <div
              onClick={() => setSystemOpen(!systemOpen)}
              style={{
                padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", background: "rgba(255,255,255,0.04)",
                fontWeight: "700", fontSize: "13px", color: "#38bdf8", letterSpacing: "0.5px"
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
                  { id: "settings", label: "Settings", icon: <FaCogs /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    style={sidebarBtnStyle(activeTab === item.id)}
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
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px", borderRadius: "10px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#f87171", fontWeight: "600", fontSize: "13px", cursor: "pointer"
          }}
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* ======================== PAGE CONTENT AREA ======================== */}
      <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>

        {/* ====== DASHBOARD VIEW ====== */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "white", margin: "0 0 4px 0" }}>
                Super Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                Overview of all registered colleges & schools on HavoxAI
              </p>
            </div>

            {/* Summary Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              {[
                { title: "Total Institutions", count: institutions.length, bg: "rgba(99, 102, 241, 0.1)", iconBg: "#6366f1", icon: <FaBuilding /> },
                { title: "Colleges", count: colleges.length, bg: "rgba(59, 130, 246, 0.1)", iconBg: "#3b82f6", icon: <FaGraduationCap /> },
                { title: "Schools", count: schools.length, bg: "rgba(168, 85, 247, 0.1)", iconBg: "#a855f7", icon: <FaSchool /> },
                { title: "Total Users", count: totalUsersCount, bg: "rgba(34, 197, 94, 0.1)", iconBg: "#22c55e", icon: <FaUsers /> },
                { title: "Students", count: studentsCount, bg: "rgba(56, 189, 248, 0.1)", iconBg: "#38bdf8", icon: <FaGraduationCap /> },
                { title: "Faculty", count: facultyCount, bg: "rgba(236, 72, 153, 0.1)", iconBg: "#ec4899", icon: <FaUserTie /> },
              ].map((card, idx) => (
                <div key={idx} style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{card.title}</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: card.bg, color: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                      {card.icon}
                    </div>
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "white" }}>{card.count}</div>
                </div>
              ))}
            </div>

            {/* All Colleges & Schools */}
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: "0 0 16px 0" }}>
                All Registered Institutions ({institutions.length})
              </h2>
              {institutions.length === 0 ? (
                <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "14px", padding: "40px", textAlign: "center" }}>
                  <FaBuilding style={{ fontSize: "36px", color: "#334155", marginBottom: "12px" }} />
                  <div style={{ fontSize: "15px", color: "#94a3b8" }}>No institutions registered yet</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>When admins register and log in, their colleges/schools will appear here</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {institutions
                    .filter(i => !searchTerm || i.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((inst, idx) => (
                      <InstituteCard key={idx} inst={inst} index={idx} />
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== COLLEGE LIST VIEW ====== */}
        {activeTab === "college_list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "white", margin: "0 0 4px 0" }}>
                🎓 Colleges ({colleges.length})
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>All registered colleges on HavoxAI</p>
            </div>
            {colleges.length === 0 ? (
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "14px", padding: "40px", textAlign: "center" }}>
                <FaGraduationCap style={{ fontSize: "36px", color: "#334155", marginBottom: "12px" }} />
                <div style={{ fontSize: "15px", color: "#94a3b8" }}>No colleges registered yet</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {colleges
                  .filter(i => !searchTerm || i.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((inst, idx) => (
                    <InstituteCard key={idx} inst={inst} index={idx} />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ====== SCHOOL LIST VIEW ====== */}
        {activeTab === "school_list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "white", margin: "0 0 4px 0" }}>
                🏫 Schools ({schools.length})
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>All registered schools on HavoxAI</p>
            </div>
            {schools.length === 0 ? (
              <div style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "14px", padding: "40px", textAlign: "center" }}>
                <FaSchool style={{ fontSize: "36px", color: "#334155", marginBottom: "12px" }} />
                <div style={{ fontSize: "15px", color: "#94a3b8" }}>No schools registered yet</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {schools
                  .filter(i => !searchTerm || i.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((inst, idx) => (
                    <InstituteCard key={idx} inst={inst} index={idx} />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ====== USER TABLE VIEWS (Global & Institute-scoped) ====== */}
        {["all_users", "all_faculty", "all_students", "all_admins", "inst_users", "inst_faculty", "inst_students", "inst_admins"].includes(activeTab) && (() => {
          const isInst = activeTab.startsWith("inst_");
          const roleMap = {
            "all_users": null, "inst_users": null,
            "all_faculty": "staff", "inst_faculty": "staff",
            "all_students": "student", "inst_students": "student",
            "all_admins": "admin", "inst_admins": "admin",
          };
          const role = roleMap[activeTab];
          const tabLabel = activeTab.replace("all_", "").replace("inst_", "").replace("_", " ");
          const filteredList = getFilteredUsers(role);

          return (
            <div style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "white", textTransform: "capitalize", display: "flex", alignItems: "center", gap: "10px" }}>
                    👥 {tabLabel} Management
                  </h2>
                  {isInst && selectedInstitute && (
                    <div style={{ fontSize: "13px", color: "#818cf8", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaBuilding style={{ fontSize: "11px" }} /> {selectedInstitute.name}
                      <button
                        onClick={() => { setSelectedInstitute(null); setActiveTab("all_users"); }}
                        style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", marginLeft: "8px" }}
                      >
                        ✕ Clear
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  style={{ background: "#6366f1", color: "white", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FaPlus /> Add New User
                </button>
              </div>

              {/* Stats */}
              <div style={{ background: "#1e293b", padding: "16px 24px", borderRadius: "12px", width: "220px", marginBottom: "20px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "white" }}>{filteredList.length}</div>
                <div style={{ fontSize: "13px", color: "#94a3b8", textTransform: "capitalize" }}>Total {tabLabel}</div>
              </div>

              {/* Search & Filter */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)", width: "350px" }}>
                  <FaSearch style={{ color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Search user by name, email, or college..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
                  />
                </div>
                {(activeTab === "all_users" || activeTab === "inst_users") && (
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
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", background: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                      <th style={{ padding: "14px" }}>ID</th>
                      <th style={{ padding: "14px" }}>Name</th>
                      <th style={{ padding: "14px" }}>Email</th>
                      <th style={{ padding: "14px" }}>College / School</th>
                      <th style={{ padding: "14px" }}>Role</th>
                      <th style={{ padding: "14px" }}>Last Login</th>
                      <th style={{ padding: "14px" }}>Profile</th>
                      <th style={{ padding: "14px" }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                          No Users Found
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((user) => (
                        <tr key={user.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "14px", color: "#94a3b8", fontWeight: "600" }}>{user.id}</td>
                          <td style={{ padding: "14px", fontWeight: "600", color: "white" }}>{user.name}</td>
                          <td style={{ padding: "14px", color: "#cbd5e1" }}>{user.email}</td>
                          <td style={{ padding: "14px", color: "#38bdf8" }}>{user.institution || "—"}</td>
                          <td style={{ padding: "14px" }}>
                            <span
                              style={{
                                background: user.role?.toLowerCase() === "admin" ? "#ef4444" : user.role?.toLowerCase() === "staff" ? "#f59e0b" : "#22c55e",
                                color: "white",
                                padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block"
                              }}
                            >
                              {user.role?.toLowerCase()}
                            </span>
                          </td>
                          <td style={{ padding: "14px", color: "#94a3b8", fontSize: "12px" }}>{user.lastLogin || "—"}</td>
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
            </div>
          );
        })()}

        {/* ====== DEPARTMENTS VIEW (Global & Institute-scoped) ====== */}
        {["all_departments", "inst_departments"].includes(activeTab) && (
          <div style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                  🏢 {selectedInstitute && isSchoolInstitution(selectedInstitute) ? "Classes" : "Departments"}
                </h2>
                {selectedInstitute && (
                  <div style={{ fontSize: "13px", color: "#818cf8", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaBuilding style={{ fontSize: "11px" }} /> {selectedInstitute.name}
                    <button
                      onClick={() => { setSelectedInstitute(null); setActiveTab("all_departments"); }}
                      style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", marginLeft: "8px" }}
                    >
                      ✕ Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)", width: "350px", marginBottom: "20px" }}>
              <FaSearch style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "13px" }}
              />
            </div>

            {/* Department Cards */}
            {getDepartments().length === 0 ? (
              <div style={{ background: "#1e293b", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>
                No departments found
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                {getDepartments().map((dept, idx) => (
                  <div key={idx} style={{ background: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "white", marginBottom: "12px" }}>{dept.name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", fontSize: "11px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#38bdf8" }}>{dept.total}</div>
                        <div style={{ color: "#64748b" }}>Total</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#22c55e" }}>{dept.students}</div>
                        <div style={{ color: "#64748b" }}>Students</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#a855f7" }}>{dept.staff}</div>
                        <div style={{ color: "#64748b" }}>Faculty</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#f59e0b" }}>{dept.admins}</div>
                        <div style={{ color: "#64748b" }}>Admins</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== INSTITUTE-SCOPED ACADEMIC MANAGEMENT (Placeholder) ====== */}
        {["inst_academic_year", "inst_semesters", "inst_subjects", "inst_materials"].includes(activeTab) && (
          <div style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "white", margin: "0 0 8px 0", textTransform: "capitalize" }}>
              {activeTab.replace("inst_", "").replace("_", " ")} Management
            </h2>
            {selectedInstitute && (
              <div style={{ fontSize: "13px", color: "#818cf8", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaBuilding style={{ fontSize: "11px" }} /> {selectedInstitute.name}
              </div>
            )}
            <div style={{ background: "#1e293b", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#cbd5e1" }}>
              <FaCogs style={{ fontSize: "36px", color: "#6366f1", marginBottom: "12px" }} />
              <div style={{ fontSize: "16px", fontWeight: "700" }}>{activeTab.replace("inst_", "").replace("_", " ").toUpperCase()} CONTROL PANEL</div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                Academic management for {selectedInstitute?.name || "this institution"} — coming soon.
              </div>
            </div>
          </div>
        )}

        {/* ====== OTHER TABS (Settings etc.) ====== */}
        {!["dashboard", "college_list", "school_list",
          "all_users", "all_faculty", "all_students", "all_admins", "all_departments",
          "inst_users", "inst_faculty", "inst_students", "inst_admins", "inst_departments",
          "inst_academic_year", "inst_semesters", "inst_subjects", "inst_materials"
        ].includes(activeTab) && (
          <div style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "white", margin: "0 0 12px 0", textTransform: "capitalize" }}>
              {activeTab.replace("_", " ")} Management
            </h2>
            <div style={{ background: "#1e293b", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#cbd5e1" }}>
              <FaCogs style={{ fontSize: "36px", color: "#6366f1", marginBottom: "12px" }} />
              <div style={{ fontSize: "16px", fontWeight: "700" }}>{activeTab.toUpperCase().replace("_", " ")} CONTROL PANEL</div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>Configuration panel — coming soon.</div>
            </div>
          </div>
        )}
      </div>

      {/* ====== ADD USER MODAL ====== */}
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
