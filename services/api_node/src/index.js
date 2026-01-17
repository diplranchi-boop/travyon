const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
