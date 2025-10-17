const express = require("express");
const path = require("path");
const http = require("http");

const { serverConfig, logger } = require("./config/index");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

// Logger middleware
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const safeBody = JSON.parse(JSON.stringify(req.body));

    if (safeBody.password) {
      safeBody.password = "***";
    }

    logger.info(`Request Body: ${JSON.stringify(safeBody)}`);
  } else {
    logger.info(`Query Params: ${JSON.stringify(req.query)}`);
  }

  next();
});

const server = http.createServer(app);
const io = require("socket.io")(server);

let socketConnected = new Set();

function onConnected(socket) {
  logger.info(`Socket connected: ${socket.id}`);
  socketConnected.add(socket.id);
  io.emit("client count", socketConnected.size);

  socket.on("chat message", (data) => {
    socket.broadcast.emit("chat message", data);
  });

  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    socketConnected.delete(socket.id);
    io.emit("client count", socketConnected.size);
  });
}

io.on("connection", onConnected);

// Start the server
server.listen(serverConfig.PORT, () => {
  logger.info(`Server started on port ${serverConfig.PORT}`);
});

// Handle server errors gracefully
server.on("error", (err) => {
  logger.error("Server error:", err);
  process.exit(1);
});
