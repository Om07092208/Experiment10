const express = require("express");
const cors = require("cors");
const socket = require("socket.io");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health Check & System Status Endpoint
app.get("/ping", (_req, res) => {
  return res.json({ msg: "PulseChat Server is active", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  return res.json({
    status: "ok",
    app: "PulseChat - Experiment 10",
    uptime: process.uptime(),
    onlineUsersCount: global.onlineUsers ? global.onlineUsers.size : 0,
    timestamp: new Date().toISOString(),
  });
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

global.onlineUsers = new Map();

let server = null;
let io = null;

const startServer = async () => {
  // Connect Database before accepting traffic
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`[PulseChat Server] Listening on http://localhost:${PORT}`);
  });

  io = socket(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (userSocket) => {
    userSocket.on("add-user", (userId) => {
      if (userId) {
        onlineUsers.set(userId, userSocket.id);
        io.emit("user-status-changed", { userId, status: "online" });
      }
    });

    userSocket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        userSocket.to(sendUserSocket).emit("msg-recieve", {
          message: data.msg,
          from: data.from,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      }
    });

    userSocket.on("typing", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        userSocket.to(sendUserSocket).emit("user-typing", { from: data.from });
      }
    });

    userSocket.on("stop-typing", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        userSocket.to(sendUserSocket).emit("user-stop-typing", { from: data.from });
      }
    });

    userSocket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === userSocket.id) {
          onlineUsers.delete(userId);
          io.emit("user-status-changed", { userId, status: "offline" });
          break;
        }
      }
    });
  });

  return { server, io };
};

// Start server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
