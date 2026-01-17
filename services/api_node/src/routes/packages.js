const express = require("express");
const { requireAuth, allowRole } = require("../middleware/auth");
const { countPackages, listPackages } = require("../models/catalogModel");
const { createError } = require("../utils/errors");

const router = express.Router();

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSizeParam = query.page_size ?? query.limit;
  const pageSize = Math.min(Math.max(parseInt(pageSizeParam, 10) || 10, 1), 50);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
};

const roleGuard = [requireAuth, allowRole(["CUSTOMER", "AGENT", "ADMIN"])];

router.get("/packages", roleGuard, async (req, res, next) => {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    let destinationId = null;
    if (req.query.destination_id) {
      destinationId = Number(req.query.destination_id);
      if (Number.isNaN(destinationId)) {
        throw createError(400, "INVALID_ID", "Destination id must be a number");
      }
    }
    const includeNonLive = req.user.role === "ADMIN";

    const [packages, total] = await Promise.all([
      listPackages({ destinationId, limit: pageSize, offset, includeNonLive }),
      countPackages({ destinationId, includeNonLive })
    ]);

    res.json({
      data: packages,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize) || 0
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
