import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import { FiArrowLeft } from "react-icons/fi";

export default function ChatContainer({ currentChat, socket, onBackToContacts }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "pulsechat-authenticated-user";

  const getCurrentUserId = useCallback(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        return JSON.parse(raw)._id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [storageKey]);

  // Fetch conversation messages
  const fetchMessages = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId || !currentChat) return;

    try {
      const response = await axios.post(recieveMessageRoute, {
        from: userId,
        to: currentChat._id,
      });
      setMessages(response.data || []);
    } catch (err) {
      console.error("Failed to load message history:", err);
    }
  }, [currentChat, getCurrentUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket listeners for real-time messaging and typing
  useEffect(() => {
    const activeSocket = socket.current;
    if (!activeSocket) return;

    const handleReceivedMessage = (incoming) => {
      // Incoming message could be plain string (old format) or object { message, from, createdAt }
      const text = typeof incoming === "object" ? incoming.message : incoming;
      const createdAt = typeof incoming === "object" ? incoming.createdAt : new Date().toISOString();
      const from = typeof incoming === "object" ? incoming.from : null;

      // Only display if the message is from currentChat or no sender filter
      if (!from || from === currentChat._id) {
        setMessages((prev) => [
          ...prev,
          {
            fromSelf: false,
            message: text,
            createdAt: createdAt,
          },
        ]);
      }
    };

    const handleUserTyping = (data) => {
      if (data.from === currentChat._id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.from === currentChat._id) {
        setIsTyping(false);
      }
    };

    activeSocket.on("msg-recieve", handleReceivedMessage);
    activeSocket.on("user-typing", handleUserTyping);
    activeSocket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      activeSocket.off("msg-recieve", handleReceivedMessage);
      activeSocket.off("user-typing", handleUserTyping);
      activeSocket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [socket, currentChat]);

  // Auto-scroll to bottom on message update or typing
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMsg = async (msg) => {
    const userId = getCurrentUserId();
    if (!userId || !currentChat) return;

    const timestamp = new Date().toISOString();

    // Dispatch via Socket
    if (socket.current) {
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: userId,
        msg,
        createdAt: timestamp,
      });
    }

    // Persist to Database via API
    try {
      await axios.post(sendMessageRoute, {
        from: userId,
        to: currentChat._id,
        message: msg,
      });
    } catch (err) {
      console.error("Failed to persist message:", err);
    }

    // Optimistically update local message list
    setMessages((prev) => [
      ...prev,
      {
        fromSelf: true,
        message: msg,
        createdAt: timestamp,
      },
    ]);
  };

  const handleTyping = () => {
    const userId = getCurrentUserId();
    if (socket.current && userId && currentChat) {
      socket.current.emit("typing", {
        to: currentChat._id,
        from: userId,
      });
    }
  };

  const handleStopTyping = () => {
    const userId = getCurrentUserId();
    if (socket.current && userId && currentChat) {
      socket.current.emit("stop-typing", {
        to: currentChat._id,
        from: userId,
      });
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          {onBackToContacts && (
            <button
              className="back-btn"
              onClick={onBackToContacts}
              title="Back to contacts list"
              aria-label="Back to contacts"
            >
              <FiArrowLeft />
            </button>
          )}

          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt={currentChat.username}
            />
            <span className="online-indicator"></span>
          </div>

          <div className="chat-meta">
            <h3 className="partner-name">{currentChat.username}</h3>
            <span className="partner-status">
              {isTyping ? "Typing..." : "Active now"}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => {
          const isSelf = message.fromSelf;
          return (
            <div
              key={index}
              className={`message-row ${isSelf ? "sended" : "recieved"}`}
            >
              <div className="content">
                <p>{message.message}</p>
                {message.createdAt && (
                  <span className="time-tag">
                    {formatTimestamp(message.createdAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="message-row recieved">
            <div className="content typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <ChatInput
        handleSendMsg={handleSendMsg}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: rgba(15, 23, 42, 0.7);
  overflow: hidden;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(15, 23, 42, 0.95);
    border-bottom: 1px solid var(--border-color);

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .back-btn {
        display: none;
        background: none;
        border: none;
        color: #ffffff;
        font-size: 1.35rem;
        cursor: pointer;
        padding: 0.35rem;
        border-radius: var(--radius-sm);
        transition: background 0.2s ease;

        @media (max-width: 768px) {
          display: flex;
          align-items: center;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .avatar {
        position: relative;
        flex-shrink: 0;

        img {
          height: 2.75rem;
          width: 2.75rem;
          border-radius: 50%;
          border: 1.5px solid rgba(99, 102, 241, 0.4);
        }

        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 9px;
          height: 9px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid #0f172a;
        }
      }

      .chat-meta {
        display: flex;
        flex-direction: column;

        .partner-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }

        .partner-status {
          font-size: 0.78rem;
          color: #10b981;
          margin-top: 0.1rem;
        }
      }
    }
  }

  .chat-messages {
    flex: 1;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    overflow-y: auto;

    .message-row {
      display: flex;
      align-items: flex-end;

      .content {
        max-width: 65%;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        line-height: 1.45;
        border-radius: var(--radius-lg);
        word-break: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;

        @media (max-width: 768px) {
          max-width: 80%;
        }

        .time-tag {
          font-size: 0.68rem;
          opacity: 0.7;
          margin-top: 0.35rem;
          align-self: flex-end;
        }
      }

      &.sended {
        justify-content: flex-end;

        .content {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border-bottom-right-radius: 0.25rem;
        }
      }

      &.recieved {
        justify-content: flex-start;

        .content {
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border-bottom-left-radius: 0.25rem;
        }
      }

      .typing-indicator {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        padding: 0.75rem 1rem;

        .dot {
          width: 7px;
          height: 7px;
          background: #818cf8;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;

          &:nth-child(1) { animation-delay: -0.32s; }
          &:nth-child(2) { animation-delay: -0.16s; }
          &:nth-child(3) { animation-delay: 0; }
        }
      }
    }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
  }
`;
