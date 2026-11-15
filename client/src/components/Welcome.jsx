import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiMessageSquare, FiZap, FiShield, FiSmile } from "react-icons/fi";
import PulseLogo from "../assets/pulse-logo.svg";

export default function Welcome() {
  const [userName, setUserName] = useState("Explorer");
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  useEffect(() => {
    const rawData = localStorage.getItem(storageKey);
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        if (data && data.username) {
          setUserName(data.username);
        }
      } catch (err) {
        console.error("Error reading username for welcome banner:", err);
      }
    }
  }, [storageKey]);

  return (
    <WelcomeContainer>
      <div className="hero-section">
        <div className="pulse-graphic">
          <div className="ring ring-3"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-1"></div>
          <img src={PulseLogo} alt="PulseChat" className="hero-logo" />
        </div>

        <h1>
          Welcome to PulseChat, <span>{userName}</span>!
        </h1>
        <p className="subtitle">
          Web Development Lab &bull; Experiment 10 &bull; Real-Time Fullstack Messaging Hub
        </p>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="card-icon"><FiZap /></div>
          <h4>Socket.io Real-Time</h4>
          <p>Instant duplex message dispatch with live typing telemetry</p>
        </div>

        <div className="feature-card">
          <div className="card-icon"><FiSmile /></div>
          <h4>Custom Personas</h4>
          <p>Personalized SVG digital avatars generated for every peer</p>
        </div>

        <div className="feature-card">
          <div className="card-icon"><FiShield /></div>
          <h4>Zero-Config DB</h4>
          <p>Dual-mode persistence supporting local MongoDB & in-memory engine</p>
        </div>
      </div>

      <div className="action-hint">
        <FiMessageSquare className="hint-icon" />
        <span>Select any conversation from the sidebar to start exchanging messages.</span>
      </div>
    </WelcomeContainer>
  );
}

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 2.5rem;
  background: rgba(15, 23, 42, 0.4);
  text-align: center;
  overflow-y: auto;

  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 580px;

    .pulse-graphic {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      width: 140px;
      height: 140px;

      .hero-logo {
        position: relative;
        z-index: 2;
        width: 80px;
        height: 80px;
        filter: drop-shadow(0 8px 24px rgba(99, 102, 241, 0.5));
      }

      .ring {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(99, 102, 241, 0.3);
        animation: ripple 4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      }

      .ring-1 {
        width: 100px;
        height: 100px;
        animation-delay: 0s;
      }
      .ring-2 {
        width: 125px;
        height: 125px;
        animation-delay: 1.3s;
      }
      .ring-3 {
        width: 150px;
        height: 150px;
        animation-delay: 2.6s;
      }
    }

    h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;

      span {
        color: var(--accent-primary);
        background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin-top: 0.65rem;
      line-height: 1.5;
    }
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    max-width: 720px;
    width: 100%;
    margin: 2.25rem 0 2rem 0;

    @media (max-width: 840px) {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .feature-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1rem;
      text-align: left;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-2px);
      }

      .card-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        margin-bottom: 0.75rem;
      }

      h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 0.35rem;
      }

      p {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
    }
  }

  .action-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 1.25rem;
    background: rgba(99, 102, 241, 0.1);
    border: 1px dashed rgba(99, 102, 241, 0.3);
    border-radius: 9999px;
    color: #c7d2fe;
    font-size: 0.88rem;

    .hint-icon {
      color: #818cf8;
      font-size: 1.05rem;
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0.85);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.35);
      opacity: 0;
    }
  }
`;
