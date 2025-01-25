const Message = require("./models/massageModel");

const users = {}; // Store users in rooms

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      socket.join(room);
      users[socket.id] = { username, room };

      // Notify others in the room
      socket.broadcast.to(room).emit("message", {
        username: "System",
        text: `${username} has joined the room.`,
      });

      // Send chat history
      const chatHistory = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", chatHistory);

      // Send online users
      const onlineUsers = Object.values(users)
        .filter((user) => user.room === room)
        .map((user) => user.username);
      io.to(room).emit("onlineUsers", onlineUsers);
    });

    // Handle chat message
    socket.on("chatMessage", async ({ username, room, text }) => {
      const message = { username, room, text };

      // Save message to database
      const savedMessage = await Message.create(message);

      // Broadcast message
      io.to(room).emit("message", savedMessage);
    });

    // Typing indicator
    socket.on("typing", ({ username, room }) => {
      socket.broadcast.to(room).emit("typing", username);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        const { username, room } = user;
        delete users[socket.id];

        // Notify others in the room
        socket.broadcast.to(room).emit("message", {
          username: "System",
          text: `${username} has left the room.`,
        });

        // Update online users
        const onlineUsers = Object.values(users)
          .filter((user) => user.room === room)
          .map((user) => user.username);
        io.to(room).emit("onlineUsers", onlineUsers);
      }
    });
  });
};
