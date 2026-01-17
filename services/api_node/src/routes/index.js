const express = require("express");
const healthRoutes = require("./health");
const authRoutes = require("./auth");

const router = express.Router();

router.use(healthRoutes);
router.use(authRoutes);

module.exports = router;
