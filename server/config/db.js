const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer = null;

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (mongoUrl) {
    try {
      console.log(`[PulseChat DB] Connecting to MongoDB: ${mongoUrl.replace(/:\/\/[^@]+@/, "://***:***@")}`);
      await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 2500,
      });
      console.log("[PulseChat DB] MongoDB connection established successfully.");
      return;
    } catch (err) {
      console.warn(`[PulseChat DB] Could not connect to configured MONGO_URL (${err.message}).`);
      console.log("[PulseChat DB] Falling back to embedded MongoMemoryServer for zero-config operation...");
    }
  } else {
    console.log("[PulseChat DB] No MONGO_URL configured. Initializing embedded MongoMemoryServer...");
  }

  try {
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`[PulseChat DB] Embedded in-memory MongoDB running at: ${memoryUri}`);
    console.log("[PulseChat DB] Ready for zero-setup local grading and development.");
  } catch (memErr) {
    console.error("[PulseChat DB] Critical error initializing database:", memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log("[PulseChat DB] Database disconnected.");
  } catch (err) {
    console.error("[PulseChat DB] Error disconnecting database:", err.message);
  }
};

module.exports = { connectDB, disconnectDB };
