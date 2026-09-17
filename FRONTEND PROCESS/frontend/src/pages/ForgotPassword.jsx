import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {

    if (!email) {

      alert(
        "Enter Email"
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await axios.post(
          `${API_BASE_URL}/forgot-password`,
          null,
          {
            params: {
              email
            }
          }
        );

      if (
        response.data.status
      ) {

        alert(
          "OTP Sent Successfully"
        );

        navigate(
          "/reset-password",
          {
            state: {
              email
            }
          }
        );

      } else {

        alert(
          response.data.message
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        "Failed To Send OTP"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#212121",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "30px",
          background: "#2a2a2a",
          borderRadius: "15px",
        }}
      >
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
              width: "60px",
              height: "60px",
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
              letterSpacing: "-0.5px"
            }}
          >
            HavoxAI
          </span>
        </div>

        <h2
          style={{
            textAlign: "center",
            marginTop: "0",
            marginBottom: "15px",
            fontSize: "18px"
          }}
        >
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            boxSizing:
              "border-box",
          }}
        />

        <button
          onClick={
            handleSubmit
          }
          disabled={
            loading
          }
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          {
            loading
              ? "Sending OTP..."
              : "Send OTP"
          }
        </button>

      </div>
    </div>
  );
}
