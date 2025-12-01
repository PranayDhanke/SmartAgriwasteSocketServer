
import express from "express";
import { Server as IoServer } from "socket.io";
import http from "node:http";
import Messages from "./models/Message.js";
import mongoConnect from "./mongodb/mongoConnect.js"; // function that connects

const PORT = 5000;
const app = express();
const server = http.createServer(app);

const io = new IoServer(server, {
  cors: {
    origin: ["http://localhost:3000", "https://smart-agriwaste.vercel.app"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello, World!"));

// Start server after DB connects
async function start() {
  try {
    await mongoConnect();
    console.log("MongoDB connected");

    io.on("connection", (socket) => {
      console.log("a user connected", socket.id);

      // Client should emit('join-room') after connecting.
      socket.on("join-room", async () => {
        // join everyone into the same room
        const ROOM = "main-room";
        socket.join(ROOM);

        try {
          // find last 100 messages ordered oldest -> newest
          const hisMes = await Messages.find({})
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

          // send history only to this socket
          socket.emit("history", hisMes);
        } catch (e) {
          console.log("history error", e);
          socket.emit("history-error", { message: "Could not load history" });
        }
      });

      // Listen for incoming messages from client
      // Expect payload: { message, username, userid }
      socket.on("send-message", async (payload) => {
        try {
          if (!payload || !payload.message) return;

          const text = String(payload.message).slice(0, 2000);
          const username = payload.username ? String(payload.username).slice(0, 100) : "anonymous";
          const userid = payload.userid ? String(payload.userid) : null;

          const messageData = { message: text, username, userid };
          const messageInstance = new Messages(messageData);
          const saved = await messageInstance.save();

          // Broadcast to everyone in the single main room
          io.to("main-room").emit("receive-message", {
            _id: saved._id,
            message: saved.message,
            username: saved.username,
            userid: saved.userid,
            createdAt: saved.createdAt,
          });
        } catch (err) {
          console.error("send-message error:", err);
          socket.emit("send-error", { message: "Could not save/send message" });
        }
      });

      socket.on("leave-room", () => {
        socket.leave("main-room");
      });

      socket.on("disconnect", (reason) => {
        console.log("disconnect", socket.id, reason);
      });
    });

    server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
