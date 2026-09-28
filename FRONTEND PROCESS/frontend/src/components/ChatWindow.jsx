import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Character-by-character typewriter effect for streaming messages
function TypewriterText({ text, streaming }) {
  const [displayed, setDisplayed] = useState("");
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const lastTextRef = useRef("");

  useEffect(() => {
    if (!streaming) {
      // Streaming done — show full text immediately
      setDisplayed(text || "");
      queueRef.current = [];
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      lastTextRef.current = text || "";
      return;
    }

    // Queue any new characters that arrived
    if (text && text.length > lastTextRef.current.length) {
      const newChars = text.slice(lastTextRef.current.length).split("");
      queueRef.current.push(...newChars);
      lastTextRef.current = text;
    }

    // Start interval if not already running
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        if (queueRef.current.length > 0) {
          const batch = queueRef.current.splice(0, 3); // 3 chars at a time = smooth typing
          setDisplayed(prev => prev + batch.join(""));
        } else {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 12); // 12ms per tick ≈ 250 chars/sec
    }
  }, [text, streaming]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return <>{displayed}</>;
}

const formatMathText = (text) => {
  if (!text || !text.trim()) return "";
  let formatted = text;

  // 1. Defensive check: strip any residual raw SSE protocol string if unparsed
  formatted = formatted.replace(/^event:\s*\w+\s*\n+data:\s*\{.*?\}/gis, "");
  formatted = formatted.replace(/(?:\n|^)data:\s*\{.*?\}/gis, "");
  formatted = formatted.replace(/^event:.*$/gm, "");

  // 2. Strip code block wrappers like ```plaintext or ```
  formatted = formatted.replace(/```\s*plaintext\s*/gi, "");
  formatted = formatted.replace(/```\s*/g, "");

  // 3. Deduplicate any repeated ### Example headings
  formatted = formatted.replace(/(?:\n*\s*###?\s*(?:Example|[A-Za-z0-9_\s]*Example):?\s*)+/gi, "\n\n### Example\n");

  // 4. Remove raw LaTeX bracket delimiters \( \), \[ \], \\( \\), \\[ \\]
  formatted = formatted.replace(/\\\[\s*/g, "").replace(/\s*\\\]/g, "");
  formatted = formatted.replace(/\\\(\s*/g, "").replace(/\s*\\\)/g, "");
  formatted = formatted.replace(/\\\[/g, "").replace(/\\\]/g, "");
  formatted = formatted.replace(/\\\(/g, "").replace(/\\\)/g, "");
  formatted = formatted.replace(/\[\s*\]/g, "");
  formatted = formatted.replace(/\\left\s*/gi, "");
  formatted = formatted.replace(/\\right\s*/gi, "");
  formatted = formatted.replace(/\\quad|\\qquad|\\;|\\,|\\:/g, " ");

  // Remove lines that consist only of leftover brackets, slashes or whitespace
  formatted = formatted.split("\n").filter(line => !/^\s*[\\[\\]()\/]+\s*$/.test(line)).join("\n");

  // 5. Convert square root variations FIRST (curly braces, round brackets, bare numbers)
  formatted = formatted.replace(/\\?sqrt\{([^}]+)\}/gi, "√($1)");
  formatted = formatted.replace(/\\?sqrt\(([^)]+)\)/gi, "√($1)");
  formatted = formatted.replace(/\\?sqrt\s*([a-zA-Z0-9]+)/gi, "√$1");

  // 6. Convert fraction variations (with/without backslash, curly/round/mixed brackets)
  formatted = formatted.replace(/\\?frac\{([^}]+)\}\{([^}]+)\}/gi, "$1/$2");
  formatted = formatted.replace(/\\?frac\{([^}]+)\}\(([^)]+)\)/gi, "$1/$2");
  formatted = formatted.replace(/\\?frac\(([^)]+)\)\{([^}]+)\}/gi, "$1/$2");
  formatted = formatted.replace(/\\?frac\(([^)]+)\)\(([^)]+)\)/gi, "$1/$2");
  formatted = formatted.replace(/\\?frac\{([^}]+)\}\s*([0-9a-zA-Z]+)/gi, "$1/$2");

  // 7. Convert function superscripts, text wrappers & subscripts
  formatted = formatted.replace(/\\text\{([^}]+)\}/g, "$1");
  formatted = formatted.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  formatted = formatted.replace(/f\^\{-1\}/gi, "f⁻¹");
  formatted = formatted.replace(/f\^-1/gi, "f⁻¹");

  // 8. Convert comprehensive set theory, calculus, logic & algebraic symbols to Unicode safely using negative lookaheads (?![a-zA-Z])
  formatted = formatted
    .replace(/\\cap(?![a-zA-Z])/g, "∩")
    .replace(/\\cup(?![a-zA-Z])/g, "∪")
    .replace(/\\in(?![a-zA-Z])/g, "∈")
    .replace(/\\notin(?![a-zA-Z])/g, "∉")
    .replace(/\\subset(?![a-zA-Z])/g, "⊂")
    .replace(/\\subseteq(?![a-zA-Z])/g, "⊆")
    .replace(/\\forall(?![a-zA-Z])/g, "∀")
    .replace(/\\exists(?![a-zA-Z])/g, "∃")
    .replace(/\\emptyset(?![a-zA-Z])|\\empty(?![a-zA-Z])/g, "∅")
    .replace(/\\approx(?![a-zA-Z])/g, "≈")
    .replace(/\\pm(?![a-zA-Z])/g, "±")
    .replace(/\\mp(?![a-zA-Z])/g, "∓")
    .replace(/\\infty(?![a-zA-Z])/g, "∞")
    .replace(/\\mathbb\{R\}/g, "ℝ")
    .replace(/\\mathbb\{N\}/g, "ℕ")
    .replace(/\\mathbb\{Z\}/g, "ℤ")
    .replace(/\\mathbb\{Q\}/g, "ℚ")
    .replace(/\\cdot(?![a-zA-Z])/g, "·")
    .replace(/\\times(?![a-zA-Z])/g, "×")
    .replace(/\\div(?![a-zA-Z])/g, "÷")
    .replace(/\\geq(?![a-zA-Z])/g, "≥")
    .replace(/\\leq(?![a-zA-Z])/g, "≤")
    .replace(/\\ge(?![a-zA-Z])/g, "≥")
    .replace(/\\le(?![a-zA-Z])/g, "≤")
    .replace(/\\neq(?![a-zA-Z])/g, "≠")
    .replace(/\\implies(?![a-zA-Z])/g, " ⇒ ")
    .replace(/\\impliedby(?![a-zA-Z])/g, " ⇐ ")
    .replace(/\\therefore(?![a-zA-Z])/g, "\n\n∴ Therefore, ")
    .replace(/\\because(?![a-zA-Z])/g, " ∵ ")
    .replace(/\\to(?![a-zA-Z])|\\rightarrow(?![a-zA-Z])/g, "→")
    .replace(/\\Rightarrow(?![a-zA-Z])/g, "⇒")
    .replace(/\\Leftrightarrow(?![a-zA-Z])/g, "⇔")
    .replace(/\\alpha(?![a-zA-Z])/g, "α")
    .replace(/\\beta(?![a-zA-Z])/g, "β")
    .replace(/\\gamma(?![a-zA-Z])/g, "γ")
    .replace(/\\delta(?![a-zA-Z])/g, "δ")
    .replace(/\\theta(?![a-zA-Z])/g, "θ")
    .replace(/\\lambda(?![a-zA-Z])/g, "λ")
    .replace(/\\mu(?![a-zA-Z])/g, "μ")
    .replace(/\\pi(?![a-zA-Z])/g, "π")
    .replace(/\\sigma(?![a-zA-Z])/g, "σ")
    .replace(/\\sum(?![a-zA-Z])/g, "∑")
    .replace(/\\prod(?![a-zA-Z])/g, "∏")
    .replace(/\\int(?![a-zA-Z])/g, "∫")
    .replace(/\\arcsin(?![a-zA-Z])/g, "arcsin")
    .replace(/\\arccos(?![a-zA-Z])/g, "arccos")
    .replace(/\\arctan(?![a-zA-Z])/g, "arctan")
    .replace(/\\sin(?![a-zA-Z])/g, "sin")
    .replace(/\\cos(?![a-zA-Z])/g, "cos")
    .replace(/\\tan(?![a-zA-Z])/g, "tan")
    .replace(/\\sec(?![a-zA-Z])/g, "sec")
    .replace(/\\csc(?![a-zA-Z])/g, "csc")
    .replace(/\\cot(?![a-zA-Z])/g, "cot")
    .replace(/\\ln(?![a-zA-Z])/g, "ln")
    .replace(/\\log(?![a-zA-Z])/g, "log")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^4/g, "⁴")
    .replace(/\^n/g, "ⁿ");

  // 9. Strip any remaining stray backslashes before English words (e.g. \we -> we, \with -> with)
  formatted = formatted.replace(/\\([a-zA-Z]{2,})/g, "$1");
  formatted = formatted.replace(/\s*\\\s*/g, " ");

  // 10. Force step headings and Example onto separate lines with clean spacing
  formatted = formatted.replace(/([^\n])\s*(###?\s*Step|\bStep\s+\d+:)/g, "$1\n\n$2");
  formatted = formatted.replace(/([^\n])\s*(###?\s*Final Answer:|\bFinal Answer:)/g, "$1\n\n$2");

  // Clean up any extra empty lines (max 2 consecutive newlines)
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  return formatted.trim();
};

export default function ChatWindow({ messages, userMessageRefs }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [copied, setCopied] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const copyMessage = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const reportAnswer = async (question, answer) => {
    try {
      const reported_by = localStorage.getItem("email");
      const response = await axios.post(`${API_BASE_URL}/feedback`, null, {
        params: {
          question,
          answer,
          feedback: "Incorrect Answer",
          reported_by
        }
      });
      setFeedbackSaved(true);
      setTimeout(() => setFeedbackSaved(false), 2000);
    } catch (error) {
      console.error("FEEDBACK ERROR:", error);
      alert("Feedback Failed");
    }
  };

  if (!messages || messages.length === 0) {
    const rawName = localStorage.getItem("name") || localStorage.getItem("email") || "User";
    let formattedName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
    // Format name to clean Title Case (e.g. TAMIZHX -> Tamizhx)
    formattedName = formattedName
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          color: "white",
          textAlign: "center",
          padding: "40px 20px",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {/* Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Logo Frame */}
          <div style={{ marginBottom: "24px", padding: "10px 20px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/havox-icon.png"
              alt="HavoxAI"
              style={{
                height: "55px",
                width: "55px",
                objectFit: "contain",
                borderRadius: "12px",
                display: "block"
              }}
            />
            <span style={{ color: "white", fontSize: "24px", fontWeight: "700", letterSpacing: "1px" }}>HavoxAI</span>
          </div>

          {/* Premium Gradient Title */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              letterSpacing: "-0.8px",
              marginBottom: "14px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
          >
            <span style={{ color: "#f8fafc" }}>Welcome, </span>
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              {formattedName}
            </span>{" "}
            <span style={{ fontSize: "32px" }}>👋</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "#94a3b8",
              fontSize: "15px",
              fontWeight: "400",
              maxWidth: "520px",
              lineHeight: "1.7",
              margin: "0 0 32px 0",
              letterSpacing: "0.2px"
            }}
          >
            What would you like to study or ask about today? Type any question below to get instant answers from your uploaded study materials.
          </p>

          {/* Feature Badge Cards */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: "600px"
            }}
          >
            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(4px)"
              }}
            >
              <span>⚡</span> <span>Instant RAG Streaming</span>
            </div>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(4px)"
              }}
            >
              <span>📄</span> <span>Grounded Study Materials</span>
            </div>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(4px)"
              }}
            >
              <span>📐</span> <span>Math & Logic Solutions</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "30px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {copied && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2f2f2f",
            color: "white",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid #444",
            zIndex: 9999,
            fontSize: "14px",
          }}
        >
          ✓ Copied
        </div>
      )}

      {feedbackSaved && (
        <div
          style={{
            position: "fixed",
            bottom: "150px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2f2f2f",
            color: "white",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid #444",
            zIndex: 9999,
            fontSize: "14px",
          }}
        >
          ✓ Feedback Saved
        </div>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          ref={(el) => {
            if (userMessageRefs && userMessageRefs.current) {
              userMessageRefs.current[index] = el;
            }
          }}
          style={{
            marginBottom: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: msg.sender === "User" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              marginBottom: "6px",
            }}
          >
            {msg.sender === "User" ? "You" : "HavoxAI"}
          </div>

          <div
            style={{
              background: msg.sender === "User" ? "#303030" : "transparent",
              padding: msg.sender === "User" ? "14px 18px" : "0px",
              borderRadius: msg.sender === "User" ? "20px" : "0px",
              maxWidth: "95%",
              color: "white",
              fontSize: "15px",
              lineHeight: "1.8",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              position: "relative",
            }}
          >
            {msg.sender === "AI" ? (
              <>
                {/* 1. Typo Correction Indicator - displayed ONLY when correctedQuery or displayNote exists */}
                {(msg.displayNote || msg.correctedQuery) && (
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: "10px",
                      padding: "4px 10px",
                      background: "#1e293b",
                      color: "#38bdf8",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "500",
                      border: "1px solid #0284c7"
                    }}
                  >
                    🔍 {msg.displayNote || `Searching for: ${msg.correctedQuery}`}
                  </div>
                )}

                {/* 2. Streaming Status Indicator */}
                {msg.streaming && msg.status && (
                  <div
                    style={{
                      color: "#38bdf8",
                      fontStyle: "italic",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px"
                    }}
                  >
                    <span style={{ animation: "spin 1s linear infinite" }}>⚡</span>
                    {msg.statusText || "Searching uploaded study materials…"}
                  </div>
                )}

                {/* 3. Refusal Card or Clean Answer Text */}
                {msg.confidence === "refused" ? (
                  <div
                    style={{
                      background: "#262626",
                      borderLeft: "4px solid #ef4444",
                      padding: "16px",
                      borderRadius: "8px",
                      marginTop: "6px",
                      color: "#f3f4f6"
                    }}
                  >
                    <div style={{ fontWeight: "600", color: "#f87171", marginBottom: "4px" }}>
                      Document Restricted Response
                    </div>
                    {msg.text || "I can answer only from the uploaded study materials. I could not find enough relevant information in the available documents for this question."}
                  </div>
                ) : (
                  (msg.text || (msg.streaming && !msg.status)) && (
                    <>
                      {msg.streaming
                        ? <TypewriterText text={formatMathText(msg.text)} streaming={msg.streaming} />
                        : formatMathText(msg.text)
                      }
                      {msg.streaming && !msg.status && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "8px",
                            height: "15px",
                            marginLeft: "4px",
                            backgroundColor: "#38bdf8",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                            animation: "blink 1s step-end infinite"
                          }}
                        />
                      )}
                    </>
                  )
                )}

                {/* 4. Expandable Sources Card - displayed ONLY after final response completes (streaming === false && status === false) */}
                {!msg.streaming && !msg.status && msg.sources && msg.sources.length > 0 && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 14px",
                      background: "#1e1e1e",
                      borderRadius: "10px",
                      border: "1px solid #333"
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "13px", color: "#38bdf8", marginBottom: "8px" }}>
                      Sources ({msg.sources.length})
                    </div>
                    {msg.sources.map((s, sIdx) => (
                      <details key={sIdx} style={{ marginBottom: "6px", fontSize: "13px", color: "#d1d5db" }}>
                        <summary style={{ cursor: "pointer", fontWeight: "500" }}>
                          • {s.document} — Page {s.page}
                        </summary>
                        {s.snippet && (
                          <div style={{ marginTop: "4px", padding: "6px 10px", background: "#111111", borderRadius: "6px", fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                            "{s.snippet}"
                          </div>
                        )}
                      </details>
                    ))}
                  </div>
                )}
              </>
            ) : (
              msg.text
            )}

            {/* Menu options for AI answers */}
            {msg.sender === "AI" && msg.text && !msg.status && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "10px",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => copyMessage(msg.text)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  title="Copy response"
                >
                  ⧉
                </button>

                <button
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ⋮
                </button>

                {openMenu === index && (
                  <div
                    style={{
                      background: "#2f2f2f",
                      border: "1px solid #444",
                      borderRadius: "10px",
                      padding: "8px",
                    }}
                  >
                    <div
                      onClick={() =>
                        reportAnswer(
                          index > 0 ? messages[index - 1]?.text : "",
                          msg.text
                        )
                      }
                      style={{
                        cursor: "pointer",
                        color: "#ef4444",
                        fontSize: "14px",
                      }}
                    >
                      Report Incorrect Answer
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
