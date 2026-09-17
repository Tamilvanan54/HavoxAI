import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { FaEye, FaEyeSlash, FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";
import { TN_ENGINEERING_COLLEGES, ENGINEERING_DEPARTMENTS } from "../data/collegesAndDepartments";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = (searchParams.get("role") || "student").toLowerCase();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(roleParam);
  
  // College search & select state
  const [college, setCollege] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  const collegeDropdownRef = useRef(null);

  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("3rd Year");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleParam) {
      setRole(roleParam);
    }
  }, [roleParam]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target)) {
        setIsCollegeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredColleges = TN_ENGINEERING_COLLEGES.filter((col) =>
    col.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleSignup = async () => {
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!college.trim()) {
      setError("Please select your College Name");
      return;
    }

    if (role === "student" && !department) {
      setError("Please select your Department");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/signup`,
        null,
        {
          params: {
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            college: college.trim(),
            department: role === "student" ? department : null,
            year: role === "student" ? year : null,
          },
        }
      );

      if (response.data.status) {
        alert("Account Created Successfully! Please login with your credentials.");
        navigate("/");
      } else {
        setError(response.data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isStudent = role === "student";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        padding: "30px 15px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "460px",
          padding: "35px",
          borderRadius: "20px",
          background: "#171717",
          border: "1px solid #2f2f2f",
          boxShadow: "0px 0px 30px rgba(0,0,0,0.6)",
          boxSizing: "border-box"
        }}
      >
        {/* LOGO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <img
            src="/logo.png"
            alt="HavoxAI Logo"
            style={{
              width: "65px",
              height: "65px",
              borderRadius: "14px",
              objectFit: "cover",
              display: "block",
              boxShadow: "0 4px 18px rgba(0, 194, 255, 0.25)"
            }}
          />
          <span
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "-0.5px",
              fontFamily: "'Inter', system-ui, sans-serif"
            }}
          >
            HavoxAI
          </span>
        </div>

        <h2 style={{ textAlign: "center", margin: "0 0 6px 0", fontSize: "20px", color: "white" }}>
          Create Account
        </h2>
        <p style={{ textAlign: "center", margin: "0 0 20px 0", fontSize: "13px", color: "#9ca3af" }}>
          Registering as <strong style={{ color: "#38bdf8", textTransform: "capitalize" }}>{role}</strong>
        </p>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: "10px 14px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontSize: "13px",
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}

        {/* FULL NAME */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "12px",
            background: "#262626",
            color: "white",
            border: "1px solid #404040",
            borderRadius: "10px",
            outline: "none",
            boxSizing: "border-box"
          }}
        />

        {/* EMAIL ID */}
        <input
          type="email"
          placeholder="Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "12px",
            background: "#262626",
            color: "white",
            border: "1px solid #404040",
            borderRadius: "10px",
            outline: "none",
            boxSizing: "border-box"
          }}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative", width: "100%", marginBottom: "12px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 42px 12px 14px",
              background: "#262626",
              color: "white",
              border: "1px solid #404040",
              borderRadius: "10px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <div style={{ position: "relative", width: "100%", marginBottom: "12px" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 42px 12px 14px",
              background: "#262626",
              color: "white",
              border: "1px solid #404040",
              borderRadius: "10px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* SEARCHABLE TAMIL NADU COLLEGE SELECTOR */}
        <div style={{ position: "relative", marginBottom: "12px" }} ref={collegeDropdownRef}>
          <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
            College Name (Tamil Nadu Engineering Colleges)
          </label>
          <div
            onClick={() => setIsCollegeDropdownOpen(!isCollegeDropdownOpen)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#262626",
              color: college ? "white" : "#9ca3af",
              border: isCollegeDropdownOpen ? "1px solid #38bdf8" : "1px solid #404040",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
              fontSize: "13px"
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "8px" }}>
              {college || "Select or Type College Name..."}
            </span>
            <FaChevronDown style={{ fontSize: "12px", color: "#9ca3af", flexShrink: 0 }} />
          </div>

          {/* DROPDOWN POPUP */}
          {isCollegeDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                background: "#1e1e1e",
                border: "1px solid #404040",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                zIndex: 1000,
                maxHeight: "260px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* SEARCH INPUT */}
              <div style={{ padding: "8px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: "8px", background: "#262626" }}>
                <FaSearch style={{ color: "#9ca3af", fontSize: "13px" }} />
                <input
                  type="text"
                  placeholder="Type college name to filter..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "13px"
                  }}
                />
              </div>

              {/* LIST */}
              <div style={{ overflowY: "auto", maxHeight: "200px" }}>
                {collegeSearch.trim() && (
                  <div
                    onClick={() => {
                      setCollege(collegeSearch.trim());
                      setIsCollegeDropdownOpen(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#38bdf8",
                      cursor: "pointer",
                      borderBottom: "1px solid #2a2a2a",
                      background: "#252525"
                    }}
                  >
                    + Use: "{collegeSearch.trim()}" (Custom College)
                  </div>
                )}

                {filteredColleges.length > 0 ? (
                  filteredColleges.map((col, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCollege(col);
                        setIsCollegeDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 14px",
                        fontSize: "13px",
                        color: college === col ? "#38bdf8" : "#e5e7eb",
                        background: college === col ? "#2a3441" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #262626"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d2d")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = college === col ? "#2a3441" : "transparent")}
                    >
                      <span>{col}</span>
                      {college === col && <FaCheck style={{ color: "#38bdf8", fontSize: "12px" }} />}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "14px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                    No matching colleges found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DEPARTMENT DROPDOWN (ONLY FOR STUDENT - HIDDEN FOR ADMIN AND STAFF) */}
        {isStudent && (
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "#262626",
                color: "white",
                border: "1px solid #404040",
                borderRadius: "10px",
                outline: "none",
                boxSizing: "border-box",
                fontSize: "13px"
              }}
            >
              {ENGINEERING_DEPARTMENTS.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* YEAR DROPDOWN (ONLY FOR STUDENT - HIDDEN FOR ADMIN AND STAFF) */}
        {isStudent && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
              Year of Study
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "#262626",
                color: "white",
                border: "1px solid #404040",
                borderRadius: "10px",
                outline: "none",
                boxSizing: "border-box",
                fontSize: "13px"
              }}
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: (!isStudent) ? "10px" : "0px",
            padding: "14px",
            borderRadius: "30px",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "600",
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "14px",
            color: "#9ca3af",
            cursor: "pointer"
          }}
          onClick={() => navigate("/")}
        >
          Already have an account? <span style={{ color: "#38bdf8", textDecoration: "underline" }}>Login</span>
        </p>
      </div>
    </div>
  );
}
