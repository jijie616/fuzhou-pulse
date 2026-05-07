const { migrateFromJson, seedAdminUser } = require("./data/db");
const app = require("./app");

migrateFromJson();
seedAdminUser();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, function () {
  console.log(`Fuzhou Pulse backend running at http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  server.close(function () {
    console.log("Server closed.");
    process.exit(0);
  });
  setTimeout(function () {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", function () { shutdown("SIGTERM"); });
process.on("SIGINT", function () { shutdown("SIGINT"); });
