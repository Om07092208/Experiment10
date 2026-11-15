import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg, onTyping, onStopTyping }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const pickerRef = useRef(null);

  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (event, emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      setMsg((prev) => prev + emojiObject.emoji);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMsg(val);

    if (onTyping) {
      onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 1500);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg.trim());
      setMsg("");
      setShowEmojiPicker(false);
      if (onStopTyping) {
        onStopTyping();
      }
    }
  };

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <InputContainer>
      <div className="picker-wrapper" ref={pickerRef}>
        <button
          type="button"
          className={`emoji-btn ${showEmojiPicker ? "active" : ""}`}
          onClick={handleEmojiPickerToggle}
          title="Insert Emoji"
          aria-label="Insert Emoji"
        >
          <BsEmojiSmile />
        </button>

        {showEmojiPicker && (
          <div className="emoji-popup">
            <Picker
              onEmojiClick={handleEmojiClick}
              disableAutoFocus={true}
              native={true}
              searchPlaceholder="Search emojis..."
            />
          </div>
        )}
      </div>

      <form className="message-form" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Type your message here... (Enter to send)"
          onChange={handleInputChange}
          value={msg}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!msg.trim()}
          title="Send message"
          aria-label="Send message"
        >
          <IoSend />
        </button>
      </form>
    </InputContainer>
  );
}

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(15, 23, 42, 0.95);
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  position: relative;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .picker-wrapper {
    position: relative;

    .emoji-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.4rem;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover,
      &.active {
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
      }
    }

    .emoji-popup {
      position: absolute;
      bottom: calc(100% + 15px);
      left: 0;
      z-index: 999;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      border-radius: 1rem;
    }
  }

  .message-form {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    padding: 0.35rem 0.5rem 0.35rem 1.25rem;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: var(--accent-primary);
      background-color: rgba(30, 41, 59, 0.95);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
    }

    input {
      flex: 1;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 0.95rem;

      &::placeholder {
        color: var(--text-muted);
      }

      &:focus {
        outline: none;
      }
    }

    .send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
      flex-shrink: 0;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);

      &:hover:not(:disabled) {
        transform: scale(1.05);
        background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  }
`;
