const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { countPackages, listPackages } = require("../models/catalogModel");
const { createError } = require("../utils/errors");

const router = express.Router();

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const roleGuard = [requireAuth, requireRole("CUSTOMER", "AGENT", "ADMIN")];

router.get("/packages", roleGuard, async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    let destinationId = null;
    if (req.query.destination_id) {
      destinationId = Number(req.query.destination_id);
      if (Number.isNaN(destinationId)) {
        throw createError(400, "INVALID_ID", "Destination id must be a number");
      }
    }

    const [packages, total] = await Promise.all([
      listPackages({ destinationId, limit, offset }),
      countPackages({ destinationId })
    ]);

    res.json({
      data: packages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
