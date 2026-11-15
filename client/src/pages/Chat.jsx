import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  // Check user authentication
  useEffect(() => {
    const rawUser = localStorage.getItem(storageKey);
    if (!rawUser) {
      navigate("/login");
    } else {
      try {
        const parsed = JSON.parse(rawUser);
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem(storageKey);
        navigate("/login");
      }
    }
  }, [navigate, storageKey]);

  // Initialize Socket connection
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.current.on("connect", () => {
        setIsConnected(true);
        socket.current.emit("add-user", currentUser._id);
      });

      socket.current.on("disconnect", () => {
        setIsConnected(false);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [currentUser]);

  // Load contacts list
  const loadContacts = useCallback(async () => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        try {
          const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data || []);
        } catch (err) {
          console.error("Failed to fetch registered contacts:", err);
        }
      } else {
        navigate("/setAvatar");
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setShowMobileSidebar(false);
  };

  const handleBackToContacts = () => {
    setShowMobileSidebar(true);
  };

  return (
    <MainWrapper>
      {!isConnected && currentUser && (
        <div className="connection-banner">
          Connecting to PulseChat real-time messaging gateway...
        </div>
      )}

      <div className="workspace-container">
        <div className={`sidebar-panel ${showMobileSidebar ? "active" : ""}`}>
          <Contacts
            contacts={contacts}
            changeChat={handleChatChange}
            currentSelectedChat={currentChat}
            onCloseMobile={() => setShowMobileSidebar(false)}
          />
        </div>

        <div className={`chat-panel ${!showMobileSidebar ? "active" : ""}`}>
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer
              currentChat={currentChat}
              socket={socket}
              onBackToContacts={handleBackToContacts}
            />
          )}
        </div>
      </div>
    </MainWrapper>
  );
}

const MainWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-primary);
  position: relative;
  overflow: hidden;

  .connection-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: #eab308;
    color: #422006;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    padding: 0.35rem;
    z-index: 999;
  }

  .workspace-container {
    height: 92vh;
    width: 94vw;
    max-width: 1440px;
    background: rgba(17, 24, 39, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    display: grid;
    grid-template-columns: 320px 1fr;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
    overflow: hidden;

    @media screen and (min-width: 769px) and (max-width: 1024px) {
      grid-template-columns: 280px 1fr;
      width: 96vw;
      height: 94vh;
    }

    @media screen and (max-width: 768px) {
      display: flex;
      width: 100vw;
      height: 100vh;
      border-radius: 0;
      border: none;

      .sidebar-panel {
        display: none;
        width: 100%;
        height: 100%;

        &.active {
          display: flex;
        }
      }

      .chat-panel {
        display: none;
        width: 100%;
        height: 100%;

        &.active {
          display: flex;
        }
      }
    }

    .sidebar-panel {
      height: 100%;
      overflow: hidden;
    }

    .chat-panel {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }
`;
