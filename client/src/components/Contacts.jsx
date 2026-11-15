import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PulseLogo from "../assets/pulse-logo.svg";
import Logout from "./Logout";
import { FiSearch, FiEdit3, FiUsers, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Contacts({ contacts, changeChat, currentSelectedChat, onCloseMobile }) {
  const navigate = useNavigate();
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserImage, setCurrentUserImage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  useEffect(() => {
    const rawData = localStorage.getItem(storageKey);
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        setCurrentUserName(data.username || "Anonymous");
        setCurrentUserImage(data.avatarImage || "");
      } catch (err) {
        console.error("Failed to parse current user from storage:", err);
      }
    }
  }, [storageKey]);

  const changeCurrentChat = (contact) => {
    changeChat(contact);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <SidebarContainer>
      <div className="brand-header">
        <div className="brand-logo">
          <img src={PulseLogo} alt="PulseChat Logo" />
          <div className="brand-titles">
            <h2>Pulse<span>Chat</span></h2>
            <span className="badge">EXP 10</span>
          </div>
        </div>
        {onCloseMobile && (
          <button className="mobile-close-btn" onClick={onCloseMobile} aria-label="Close sidebar">
            <FiX />
          </button>
        )}
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Filter conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery("")}>
            &times;
          </button>
        )}
      </div>

      <div className="contacts-section">
        <div className="section-title">
          <span>Direct Messages</span>
          <span className="count-pill">{filteredContacts.length}</span>
        </div>

        <div className="contacts-list">
          {filteredContacts.length === 0 ? (
            <div className="empty-contacts">
              <FiUsers className="empty-icon" />
              <p>
                {searchQuery
                  ? "No matching contacts found."
                  : "No other members registered yet. Open another tab or browser to chat!"}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = currentSelectedChat?._id === contact._id;
              return (
                <div
                  key={contact._id}
                  className={`contact-item ${isSelected ? "selected" : ""}`}
                  onClick={() => changeCurrentChat(contact)}
                >
                  <div className="avatar-wrapper">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt={contact.username}
                    />
                    <span className="online-dot"></span>
                  </div>
                  <div className="contact-info">
                    <h4 className="name">{contact.username}</h4>
                    <span className="status-text">
                      {isSelected ? "Active conversation" : "Available to chat"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="user-profile-bar">
        <div
          className="user-details"
          onClick={() => navigate("/setAvatar")}
          title="Click to customize avatar"
        >
          <div className="avatar-wrapper">
            {currentUserImage ? (
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="My profile"
              />
            ) : (
              <div className="fallback-avatar">{currentUserName.charAt(0).toUpperCase()}</div>
            )}
            <span className="edit-badge">
              <FiEdit3 />
            </span>
          </div>
          <div className="username-box">
            <h3 className="my-name">{currentUserName}</h3>
            <span className="my-status">Online</span>
          </div>
        </div>

        <div className="logout-action">
          <Logout />
        </div>
      </div>
    </SidebarContainer>
  );
}

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  border-right: 1px solid var(--border-color);
  overflow: hidden;

  .brand-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      img {
        height: 2.35rem;
        width: 2.35rem;
      }

      .brand-titles {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        h2 {
          font-size: 1.25rem;
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

        .badge {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 9999px;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
      }
    }

    .mobile-close-btn {
      display: none;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;

      @media (max-width: 768px) {
        display: flex;
        align-items: center;
      }
    }
  }

  .search-bar {
    position: relative;
    padding: 0.85rem 1.25rem;

    .search-icon {
      position: absolute;
      left: 2rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 1rem;
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 0.65rem 2rem 0.65rem 2.25rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      color: #ffffff;
      font-size: 0.88rem;
      transition: all 0.2s ease;

      &::placeholder {
        color: var(--text-muted);
      }

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
        background: rgba(30, 41, 59, 0.95);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }
    }

    .clear-btn {
      position: absolute;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.15rem;
      cursor: pointer;
    }
  }

  .contacts-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0.5rem 0.75rem;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.5rem 0.5rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;

      .count-pill {
        background: rgba(255, 255, 255, 0.06);
        padding: 0.1rem 0.45rem;
        border-radius: 9999px;
      }
    }

    .contacts-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding-right: 0.25rem;

      .empty-contacts {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 1.5rem;
        gap: 0.85rem;
        color: var(--text-muted);

        .empty-icon {
          font-size: 2.25rem;
          opacity: 0.4;
        }

        p {
          font-size: 0.85rem;
          line-height: 1.4;
        }
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.75rem 0.85rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;

        &:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        &.selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);

          .contact-info .name {
            color: #ffffff;
            font-weight: 700;
          }

          .contact-info .status-text {
            color: #a5b4fc;
          }
        }

        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;

          img {
            height: 2.85rem;
            width: 2.85rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
          }

          .online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 10px;
            height: 10px;
            background: #10b981;
            border-radius: 50%;
            border: 2px solid #0f172a;
          }
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .status-text {
            font-size: 0.78rem;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 0.15rem;
          }
        }
      }
    }
  }

  .user-profile-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: rgba(11, 15, 25, 0.8);
    border-top: 1px solid var(--border-color);

    .user-details {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      overflow: hidden;

      &:hover .avatar-wrapper .edit-badge {
        opacity: 1;
        transform: scale(1);
      }

      .avatar-wrapper {
        position: relative;
        flex-shrink: 0;

        img {
          height: 2.65rem;
          width: 2.65rem;
          border-radius: 50%;
          border: 1.5px solid rgba(99, 102, 241, 0.5);
        }

        .fallback-avatar {
          height: 2.65rem;
          width: 2.65rem;
          border-radius: 50%;
          background: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .edit-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: var(--accent-primary);
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          opacity: 0.85;
          transition: all 0.2s ease;
        }
      }

      .username-box {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .my-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .my-status {
          font-size: 0.72rem;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.3rem;

          &::before {
            content: "";
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
          }
        }
      }
    }

    .logout-action {
      flex-shrink: 0;
    }
  }
`;
