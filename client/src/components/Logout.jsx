import React from "react";
import { useNavigate } from "react-router-dom";
import { FiPower } from "react-icons/fi";
import styled from "styled-components";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";

export default function Logout() {
  const navigate = useNavigate();
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  const handleClick = async () => {
    try {
      const rawUser = localStorage.getItem(storageKey);
      if (rawUser) {
        const id = JSON.parse(rawUser)._id;
        if (id) {
          await axios.get(`${logoutRoute}/${id}`);
        }
      }
    } catch (err) {
      console.warn("Logout request completed with local cleanup:", err.message);
    } finally {
      localStorage.removeItem(storageKey);
      navigate("/login");
    }
  };

  return (
    <LogoutButton onClick={handleClick} title="Sign Out of PulseChat" aria-label="Sign Out">
      <FiPower />
    </LogoutButton>
  );
}

const LogoutButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.6rem;
  border-radius: var(--radius-sm);
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.96);
  }
`;
