import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const TN_COLLEGES = [
  "Anna University, Chennai",
  "IIT Madras",
  "NIT Trichy (National Institute of Technology)",
  "VIT (Vellore Institute of Technology)",
  "SRM Institute of Science and Technology",
  "Amrita School of Engineering",
  "PSG College of Technology, Coimbatore",
  "SSN College of Engineering, Chennai",
  "Coimbatore Institute of Technology",
  "Thiagarajar College of Engineering, Madurai",
  "Kumaraguru College of Technology, Coimbatore",
  "Kongu Engineering College, Erode",
  "Bannari Amman Institute of Technology",
  "Sri Venkateswara College of Engineering",
  "Rajalakshmi Engineering College, Chennai",
  "Saveetha Engineering College, Chennai",
  "Sathyabama Institute of Science and Technology",
  "Mepco Schlenk Engineering College, Virudhunagar",
  "Kamaraj College of Engineering and Technology, Madurai",
  "Vel Tech University, Chennai",
  "Government College of Engineering, Salem",
  "Government College of Engineering, Tirunelveli",
  "Government College of Engineering, Srirangam",
  "Karpagam Academy of Higher Education, Coimbatore",
  "Sri Ramakrishna Engineering College, Coimbatore",
  "Velammal Engineering College, Chennai",
  "Panimalar Engineering College, Chennai",
  "Sri Krishna College of Engineering and Technology",
  "KSR College of Engineering, Tiruchengode",
  "SNS College of Technology, Coimbatore",
  "KCG College of Technology, Chennai",
  "Easwari Engineering College, Chennai",
  "St. Joseph's College of Engineering, Chennai",
  "RMK College of Engineering, Chennai",
  "Tagore Engineering College, Chennai",
  "National Engineering College, Kovilpatti",
  "B.S. Abdur Rahman Crescent Institute of S&T",
  "Sethu Institute of Technology, Kariapatti",
  "Kalasalingam Academy of Research and Education",
  "Francis Xavier Engineering College, Tirunelveli",
  "Nandha Engineering College, Erode",
  "Paavai Engineering College, Namakkal",
  "Erode Sengunthar Engineering College",
  "Dr. NGP Institute of Technology, Coimbatore",
  "K.Ramakrishnan College of Engineering, Trichy",
  "Saranathan College of Engineering, Trichy",
  "Sri Eshwar College of Engineering, Coimbatore",
  "Nehru Institute of Technology, Coimbatore",
  "Hindusthan College of Engineering and Technology",
  "Alagappa Chettiar Government College of Engg & Tech",
  "PSN College of Engineering and Technology, Tirunelveli",
  "Agni College of Technology, Chennai",
  "Jerusalem College of Engineering, Chennai",
  "M.A.M. College of Engineering, Trichy",
  "Adhiparasakthi Engineering College",
  "Excel College of Engineering and Technology",
  "Park College of Engineering and Technology, Coimbatore",
  "Other",
];

const TN_SCHOOLS = [
  "St. Bede's Anglo Indian Higher Secondary School, Chennai",
  "Don Bosco Higher Secondary School, Egmore, Chennai",
  "Padma Seshadri Bala Bhavan (PSBB) Senior Secondary School, Chennai",
  "DAV Higher Secondary School, Gopalapuram, Chennai",
  "Vidya Mandir Senior Secondary School, Mylapore, Chennai",
  "St. Patrick's Anglo Indian Higher Secondary School, Chennai",
  "Santhome Higher Secondary School, Chennai",
  "Bhavan's Rajaji Vidyashram, Chennai",
  "Hindu Higher Secondary School, Triplicane, Chennai",
  "Chettinad Vidyashram, Chennai",
  "SBOA School and Junior College, Chennai",
  "St. John's International Residential School, Chennai",
  "St. Joseph's Higher Secondary School, Cuddalore",
  "Stanes Anglo Indian Higher Secondary School, Coimbatore",
  "PSG Sarvajana Higher Secondary School, Coimbatore",
  "Lisieux Matriculation Higher Secondary School, Coimbatore",
  "G.D. Matriculation Higher Secondary School, Coimbatore",
  "Perks Matriculation Higher Secondary School, Coimbatore",
  "Bharatiya Vidya Bhavan Higher Secondary School, Coimbatore",
  "Chinthamani Matriculation School, Coimbatore",
  "TVS Matriculation Higher Secondary School, Madurai",
  "St. Mary's Higher Secondary School, Madurai",
  "Noyes Higher Secondary School, Madurai",
  "Vikaasa World School, Madurai",
  "Campian Higher Secondary School, Trichy",
  "St. Joseph's College Higher Secondary School, Trichy",
  "SRV Higher Secondary School, Samayapuram, Trichy",
  "Vests Matriculation Higher Secondary School, Trichy",
  "Holy Cross Higher Secondary School, Trichy",
  "Little Flower Higher Secondary School, Salem",
  "Holy Angels Higher Secondary School, Salem",
  "Cluny Higher Secondary School, Salem",
  "Montfort Higher Secondary School, Yercaud",
  "Nandha Matriculation Higher Secondary School, Erode",
  "Kongu Vellalar Matriculation Higher Secondary School, Erode",
  "Erode Hindu Kalvi Nilayam Higher Secondary School, Erode",
  "Green Valley Matriculation Higher Secondary School, Erode",
  "Vellalar Higher Secondary School for Girls, Erode",
  "St. Xavier's Higher Secondary School, Palayamkottai, Tirunelveli",
  "Schaffter Higher Secondary School, Tirunelveli",
  "St. John's Higher Secondary School, Palayamkottai",
  "Rose Mary Matriculation Higher Secondary School, Tirunelveli",
  "Desiya Educational Society Higher Secondary School, Namakkal",
  "Green Park Higher Secondary School, Namakkal",
  "Selvam Higher Secondary School, Namakkal",
  "Spectrum Higher Secondary School, Namakkal",
  "Voorhees Higher Secondary School, Vellore",
  "Idhaya Matriculation Higher Secondary School, Vellore",
  "St. Antony's Higher Secondary School, Tanjore",
  "Maxwell Matriculation Higher Secondary School, Tanjore",
  "St. James Higher Secondary School, Palayamkottai",
  "Other"
];

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = (searchParams.get("role") || "student").toLowerCase();

  const [institutionType, setInstitutionType] = useState("college"); // "college" or "school"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(roleParam);
  const [college, setCollege] = useState("");
  const [customCollege, setCustomCollege] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const collegeRef = useRef(null);
  const [department, setDepartment] = useState("CSE");
  const [customDepartment, setCustomDepartment] = useState("");
  const [year, setYear] = useState("3rd Year");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (collegeRef.current && !collegeRef.current.contains(e.target)) {
        setShowCollegeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (roleParam) {
      setRole(roleParam);
    }
  }, [roleParam]);

  const handleSignup = async () => {
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const finalCollege = college === "Other" ? (customCollege.trim() || "Other") : (college || collegeSearch.trim());
    
    let finalDept = department;
    if (institutionType === "school") {
      finalDept = department.startsWith("Class ") ? department : "Class 10";
    } else {
      finalDept = department === "Other" ? (customDepartment.trim() || "Other") : department;
    }
    
    const finalYear = institutionType === "school" ? "" : year;

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/signup`,
        null,
        {
          params: {
            name,
            email,
            password,
            role,
            college: finalCollege,
            department: finalDept,
            year: finalYear,
          },
        }
      );


      if (response.data.status) {
        if (role === "staff") {
          alert("Staff Account Registered Successfully!");
          navigate("/users");
        } else {
          alert("Account Created Successfully! Please login with your credentials.");
          navigate("/");
        }
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
          width: "440px",
          padding: "35px",
          borderRadius: "20px",
          background: "#171717",
          border: "1px solid #2f2f2f",
          boxShadow: "0px 0px 30px rgba(0,0,0,0.6)",
          boxSizing: "border-box"
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <img
            src="/havox-icon.png"
            alt="HavoxAI Logo"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "contain",
              borderRadius: "10px"
            }}
          />
          <span style={{ fontSize: "22px", fontWeight: "700", color: "white", letterSpacing: "0.5px" }}>
            HavoxAI
          </span>
        </div>

        <h2 style={{ textAlign: "center", margin: "0 0 6px 0", fontSize: "20px", color: "white" }}>
          {role === "staff" ? "Add Staff" : "Create Account"}
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

        {/* INSTITUTION TYPE SELECTION (College or School) */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
            Institution Type
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setInstitutionType("college");
                setCollege("");
                setCollegeSearch("");
                setDepartment("CSE");
                setYear("3rd Year");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: institutionType === "college" ? "1px solid #38bdf8" : "1px solid #404040",
                background: institutionType === "college" ? "#1e293b" : "#262626",
                color: institutionType === "college" ? "#38bdf8" : "#9ca3af",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              🎓 College
            </button>

            <button
              type="button"
              onClick={() => {
                setInstitutionType("school");
                setCollege("");
                setCollegeSearch("");
                setDepartment("Class 10");
                setYear("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: institutionType === "school" ? "1px solid #38bdf8" : "1px solid #404040",
                background: institutionType === "school" ? "#1e293b" : "#262626",
                color: institutionType === "school" ? "#38bdf8" : "#9ca3af",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              🏫 School
            </button>
          </div>
        </div>

        {/* COLLEGE / SCHOOL — Searchable Combobox */}
        <div style={{ marginBottom: "12px", position: "relative" }} ref={collegeRef}>
          <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
            {institutionType === "school" ? "Search School" : "Search College"}
          </label>
          <input
            type="text"
            placeholder={institutionType === "school" ? "Search School..." : "Search College..."}
            value={college || collegeSearch}
            onFocus={() => {
              setCollegeSearch(college || "");
              setCollege("");
              setShowCollegeDropdown(true);
            }}
            onChange={(e) => {
              setCollegeSearch(e.target.value);
              setCollege("");
              setShowCollegeDropdown(true);
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#262626",
              color: "white",
              border: "1px solid #404040",
              borderRadius: "10px",
              outline: "none",
              boxSizing: "border-box",
              fontSize: "14px"
            }}
          />
          {showCollegeDropdown && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#1e1e1e",
              border: "1px solid #404040",
              borderRadius: "10px",
              maxHeight: "220px",
              overflowY: "auto",
              zIndex: 999,
              marginTop: "4px"
            }}>
              {(institutionType === "school" ? TN_SCHOOLS : TN_COLLEGES)
                .filter(c => c.toLowerCase().includes((collegeSearch || "").toLowerCase()))
                .map((c, i) => (
                  <div
                    key={i}
                    onMouseDown={() => {
                      setCollege(c);
                      setCollegeSearch("");
                      setShowCollegeDropdown(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "13px",
                      borderBottom: "1px solid #2a2a2a"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {c}
                  </div>
                ))
              }
              {(institutionType === "school" ? TN_SCHOOLS : TN_COLLEGES).filter(c => c.toLowerCase().includes((collegeSearch || "").toLowerCase())).length === 0 && (
                <div
                  onMouseDown={() => {
                    setCollege("Other");
                    setCollegeSearch("");
                    setShowCollegeDropdown(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    color: "#38bdf8",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  + Add Custom {institutionType === "school" ? "School" : "College"} ("Other")
                </div>
              )}
            </div>
          )}
          {college === "Other" && (
            <input
              type="text"
              placeholder={`Enter custom ${institutionType === "school" ? "school" : "college"} name...`}
              value={customCollege}
              onChange={(e) => setCustomCollege(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                marginTop: "8px",
                background: "#262626",
                color: "white",
                border: "1px solid #404040",
                borderRadius: "10px",
                outline: "none",
                boxSizing: "border-box",
                fontSize: "14px"
              }}
            />
          )}
        </div>

        {/* DEPARTMENT / CLASSES — Students only */}
        {role === "student" && (
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
              {institutionType === "school" ? "Classes" : "Department"}
            </label>
            {institutionType === "school" ? (
              <select
                value={department.startsWith("Class ") ? department : "Class 10"}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#262626",
                  color: "white",
                  border: "1px solid #404040",
                  borderRadius: "10px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            ) : (
              <>
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
                    boxSizing: "border-box"
                  }}
                >
                  <option value="CSE">CSE (Computer Science & Engineering)</option>
                  <option value="IT">IT (Information Technology)</option>
                  <option value="ECE">ECE (Electronics & Communication Engineering)</option>
                  <option value="EEE">EEE (Electrical & Electronics Engineering)</option>
                  <option value="MECH">MECH (Mechanical Engineering)</option>
                  <option value="CIVIL">CIVIL (Civil Engineering)</option>
                  <option value="AIDS">AIDS (Artificial Intelligence & Data Science)</option>
                  <option value="AIML">AIML (Artificial Intelligence & Machine Learning)</option>
                  <option value="CHEM">Chemical Engineering</option>
                  <option value="BIO">Bio-Technology</option>
                  <option value="AERO">Aerospace Engineering</option>
                  <option value="AUTO">Automobile Engineering</option>
                  <option value="MARINE">Marine Engineering</option>
                  <option value="PROD">Production Engineering</option>
                  <option value="TEXTILE">Textile Technology</option>
                  <option value="ENV">Environmental Engineering</option>
                  <option value="FOOD">Food Technology</option>
                  <option value="INSTRU">Instrumentation Engineering</option>
                  <option value="INDUSTRIAL">Industrial Engineering</option>
                  <option value="PETRO">Petroleum Engineering</option>
                  <option value="MINING">Mining Engineering</option>
                  <option value="METALLURGY">Metallurgical Engineering</option>
                  <option value="ROBOTICS">Robotics & Automation</option>
                  <option value="CSBS">CSBS (Computer Science & Business Systems)</option>
                  <option value="MCT">MCT (Mechatronics)</option>
                  <option value="Other">Other</option>
                </select>
                {department === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter custom department..."
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      marginTop: "8px",
                      background: "#262626",
                      color: "white",
                      border: "1px solid #404040",
                      borderRadius: "10px",
                      outline: "none",
                      boxSizing: "border-box",
                      fontSize: "14px"
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* YEAR — Students only & College only */}
        {role === "student" && institutionType !== "school" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
              Year
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
                boxSizing: "border-box"
              }}
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        )}

        {/* Spacing for non-students */}
        {role !== "student" && <div style={{ marginBottom: "16px" }} />}

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
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
          {loading ? (role === "staff" ? "Adding Staff..." : "Creating Account...") : (role === "staff" ? "Add Staff" : "Create Account")}
        </button>

        {role !== "staff" && (
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
        )}
      </div>
    </div>
  );
}
