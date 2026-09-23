import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function Library() {
  const role = (localStorage.getItem("role") || "").toLowerCase().trim();
  const userDept = localStorage.getItem("department") || "CSE";
  const userYr = localStorage.getItem("year") || "3rd Year";

  const isStudent = role === "student";
  const isStaffOrAdmin = role === "admin" || role === "staff";

  const [file, setFile] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [pdfDetails, setPdfDetails] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDept, setUploadDept] = useState("CSE");
  const [uploadYear, setUploadYear] = useState("3rd Year");
  const [customUploadDept, setCustomUploadDept] = useState("");

  const userCollege = localStorage.getItem("college") || "";
  const userEmail = localStorage.getItem("email") || "";

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const params = {};
      if (userCollege) {
        params.college = userCollege;
      }
      if (isStudent) {
        params.department = userDept;
        params.year = userYr;
        params.role = "student";
      }

      const response = await axios.get(`${API_BASE_URL}/pdfs`, { params });

      if (response.data && response.data.details) {
        setPdfDetails(response.data.details);
        setPdfs(response.data.files);
      } else {
        setPdfs(response.data.files || []);
        setPdfDetails((response.data.files || []).map((f) => ({ filename: f, department: "ALL", year: "ALL" })));
      }
    } catch (error) {
      console.error("Fetch PDFs Error:", error);
    }
  };

  const uploadPDF = async () => {
    if (!file) {
      alert("Please select a PDF file first!");
      return;
    }

    const finalDept = uploadDept === "Other" ? (customUploadDept.trim() || "Other") : uploadDept;

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("college", userCollege || "ALL");
    formData.append("department", finalDept);
    formData.append("year", uploadYear);
    formData.append("uploaded_by", userEmail);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data && response.data.status === false) {
        alert(response.data.message || "Failed to upload PDF.");
      } else {
        await fetchPDFs();
        setFile(null);
        setCustomUploadDept("");
        alert(`PDF Uploaded & processed for ${finalDept} - ${uploadYear}!`);
      }
    } catch (error) {
      console.error("PDF UPLOAD ERROR:", error);
      alert("Failed to upload PDF. Please check server connection.");
    } finally {
      setUploading(false);
    }
  };

  const deletePDF = async (filename) => {
    const confirmDelete = window.confirm(`Delete ${filename}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/delete-pdf`, {
        params: { filename }
      });
      fetchPDFs();
    } catch (error) {
      console.error("Delete PDF Error:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#171717",
        color: "white",
        padding: "30px",
        boxSizing: "border-box"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ color: "#3b82f6", margin: "0 0 6px 0", fontSize: "28px" }}>
            📚 PDF Library
          </h1>
          {isStudent && (
            <p style={{ margin: 0, color: "#9ca3af", fontSize: "14px" }}>
              Showing study materials for <strong style={{ color: "#38bdf8" }}>{userDept} — {userYr}</strong>
            </p>
          )}
        </div>
      </div>

      {/* STAFF / ADMIN UPLOAD SECTION */}
      {isStaffOrAdmin && (
        <div
          style={{
            background: "#262626",
            padding: "20px",
            borderRadius: "15px",
            border: "1px solid #333",
            marginBottom: "25px"
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#38bdf8" }}>
            📤 Upload Study Material Document
          </h3>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                Select Department
              </label>
              <select
                value={uploadDept}
                onChange={(e) => setUploadDept(e.target.value)}
                style={{
                  padding: "10px 14px",
                  background: "#171717",
                  color: "white",
                  border: "1px solid #404040",
                  borderRadius: "8px"
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
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Bio-Technology">Bio-Technology</option>
                <option value="Aerospace Engineering">Aerospace Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Marine Engineering">Marine Engineering</option>
                <option value="Production Engineering">Production Engineering</option>
                <option value="Textile Technology">Textile Technology</option>
                <option value="Environmental Engineering">Environmental Engineering</option>
                <option value="Food Technology">Food Technology</option>
                <option value="Instrumentation Engineering">Instrumentation Engineering</option>
                <option value="Industrial Engineering">Industrial Engineering</option>
                <option value="Petroleum Engineering">Petroleum Engineering</option>
                <option value="Mining Engineering">Mining Engineering</option>
                <option value="Metallurgical Engineering">Metallurgical Engineering</option>
                <option value="Robotics & Automation">Robotics & Automation</option>
                <option value="CSBS">CSBS (Computer Science & Business Systems)</option>
                <option value="MCT">MCT (Mechatronics)</option>
                <option value="Other">Other</option>
              </select>
              {uploadDept === "Other" && (
                <input
                  type="text"
                  placeholder="Enter custom department..."
                  value={customUploadDept}
                  onChange={(e) => setCustomUploadDept(e.target.value)}
                  style={{
                    display: "block",
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: "#171717",
                    color: "white",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    fontSize: "13px",
                    width: "220px"
                  }}
                />
              )}
            </div>


            <div>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                Select Year
              </label>
              <select
                value={uploadYear}
                onChange={(e) => setUploadYear(e.target.value)}
                style={{
                  padding: "10px 14px",
                  background: "#171717",
                  color: "white",
                  border: "1px solid #404040",
                  borderRadius: "8px"
                }}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                Select PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ color: "white" }}
              />
            </div>

            <div style={{ marginTop: "18px" }}>
              <button
                onClick={uploadPDF}
                disabled={uploading}
                style={{
                  background: uploading ? "#6b7280" : "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "11px 24px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: uploading ? "not-allowed" : "pointer"
                }}
              >
                {uploading ? "Uploading & Processing..." : "Upload Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT LIST */}
      <div
        style={{
          background: "#262626",
          borderRadius: "15px",
          padding: "20px",
          border: "1px solid #333"
        }}
      >
        <h2 style={{ color: "#3b82f6", marginBottom: "20px", fontSize: "18px" }}>
          Uploaded Study Materials
        </h2>

        {pdfDetails.length > 0 ? (
          pdfDetails.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#171717",
                border: "1px solid #333",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "24px" }}>📄</span>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "white" }}>
                    {item.filename}
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <span
                      style={{
                        background: "#1e3a8a",
                        color: "#93c5fd",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "500"
                      }}
                    >
                      {item.department || "ALL"}
                    </span>
                    <span
                      style={{
                        background: "#065f46",
                        color: "#6ee7b7",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "500"
                      }}
                    >
                      {item.year || "ALL"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => window.open(`${API_BASE_URL}/view-pdf/${item.filename}`, "_blank")}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "13px"
                  }}
                >
                  View PDF
                </button>

                {isStaffOrAdmin && (
                  <button
                    onClick={() => deletePDF(item.filename)}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "13px"
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
            No study material documents available for this selection.
          </div>
        )}
      </div>
    </div>
  );
}
