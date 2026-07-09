import React, { useState, useEffect, useRef } from "react";
import { Button, Divider, Input, Typography, Form } from "antd";
import type { InputRef } from "antd";
import { FacebookFilled } from "@ant-design/icons";

import "./Login.css";

const { Title, Text } = Typography;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type ToastType = "error" | "success" | "info" | "warning";

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface LoginFormValues {
  identifier: string;
}

// ─────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────

// Valid email: characters before @, a domain, and a TLD (e.g. user@example.com)
const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

// Valid phone: exactly 10 digits (no spaces, no country code)
const isValidPhone = (value: string): boolean => /^\d{10}$/.test(value.trim());

// Returns a human-readable error string, or null if the value is valid
const getIdentifierError = (value: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Please enter your Email ID or Mobile Number.";
  }

  // Pure digit input → treat as phone number
  if (/^\d+$/.test(trimmed)) {
    if (!isValidPhone(trimmed)) {
      return `Mobile number must be exactly 10 digits. You entered ${trimmed.length}.`;
    }
    return null; // valid phone
  }

  // Otherwise treat as email
  if (!isValidEmail(trimmed)) {
    if (!trimmed.includes("@")) {
      return "Email must contain '@'. Example: name@example.com";
    }
    const domain = trimmed.split("@")[1] ?? "";
    if (!domain.includes(".")) {
      return "Email domain is incomplete. Example: name@example.com";
    }
    return "Please enter a valid Email ID. Example: name@example.com";
  }

  return null; // valid email
};

// ─────────────────────────────────────────────────────────────
// TOAST CONFIG
// Each type gets a title, accent colour, icon background, and icon.
// ─────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  { title: string; accent: string; iconBg: string; icon: React.ReactNode }
> = {
  error: {
    title: "Something went wrong",
    accent: "#e53935",
    iconBg: "#fdecea",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#e53935"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="0.8" fill="#e53935" stroke="none" />
      </svg>
    ),
  },
  success: {
    title: "Success",
    accent: "#2e7d32",
    iconBg: "#e8f5e9",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2e7d32"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  info: {
    title: "Information",
    accent: "#1a73e8",
    iconBg: "#e8f0fe",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a73e8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <circle cx="12" cy="8" r="0.8" fill="#1a73e8" stroke="none" />
      </svg>
    ),
  },
  warning: {
    title: "Warning",
    accent: "#f59e0b",
    iconBg: "#fffbeb",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d97706"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.8" fill="#d97706" stroke="none" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────
// TOAST COMPONENT
// Shows a notification in the top-right corner.
// Auto-dismisses after 4 s.
//
// WHY no useState/setInterval for the progress bar:
//   The ESLint rule "react-hooks/set-state-in-effect" forbids calling
//   setState inside a useEffect body. Instead, the shrinking bar is
//   driven entirely by the CSS keyframe `toast-progress` (Login.css).
//   Because the parent passes key={`${type}-${message}`}, React
//   remounts this element on every new toast, which automatically
//   restarts the CSS animation — no JS timer or state needed at all.
// ─────────────────────────────────────────────────────────────

const Toast: React.FC<ToastState & { onClose: () => void }> = ({
  visible,
  message,
  type,
  onClose,
}) => {
  const config = TOAST_CONFIG[type];

  // Only effect: keep track of mobile viewport for top position.
  // This is a legitimate external-system sync (window size) — no
  // cascading render issue because it only fires on actual resize events.
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: isMobile ? "70px" : "16px",
        right: "16px",
        zIndex: 9999,
        width: "370px",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
        border: "1px solid #ebebeb",
        overflow: "hidden",
        // Slide in / out animation
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(-10px) scale(0.96)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition:
          "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
      }}
    >
      {/* Coloured left border */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: config.accent,
        }}
      />

      {/* Main content row: icon + text + close button */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "9px",
          padding: "10px 10px 13px 14px",
        }}
      >
        {/* Icon box */}
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "6px",
            background: config.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {config.icon}
        </div>

        {/* Title + message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 600,
              color: "#1a1a2e",
              lineHeight: "1.3",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {config.title}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: "11.5px",
              color: "#5f6368",
              lineHeight: "1.5",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {message}
          </p>
        </div>

        {/* Close (×) button */}
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b0b4b9",
            borderRadius: "4px",
            flexShrink: 0,
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1a1a2e";
            e.currentTarget.style.background = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#b0b4b9";
            e.currentTarget.style.background = "none";
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/*
        Progress bar — pure CSS animation, zero JS state.
        `toast-progress` keyframe in Login.css: scaleX(1) → scaleX(0) over 4 s.
        The `key` prop on <Toast> causes a remount on each new toast,
        which restarts this animation from scratch automatically.
      */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "#f0f0f0",
        }}
      >
        <div
          style={{
            height: "100%",
            background: config.accent,
            opacity: 0.5,
            transformOrigin: "left center",
            animation: visible ? "toast-progress 4s linear forwards" : "none",
          }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SMALL REUSABLE ICONS
// ─────────────────────────────────────────────────────────────

// Google multicolour logo
const GoogleIcon: React.FC = () => (
  <svg
    className="google-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"
    />
    <path
      fill="#FBBC05"
      d="M10.7 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.2.7-4.6l-7-5.4A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l7.5-5.8-.3-.4z"
    />
    <path
      fill="#34A853"
      d="M24 47c6.5 0 11.9-2.1 15.8-5.8l-7.4-5.7c-2.1 1.4-4.7 2.2-8.4 2.2-6.3 0-11.6-4.3-13.5-10.1l-7.5 5.8C7 41.3 14.8 47 24 47z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

// Petpooja Payroll logo mark (white rectangles on blue background)
const LogoIcon: React.FC = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="4"
      width="10"
      height="12"
      rx="2"
      fill="white"
      fillOpacity="0.9"
    />
    <rect
      x="14"
      y="4"
      width="10"
      height="5"
      rx="2"
      fill="white"
      fillOpacity="0.65"
    />
    <rect
      x="14"
      y="11"
      width="10"
      height="5"
      rx="2"
      fill="white"
      fillOpacity="0.65"
    />
    <rect
      x="2"
      y="18"
      width="22"
      height="4"
      rx="2"
      fill="white"
      fillOpacity="0.5"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// MAIN LOGIN PAGE
// Two steps:
//   Step 1 — user enters email or phone → clicks Next
//             • Valid email:  must have @, a domain, and a TLD
//             • Valid phone:  exactly 10 digits
//             • On failure:   red border + inline message + toast
//   Step 2 — user enters OTP → clicks Verify
// ─────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"IDENTIFIER" | "OTP">("IDENTIFIER");
  const [otp, setOtp] = useState("");
  const [identifierValue, setIdentifierValue] = useState(""); // controlled input value
  const [identifierError, setIdentifierError] = useState<string | null>(null); // null = no error
  const [form] = Form.useForm<LoginFormValues>();
  const identifierRef = useRef<InputRef>(null);
  const otpRef = useRef<InputRef>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (step === "IDENTIFIER") {
      setTimeout(() => {
        identifierRef.current?.focus();
      }, 0);
    } else if (step === "OTP") {
      setTimeout(() => {
        otpRef.current?.focus();
      }, 0);
    }
  }, [step]);

  // Toast state — one toast at a time
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "error",
  });

  // Show a toast and auto-hide it after 4 seconds (matches CSS animation duration)
  const showToast = (message: string, type: ToastType = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
  };

  // Manually close the toast
  const closeToast = () => setToast((prev) => ({ ...prev, visible: false }));

  // Clear red border as soon as the user starts typing again
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifierValue(e.target.value);
    if (identifierError) setIdentifierError(null);
  };

  // Also validate when the user tabs out of the field
  const handleIdentifierBlur = () => {
    if (identifierValue) {
      const error = getIdentifierError(identifierValue);
      if (error) setIdentifierError(error);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // allow only numbers

    if (value.length > 6) return; // stop >6 digits

    setOtp(value);

    if (otpError) setOtpError(null); // remove red border while typing
  };

  // Step 1 — validate; show red border + toast if invalid, else go to OTP
  const handleNext = async () => {
    const error = getIdentifierError(identifierValue);

    if (error) {
      setIdentifierError(error);
      showToast(error, "error");

      // 👇 bring cursor back
      setTimeout(() => {
        identifierRef.current?.focus();
      }, 0);

      return;
    }

    // Input is valid → call API and advance to OTP step
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800)); // simulated API call
      setIdentifierError(null);
      setStep("OTP");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP (basic length check)
  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      const error = "Please enter a valid OTP.";

      setOtpError(error); // ✅ ADD THIS
      showToast(error, "error");

      // ✅ bring cursor back (blink again)
      setTimeout(() => {
        otpRef.current?.focus();
      }, 0);

      return;
    }

    showToast("Login Successful!", "success");
  };

  const handleOtpBlur = () => {
    if (otp && otp.length < 4) {
      setOtpError("OTP must be at least 4 digits.");
    }
  };

  // Google sign-in (placeholder)
  const handleGoogleSignIn = () => {
    showToast("Google Sign-In coming soon!", "info");
  };

  // Go back to step 1 and reset all related state
  const handleChangeIdentifier = () => {
    setStep("IDENTIFIER");
    setOtp("");
    setIdentifierError(null);
  };

  return (
    <div className="login-page">
      {/*
        key prop forces a full remount on every new toast message.
        This restarts the CSS progress-bar animation from scratch each time.
      */}
      <Toast
        key={`${toast.type}-${toast.message}`}
        {...toast}
        onClose={closeToast}
      />

      {/* ── Top logo bar ── */}
      <header className="login-header">
        <a href="/" className="login-logo">
          <div className="login-logo-icon">
            <LogoIcon />
          </div>
          <div className="login-logo-text">
            <span className="login-logo-brand">Petpooja</span>
            <span className="login-logo-product">PAYROLL</span>
          </div>
        </a>
      </header>

      <main className="login-main">
        {/* ── Left side: illustration + welcome text ── */}
        <section className="login-left">
          <div className="login-illustration-wrapper">
            <img src="/Images/Login/login.png" alt="Welcome illustration" />
          </div>
          <div className="login-welcome-text">
            <Title level={2} className="login-welcome-title">
              Welcome!
            </Title>
            <Text className="login-welcome-subtitle">
              Managing Employee activities &amp; attendance made simple with
              Petpooja
            </Text>
          </div>
        </section>

        {/* ── Right side: login card ── */}
        <section className="login-right">
          <div className="login-card">
            {/* Thin decorative top bar */}

            <Title level={3} className="login-card-title">
              Login to Dashboard
            </Title>
            <Text className="login-card-subtitle">
              Hello there, Let&apos;s get started.
            </Text>

            <Form
              form={form}
              onFinish={step === "IDENTIFIER" ? handleNext : handleVerifyOtp}
            >
              {/* ── Step 1: Email / Phone input ── */}
              {step === "IDENTIFIER" && (
                <>
                  <Form.Item style={{ marginBottom: identifierError ? 6 : 20 }}>
                    <label className="login-form-label">
                      Email ID Or Mobile Number
                    </label>

                    {/* login-input--error adds red border via Login.css */}
                    <Input
                      ref={identifierRef}
                      className={`login-input ${identifierError ? "login-input--error" : ""}`}
                      placeholder="Enter Email ID Or Mobile Number"
                      size="large"
                      value={identifierValue}
                      onChange={handleIdentifierChange}
                      onBlur={handleIdentifierBlur}
                    />
                  </Form.Item>

                  {/* Inline error message shown below the field */}
                  {/* {identifierError && (
                    <div className="login-field-error">{identifierError}</div>
                  )} */}

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-btn-next"
                    loading={loading}
                    block
                    style={{ marginTop: identifierError ? 14 : 0 }}
                  >
                    Next
                  </Button>
                </>
              )}

              {/* ── Step 2: OTP input ── */}
              {step === "OTP" && (
                <>
                  <Form.Item style={{ marginBottom: 20 }}>
                    <label className="login-form-label">Enter OTP</label>
                    <Input
                      ref={otpRef}
                      className={`login-input ${otpError ? "login-input--error" : ""}`}
                      placeholder="Enter 4–6 digit OTP"
                      size="large"
                      value={otp}
                      onChange={handleOtpChange}
                      onBlur={handleOtpBlur} // ✅ ADD THIS
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-btn-next"
                    block
                  >
                    Verify
                  </Button>

                  {/* Go back to change email / phone */}
                  <div style={{ marginTop: 10, textAlign: "center" }}>
                    <span
                      className="login-link"
                      style={{ cursor: "pointer" }}
                      onClick={handleChangeIdentifier}
                    >
                      Change Email / Phone
                    </span>
                  </div>
                </>
              )}
            </Form>

            <Divider className="login-divider">Or</Divider>

            {/* Google sign-in button */}
           <div className="social-login-buttons">
  {/* Google Button */}
  <Button
    className="login-btn-google"
    onClick={handleGoogleSignIn}
    icon={<GoogleIcon />}
  >
    Google
  </Button>

  {/* Facebook Button */}
  <Button
    className="login-btn-facebook"

    icon={<FacebookFilled />}
  >
    Facebook
  </Button>
</div>

            {/* Terms & Privacy links */}
            <div className="login-card-footer">
              <a href="/terms" className="login-link">
                Terms &amp; Condition
              </a>
              <span className="login-link-sep">|</span>
              <a href="/privacy" className="login-link">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Help link below the card */}
          <div className="login-help">
            Need Help?{" "}
            <a href="/contact" className="login-help-link">
              Contact Us
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
