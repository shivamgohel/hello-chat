const express = require("express");
const path = require("path");

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

// Start the server
const server = app.listen(serverConfig.PORT, () => {
  logger.info(`Server started on port ${serverConfig.PORT}`);
});

// Handle server errors gracefully
server.on("error", (err) => {
  logger.error("Server error:", err);
  process.exit(1);
});
