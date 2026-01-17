const express = require("express");
const healthRoutes = require("./health");
const authRoutes = require("./auth");
const destinationRoutes = require("./destinations");
const packageRoutes = require("./packages");

const router = express.Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(destinationRoutes);
router.use(packageRoutes);

module.exports = router;
