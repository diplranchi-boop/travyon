const express = require("express");
const morgan = require("morgan");
const healthRoutes = require("./routes/health");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

const app = express();

app.use(express.json());
app.use(morgan("combined"));

app.use(healthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
