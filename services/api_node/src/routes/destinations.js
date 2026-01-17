const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
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
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const roleGuard = [requireAuth, requireRole("CUSTOMER", "AGENT", "ADMIN")];

router.get("/destinations", roleGuard, async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = req.query.search?.trim() || "";
    const state = req.query.state?.trim() || "";
    const city = req.query.city?.trim() || "";

    const [destinations, total] = await Promise.all([
      listDestinations({
        search: search || null,
        state: state || null,
        city: city || null,
        limit,
        offset
      }),
      countDestinations({
        search: search || null,
        state: state || null,
        city: city || null
      })
    ]);

    res.json({
      data: destinations,
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

router.get("/destinations/:id", roleGuard, async (req, res, next) => {
  try {
    const destinationId = Number(req.params.id);
    if (Number.isNaN(destinationId)) {
      throw createError(400, "INVALID_ID", "Destination id must be a number");
    }

    const destination = await getDestinationById(destinationId);
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

    const destination = await getDestinationById(destinationId);
    if (!destination) {
      throw createError(404, "NOT_FOUND", "Destination not found");
    }

    const { page, limit, offset } = getPagination(req.query);
    const [hotels, total] = await Promise.all([
      listHotelsByDestination({ destinationId, limit, offset }),
      countHotelsByDestination(destinationId)
    ]);

    res.json({
      data: hotels,
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
