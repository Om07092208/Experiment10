import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";
import multiavatar from "@multiavatar/multiavatar/esm";
import { FiRefreshCw, FiCheck, FiUserCheck } from "react-icons/fi";
import PulseLogo from "../assets/pulse-logo.svg";

const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  const checkUser = useCallback(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      navigate("/login");
    }
  }, [navigate, storageKey]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const generateAvatars = useCallback(() => {
    setIsLoading(true);
    setSelectedAvatar(undefined);
    try {
      const data = [];
      const seeds = [
        "PulseStar-" + Math.random().toString(36).substring(2, 7),
        "CyberWave-" + Math.random().toString(36).substring(2, 7),
        "QuantumX-" + Math.random().toString(36).substring(2, 7),
        "NeonByte-" + Math.random().toString(36).substring(2, 7),
        "AuraEcho-" + Math.random().toString(36).substring(2, 7),
        "NovaSpark-" + Math.random().toString(36).substring(2, 7),
      ];

      for (let i = 0; i < seeds.length; i++) {
        const svgCode = multiavatar(seeds[i]);
        const encoded = btoa(unescape(encodeURIComponent(svgCode)));
        data.push(encoded);
      }
      setAvatars(data);
    } catch (err) {
      console.error("Avatar generation error:", err);
      toast.error("Error generating avatars. Please try again.", toastOptions);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    generateAvatars();
  }, [generateAvatars]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please pick an avatar to personalize your profile.", toastOptions);
      return;
    }

    const rawUser = localStorage.getItem(storageKey);
    if (!rawUser) {
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      const user = JSON.parse(rawUser);
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(storageKey, JSON.stringify(user));
        toast.success("Avatar updated successfully!", toastOptions);
        navigate("/");
      } else {
        toast.error("Could not set avatar. Please retry.", toastOptions);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Server connection failed.", toastOptions);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Container>
        <div className="avatar-card">
          <div className="card-header">
            <img src={PulseLogo} alt="PulseChat" className="brand-icon" />
            <h2>Choose Your Pulse Identity</h2>
            <p>Select a unique digital persona for your messaging workspace</p>
          </div>

          {isLoading ? (
            <div className="loader-box">
              <div className="spinner"></div>
              <p>Generating procedural avatars...</p>
            </div>
          ) : (
            <div className="avatars-grid">
              {avatars.map((avatar, index) => {
                const isSelected = selectedAvatar === index;
                return (
                  <div
                    key={index}
                    className={`avatar-item ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedAvatar(index)}
                  >
                    <img
                      src={`data:image/svg+xml;base64,${avatar}`}
                      alt={`Avatar option ${index + 1}`}
                    />
                    {isSelected && (
                      <div className="badge-check">
                        <FiCheck />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="action-buttons">
            <button
              type="button"
              className="refresh-btn"
              onClick={generateAvatars}
              disabled={isLoading || isSaving}
            >
              <FiRefreshCw className={isLoading ? "spin" : ""} />
              <span>Generate New Set</span>
            </button>

            <button
              type="button"
              className="confirm-btn"
              onClick={setProfilePicture}
              disabled={isLoading || isSaving || selectedAvatar === undefined}
            >
              <FiUserCheck />
              <span>{isSaving ? "Saving Identity..." : "Set as My Profile"}</span>
            </button>
          </div>
        </div>
      </Container>
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background-color: var(--bg-primary);
  padding: 1.5rem;

  .avatar-card {
    width: 100%;
    max-width: 640px;
    background: rgba(17, 24, 39, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 2.75rem 2.25rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;

    .card-header {
      text-align: center;
      margin-bottom: 2rem;

      .brand-icon {
        height: 3.25rem;
        width: 3.25rem;
        margin-bottom: 0.75rem;
      }

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #ffffff;
      }

      p {
        font-size: 0.95rem;
        color: var(--text-secondary);
        margin-top: 0.35rem;
      }
    }

    .loader-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      gap: 1.25rem;

      .spinner {
        width: 44px;
        height: 44px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
      }

      p {
        color: var(--text-muted);
        font-size: 0.95rem;
      }
    }

    .avatars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      width: 100%;
      margin-bottom: 2.25rem;

      @media (max-width: 540px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .avatar-item {
        position: relative;
        background: rgba(15, 23, 42, 0.6);
        border: 2px solid rgba(255, 255, 255, 0.08);
        border-radius: 1.25rem;
        padding: 1.15rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: all 0.25s ease;

        img {
          height: 5.5rem;
          width: 5.5rem;
          transition: transform 0.25s ease;
        }

        &:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(15, 23, 42, 0.9);

          img {
            transform: scale(1.08);
          }
        }

        &.selected {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.15);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);

          img {
            transform: scale(1.05);
          }
        }

        .badge-check {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #10b981;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      width: 100%;

      @media (max-width: 540px) {
        flex-direction: column;
      }

      button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        padding: 0.9rem 1.25rem;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .refresh-btn {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #e2e8f0;

        &:hover:not(:disabled) {
          background: rgba(51, 65, 85, 0.9);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }
      }

      .confirm-btn {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        border: none;
        color: #ffffff;
        box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }
      }
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
