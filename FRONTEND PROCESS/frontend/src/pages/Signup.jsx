import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("3rd Year");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            college,
            department,
            year,
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

        {/* COLLEGE DROPDOWN - Tamil Nadu Engineering Colleges */}
        <div style={{ marginBottom: "12px" }}>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#262626",
              color: college ? "white" : "#9ca3af",
              border: "1px solid #404040",
              borderRadius: "10px",
              outline: "none",
              boxSizing: "border-box"
            }}
          >
            <option value="">-- Select College --</option>
            <option value="Anna University">Anna University, Chennai</option>
            <option value="IIT Madras">IIT Madras</option>
            <option value="NIT Trichy">NIT Trichy (National Institute of Technology)</option>
            <option value="VIT Vellore">VIT (Vellore Institute of Technology)</option>
            <option value="SRM Institute">SRM Institute of Science and Technology</option>
            <option value="Amrita School of Engineering">Amrita School of Engineering</option>
            <option value="PSG College of Technology">PSG College of Technology, Coimbatore</option>
            <option value="SSN College of Engineering">SSN College of Engineering, Chennai</option>
            <option value="Coimbatore Institute of Technology">Coimbatore Institute of Technology</option>
            <option value="Thiagarajar College of Engineering">Thiagarajar College of Engineering, Madurai</option>
            <option value="Kumaraguru College of Technology">Kumaraguru College of Technology, Coimbatore</option>
            <option value="Kongu Engineering College">Kongu Engineering College, Erode</option>
            <option value="Bannari Amman Institute of Technology">Bannari Amman Institute of Technology</option>
            <option value="Sri Venkateswara College of Engineering">Sri Venkateswara College of Engineering</option>
            <option value="Rajalakshmi Engineering College">Rajalakshmi Engineering College, Chennai</option>
            <option value="Saveetha Engineering College">Saveetha Engineering College, Chennai</option>
            <option value="Sathyabama Institute">Sathyabama Institute of Science and Technology</option>
            <option value="Mepco Schlenk Engineering College">Mepco Schlenk Engineering College, Virudhunagar</option>
            <option value="Kamaraj College of Engineering">Kamaraj College of Engineering and Technology, Madurai</option>
            <option value="Vel Tech University">Vel Tech University, Chennai</option>
            <option value="Government College of Engineering Salem">Government College of Engineering, Salem</option>
            <option value="Government College of Engineering Tirunelveli">Government College of Engineering, Tirunelveli</option>
            <option value="Government College of Engineering Srirangam">Government College of Engineering, Srirangam</option>
            <option value="Karpagam Academy">Karpagam Academy of Higher Education, Coimbatore</option>
            <option value="Sri Ramakrishna Engineering College">Sri Ramakrishna Engineering College, Coimbatore</option>
            <option value="Velammal Engineering College">Velammal Engineering College, Chennai</option>
            <option value="Panimalar Engineering College">Panimalar Engineering College, Chennai</option>
            <option value="Sri Krishna College of Engineering">Sri Krishna College of Engineering and Technology</option>
            <option value="KSR College of Engineering">KSR College of Engineering, Tiruchengode</option>
            <option value="SNS College of Technology">SNS College of Technology, Coimbatore</option>
            <option value="KCG College of Technology">KCG College of Technology, Chennai</option>
            <option value="Easwari Engineering College">Easwari Engineering College, Chennai</option>
            <option value="St. Joseph's College of Engineering">St. Joseph's College of Engineering, Chennai</option>
            <option value="RMK College of Engineering">RMK College of Engineering, Chennai</option>
            <option value="Tagore Engineering College">Tagore Engineering College, Chennai</option>
            <option value="National Engineering College">National Engineering College, Kovilpatti</option>
            <option value="B.S. Abdur Rahman Crescent">B.S. Abdur Rahman Crescent Institute of S&T</option>
            <option value="Sethu Institute of Technology">Sethu Institute of Technology, Kariapatti</option>
            <option value="Kalasalingam Academy">Kalasalingam Academy of Research and Education</option>
            <option value="Francis Xavier Engineering College">Francis Xavier Engineering College, Tirunelveli</option>
            <option value="Nandha Engineering College">Nandha Engineering College, Erode</option>
            <option value="Paavai Engineering College">Paavai Engineering College, Namakkal</option>
            <option value="Erode Sengunthar Engineering College">Erode Sengunthar Engineering College</option>
            <option value="Dr. NGP Institute of Technology">Dr. NGP Institute of Technology, Coimbatore</option>
            <option value="K.Ramakrishnan College of Engineering">K.Ramakrishnan College of Engineering, Trichy</option>
            <option value="Saranathan College of Engineering">Saranathan College of Engineering, Trichy</option>
            <option value="Sri Eshwar College of Engineering">Sri Eshwar College of Engineering, Coimbatore</option>
            <option value="Nehru Institute of Technology">Nehru Institute of Technology, Coimbatore</option>
            <option value="Hindusthan College of Engineering">Hindusthan College of Engineering and Technology</option>
            <option value="Alagappa Chettiar Government College">Alagappa Chettiar Government College of Engg & Tech</option>
            <option value="PSN College of Engineering">PSN College of Engineering and Technology, Tirunelveli</option>
            <option value="Agni College of Technology">Agni College of Technology, Chennai</option>
            <option value="Jerusalem College of Engineering">Jerusalem College of Engineering, Chennai</option>
            <option value="M.A.M. College of Engineering">M.A.M. College of Engineering, Trichy</option>
            <option value="Adhiparasakthi Engineering College">Adhiparasakthi Engineering College</option>
            <option value="Excel College of Engineering">Excel College of Engineering and Technology</option>
            <option value="Park College of Engineering">Park College of Engineering and Technology, Coimbatore</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* DEPARTMENT — Students only */}
        {role === "student" && (
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
            </select>
          </div>
        )}

        {/* YEAR — Students only */}
        {role === "student" && (
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
