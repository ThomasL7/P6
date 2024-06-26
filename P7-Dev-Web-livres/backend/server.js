const http = require("http");
const app = require("./app");

// Setup server port & middleware
const port = process.env.PORT || 4000;
const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
app.set("port", port);
const server = http.createServer(app);

// Handle port error
const errorPort = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  switch (error.code) {
    case "EACCES":
      console.error(bind + " - Refused access");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " - Already in use");
      process.exit(1);
    default:
      throw error;
  }
};

// Launch server
console.log("Listening on " + bind);
server.on("error", errorPort);
server.listen(port);
