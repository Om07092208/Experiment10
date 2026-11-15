import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import PulseLogo from "../assets/pulse-logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";
import { FiUser, FiMail, FiLock, FiCheckCircle, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";

const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  const checkAuth = useCallback(() => {
    if (localStorage.getItem(storageKey)) {
      navigate("/");
    }
  }, [navigate, storageKey]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;

    if (!username.trim()) {
      toast.error("Username is required.", toastOptions);
      return false;
    }
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters long.", toastOptions);
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required.", toastOptions);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.", toastOptions);
      return false;
    }
    if (!password) {
      toast.error("Password is required.", toastOptions);
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.", toastOptions);
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirm password must match.", toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      setIsSubmitting(true);
      try {
        const { email, username, password } = values;
        const { data } = await axios.post(registerRoute, {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (data.status === false) {
          toast.error(data.msg || "Registration failed.", toastOptions);
        } else if (data.status === true) {
          localStorage.setItem(storageKey, JSON.stringify(data.user));
          toast.success("Account created successfully! Let's choose your avatar.", toastOptions);
          navigate("/setAvatar");
        }
      } catch (err) {
        toast.error(
          err.response?.data?.msg || "Unable to reach server. Please ensure the backend is running.",
          toastOptions
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <AuthWrapper>
        <div className="card-glow"></div>
        <CardContainer>
          <div className="brand-header">
            <div className="logo-wrapper">
              <img src={PulseLogo} alt="PulseChat Logo" />
              <div className="pulse-indicator"></div>
            </div>
            <h1>Pulse<span>Chat</span></h1>
            <p className="lab-tag">Create Your Workspace Profile</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <span className="icon"><FiUser /></span>
              <input
                type="text"
                placeholder="Username (min 3 chars)"
                name="username"
                value={values.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="input-group">
              <span className="icon"><FiMail /></span>
              <input
                type="email"
                placeholder="Email address"
                name="email"
                value={values.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            <div className="input-group">
              <span className="icon"><FiLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                name="password"
                value={values.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="input-group">
              <span className="icon"><FiCheckCircle /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <FiUserPlus />
                  <span>Register Account</span>
                </>
              )}
            </button>

            <div className="footer-links">
              <span>Already registered?</span>
              <Link to="/login">Sign in here</Link>
            </div>
          </form>
        </CardContainer>
      </AuthWrapper>
      <ToastContainer />
    </>
  );
}

const AuthWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: var(--bg-primary);
  padding: 1.5rem;
  overflow: hidden;

  .card-glow {
    position: absolute;
    width: 440px;
    height: 440px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.1) 60%, transparent 80%);
    filter: blur(55px);
    z-index: 0;
    pointer-events: none;
  }
`;

const CardContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2.5rem 2.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);

  .brand-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.75rem;
    text-align: center;

    .logo-wrapper {
      position: relative;
      margin-bottom: 0.75rem;

      img {
        height: 3.75rem;
        width: 3.75rem;
        filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4));
      }

      .pulse-indicator {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        background-color: #10b981;
        border-radius: 50%;
        border: 2px solid #0f172a;
        box-shadow: 0 0 8px #10b981;
      }
    }

    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.025em;

      span {
        color: var(--accent-primary);
        background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .lab-tag {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      font-weight: 500;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.15rem;

    .input-group {
      position: relative;
      display: flex;
      align-items: center;

      .icon {
        position: absolute;
        left: 1.1rem;
        color: var(--text-muted);
        font-size: 1.15rem;
        display: flex;
        align-items: center;
        pointer-events: none;
        transition: color 0.2s ease;
      }

      input {
        width: 100%;
        padding: 0.9rem 1rem 0.9rem 2.85rem;
        background-color: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        color: #ffffff;
        font-size: 0.95rem;
        transition: all 0.2s ease;

        &::placeholder {
          color: var(--text-muted);
        }

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
          background-color: rgba(15, 23, 42, 0.9);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);

          & ~ .icon {
            color: var(--accent-primary);
          }
        }
      }

      .toggle-password {
        position: absolute;
        right: 0.85rem;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.35rem;
        display: flex;
        align-items: center;
        font-size: 1.15rem;
        transition: color 0.2s ease;

        &:hover {
          color: #ffffff;
        }
      }
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      margin-top: 0.4rem;
      padding: 0.95rem;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .footer-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.85rem;
      font-size: 0.9rem;
      color: var(--text-secondary);

      a {
        color: #818cf8;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s ease;

        &:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }
      }
    }
  }
`;
