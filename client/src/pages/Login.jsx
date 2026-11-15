import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import PulseLogo from "../assets/pulse-logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
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

  const validateForm = () => {
    const { username, password } = values;
    if (!username.trim()) {
      toast.error("Username is required.", toastOptions);
      return false;
    } else if (!password.trim()) {
      toast.error("Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const { username, password } = values;
        const { data } = await axios.post(loginRoute, {
          username: username.trim(),
          password,
        });

        if (data.status === false) {
          toast.error(data.msg || "Authentication failed.", toastOptions);
        } else if (data.status === true) {
          localStorage.setItem(storageKey, JSON.stringify(data.user));
          toast.success("Welcome back!", toastOptions);
          navigate("/");
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
            <p className="lab-tag">Web Development Lab &bull; Experiment 10</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <span className="icon"><FiUser /></span>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={values.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="input-group">
              <span className="icon"><FiLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <FiLogIn />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="footer-links">
              <span>Don't have an account?</span>
              <Link to="/register">Create an account</Link>
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
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.1) 60%, transparent 80%);
    filter: blur(50px);
    z-index: 0;
    pointer-events: none;
    animation: pulse 8s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    0% { transform: scale(0.9) translate(-20px, -20px); }
    100% { transform: scale(1.1) translate(20px, 20px); }
  }
`;

const CardContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2.75rem 2.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);

  .brand-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    text-align: center;

    .logo-wrapper {
      position: relative;
      margin-bottom: 0.85rem;

      img {
        height: 4rem;
        width: 4rem;
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
      font-size: 0.78rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 0.35rem;
      font-weight: 600;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

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
        padding: 0.95rem 1rem 0.95rem 2.85rem;
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
      margin-top: 0.5rem;
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
      margin-top: 1rem;
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
