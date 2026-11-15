const { io } = require("socket.io-client");
const { startServer } = require("./server/index");

async function runTests() {
  console.log("=== STARTING PULSECHAT AUTOMATED INTEGRATION TESTS ===");
  const baseHost = "http://localhost:5000";

  // Boot server and await database connection
  console.log("\n[Init] Booting PulseChat server and connecting database...");
  const { server } = await startServer();
  console.log("[Init] Server and database initialized successfully.");

  // Helper fetch with JSON
  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  async function getJSON(url) {
    const res = await fetch(url);
    return { status: res.status, data: await res.json() };
  }

  try {
    // 1. Health check & Ping
    console.log("\n[Test 1] Testing /ping and /api/health...");
    const pingRes = await getJSON(`${baseHost}/ping`);
    console.log("Ping response:", pingRes.data);
    if (!pingRes.data.msg) throw new Error("Ping failed");

    const healthRes = await getJSON(`${baseHost}/api/health`);
    console.log("Health response:", healthRes.data);
    if (healthRes.data.status !== "ok") throw new Error("Health check failed");
    console.log("✓ Test 1 Passed: Server is alive and healthy.");

    // 2. User Registration (Alice & Bob)
    console.log("\n[Test 2] Testing User Registration...");
    const user1Data = {
      username: "alice_tester",
      email: "alice@pulsechat.test",
      password: "Password123!",
    };
    const regRes1 = await postJSON(`${baseHost}/api/auth/register`, user1Data);
    console.log("Alice Register:", regRes1.data.status, regRes1.data.user?.username);
    if (!regRes1.data.status || !regRes1.data.user?._id) throw new Error("Alice registration failed");

    const user2Data = {
      username: "bob_tester",
      email: "bob@pulsechat.test",
      password: "Password123!",
    };
    const regRes2 = await postJSON(`${baseHost}/api/auth/register`, user2Data);
    console.log("Bob Register:", regRes2.data.status, regRes2.data.user?.username);
    if (!regRes2.data.status || !regRes2.data.user?._id) throw new Error("Bob registration failed");

    // Test duplicate registration check
    const dupRes = await postJSON(`${baseHost}/api/auth/register`, user1Data);
    console.log("Duplicate registration check:", dupRes.data.status === false ? "Properly rejected" : "Failed");
    if (dupRes.data.status !== false) throw new Error("Duplicate username allowed!");
    console.log("✓ Test 2 Passed: User registration & unique constraints verified.");

    // 3. User Authentication / Login
    console.log("\n[Test 3] Testing User Login...");
    const loginRes = await postJSON(`${baseHost}/api/auth/login`, {
      username: "alice_tester",
      password: "Password123!",
    });
    if (!loginRes.data.status || !loginRes.data.user) throw new Error("Login failed");

    // Invalid password test
    const badLogin = await postJSON(`${baseHost}/api/auth/login`, {
      username: "alice_tester",
      password: "WrongPassword!",
    });
    if (badLogin.data.status !== false) throw new Error("Invalid password was accepted!");
    console.log("✓ Test 3 Passed: User login & password verification passed.");

    const aliceId = regRes1.data.user._id;
    const bobId = regRes2.data.user._id;

    // 4. Avatar Setup
    console.log("\n[Test 4] Testing Avatar Configuration...");
    const dummyAvatarBase64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0icmVkIi8+PC9zdmc+";
    const avatarRes1 = await postJSON(`${baseHost}/api/auth/setavatar/${aliceId}`, {
      image: dummyAvatarBase64,
    });
    if (!avatarRes1.data.isSet) throw new Error("Failed setting Alice avatar");

    const avatarRes2 = await postJSON(`${baseHost}/api/auth/setavatar/${bobId}`, {
      image: dummyAvatarBase64,
    });
    if (!avatarRes2.data.isSet) throw new Error("Failed setting Bob avatar");
    console.log("✓ Test 4 Passed: Avatar configuration updated successfully.");

    // 5. Contacts List Retrieval
    console.log("\n[Test 5] Testing Contact Retrieval (/api/auth/allusers/:id)...");
    const contactsRes = await getJSON(`${baseHost}/api/auth/allusers/${aliceId}`);
    console.log("Contacts count for Alice:", contactsRes.data.length);
    const foundBob = contactsRes.data.find((c) => c._id === bobId);
    if (!foundBob) throw new Error("Bob not found in Alice's contact list");
    console.log("✓ Test 5 Passed: Contact list excludes self and includes peers.");

    // 6. Real-Time Socket.io Communication & Messaging
    console.log("\n[Test 6] Testing Dual Socket.io Connection & Real-Time Messaging...");
    const socketAlice = io(baseHost);
    const socketBob = io(baseHost);

    await new Promise((resolve) => socketAlice.on("connect", resolve));
    await new Promise((resolve) => socketBob.on("connect", resolve));

    socketAlice.emit("add-user", aliceId);
    socketBob.emit("add-user", bobId);

    // Wait 250ms for registration in socket mapping
    await new Promise((r) => setTimeout(r, 250));

    // Listen for incoming message on Bob's socket
    const messagePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Socket message timeout")), 4000);
      socketBob.on("msg-recieve", (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    // Alice sends message to Bob
    const testMessageText = "Hello Bob! Testing real-time PulseChat WebSockets.";
    socketAlice.emit("send-msg", {
      to: bobId,
      from: aliceId,
      msg: testMessageText,
      createdAt: new Date().toISOString(),
    });

    // Also persist via REST
    await postJSON(`${baseHost}/api/messages/addmsg`, {
      from: aliceId,
      to: bobId,
      message: testMessageText,
    });

    const receivedMessage = await messagePromise;
    console.log("Bob received socket event:", receivedMessage);
    const msgText = typeof receivedMessage === "object" ? receivedMessage.message : receivedMessage;
    if (msgText !== testMessageText) throw new Error("Received message content does not match");
    console.log("✓ Test 6 Passed: Real-time Socket.io message delivered instantly.");

    // 7. Message History Persistence & Retrieval
    console.log("\n[Test 7] Testing Message History Retrieval (/api/messages/getmsg)...");
    const historyRes = await postJSON(`${baseHost}/api/messages/getmsg`, {
      from: aliceId,
      to: bobId,
    });
    console.log("Retrieved history message count:", historyRes.data.length);
    if (historyRes.data.length === 0) throw new Error("No message history found");
    const latest = historyRes.data[historyRes.data.length - 1];
    if (latest.message !== testMessageText) throw new Error("Latest message text mismatch");
    console.log("Latest message details (with timestamps):", latest);
    console.log("✓ Test 7 Passed: Conversation messages retrieved with timestamps.");

    // 8. Typing indicator event test
    console.log("\n[Test 8] Testing Real-time Typing Telemetry...");
    const typingPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Typing timeout")), 3000);
      socketBob.on("user-typing", (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    socketAlice.emit("typing", { to: bobId, from: aliceId });
    const typingData = await typingPromise;
    if (typingData.from !== aliceId) throw new Error("Typing indicator sender mismatch");
    console.log("Bob received typing event from Alice:", typingData);
    console.log("✓ Test 8 Passed: Typing indicator dispatched and received.");

    // Disconnect sockets
    socketAlice.disconnect();
    socketBob.disconnect();

    // 9. Logout
    console.log("\n[Test 9] Testing User Logout...");
    const logoutRes = await getJSON(`${baseHost}/api/auth/logout/${aliceId}`);
    if (logoutRes.status !== 200) throw new Error("Logout failed");
    console.log("✓ Test 9 Passed: User logged out successfully.");

    console.log("\n==========================================");
    console.log("🎉 ALL PULSECHAT INTEGRATION TESTS PASSED!");
    console.log("==========================================");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED:", err);
    process.exit(1);
  }
}

runTests();
