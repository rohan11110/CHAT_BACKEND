const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const apiRoutes = require("./routes/apiRoutes");
const setupSocket = require("./socket");

// Load environment variables
dotenv.config();

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://chatroom1110.netlify.app", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use("/api", apiRoutes);

// Socket.io setup
setupSocket(io);

// Database connection
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
