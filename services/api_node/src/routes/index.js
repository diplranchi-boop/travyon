const express = require("express");
const healthRoutes = require("./health");
const catalogRoutes = require("./catalog");

const router = express.Router();

router.use(healthRoutes);
router.use(catalogRoutes);

module.exports = router;
