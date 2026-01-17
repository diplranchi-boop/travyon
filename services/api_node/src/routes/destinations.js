const express = require("express");
const { requireAuth, allowRole } = require("../middleware/auth");
const { createError } = require("../utils/errors");
const {
  listDestinations,
  countDestinations,
  getDestinationById,
  listHotelsByDestination,
  countHotelsByDestination
} = require("../models/catalogModel");

const router = express.Router();

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSizeParam = query.page_size ?? query.limit;
  const pageSize = Math.min(Math.max(parseInt(pageSizeParam, 10) || 10, 1), 50);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
};

const roleGuard = [requireAuth, allowRole(["CUSTOMER", "AGENT", "ADMIN"])];

router.get("/destinations", roleGuard, async (req, res, next) => {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    const search = req.query.search?.trim() || "";
    const state = req.query.state?.trim() || "";
    const city = req.query.city?.trim() || "";
    const includeNonLive = req.user.role === "ADMIN";

    const [destinations, total] = await Promise.all([
      listDestinations({
        search: search || null,
        state: state || null,
        city: city || null,
        limit: pageSize,
        offset,
        includeNonLive
      }),
      countDestinations({
        search: search || null,
        state: state || null,
        city: city || null,
        includeNonLive
      })
    ]);

    res.json({
      data: destinations,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize) || 0
    });
  } catch (error) {
    next(error);
  }
});

router.get("/destinations/:id", roleGuard, async (req, res, next) => {
  try {
    const destinationId = Number(req.params.id);
    if (Number.isNaN(destinationId)) {
      throw createError(400, "INVALID_ID", "Destination id must be a number");
    }

    const destination = await getDestinationById({
      id: destinationId,
      includeNonLive: req.user.role === "ADMIN"
    });
    if (!destination) {
      throw createError(404, "NOT_FOUND", "Destination not found");
    }

    res.json({ data: destination });
  } catch (error) {
    next(error);
  }
});

router.get("/destinations/:id/hotels", roleGuard, async (req, res, next) => {
  try {
    const destinationId = Number(req.params.id);
    if (Number.isNaN(destinationId)) {
      throw createError(400, "INVALID_ID", "Destination id must be a number");
    }

    const includeNonLive = req.user.role === "ADMIN";
    const destination = await getDestinationById({
      id: destinationId,
      includeNonLive
    });
    if (!destination) {
      throw createError(404, "NOT_FOUND", "Destination not found");
    }

    const { page, pageSize, offset } = getPagination(req.query);
    const [hotels, total] = await Promise.all([
      listHotelsByDestination({ destinationId, limit: pageSize, offset, includeNonLive }),
      countHotelsByDestination({ destinationId, includeNonLive })
    ]);

    res.json({
      data: hotels,
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
