const express = require("express");
const pool = require("../db");
const { requireAdmin, requireCatalogRead } = require("../middleware/roles");

const router = express.Router();
const PAGE_SIZE = 10;

const buildDestinationFilters = (role, { search, state, city } = {}) => {
  const filters = [];
  const params = [];

  if (role !== "ADMIN") {
    filters.push("is_live = 1");
    filters.push("status = 'ACTIVE'");
  }

  if (search) {
    filters.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  if (state) {
    filters.push("state = ?");
    params.push(state);
  }

  if (city) {
    filters.push("city = ?");
    params.push(city);
  }

  return { filters, params };
};

const applyFilters = (filters) => {
  if (filters.length === 0) {
    return "";
  }

  return `WHERE ${filters.join(" AND ")}`;
};

router.get("/destinations", requireCatalogRead, async (req, res, next) => {
  const { search, state, city } = req.query;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const offset = (page - 1) * PAGE_SIZE;
  const { filters, params } = buildDestinationFilters(req.userRole, {
    search,
    state,
    city
  });

  try {
    const whereClause = applyFilters(filters);
    const countSql = `SELECT COUNT(*) AS total FROM destinations ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);

    const dataSql = `
      SELECT id, name, state, city, status, is_live, created_at, updated_at
      FROM destinations
      ${whereClause}
      ORDER BY name
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, PAGE_SIZE, offset];
    const [rows] = await pool.query(dataSql, dataParams);

    res.json({
      data: rows,
      page,
      page_size: PAGE_SIZE,
      total: countRows[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
});

router.get("/destinations/:id", requireCatalogRead, async (req, res, next) => {
  const { id } = req.params;
  const { filters, params } = buildDestinationFilters(req.userRole);
  filters.unshift("id = ?");
  params.unshift(id);

  try {
    const whereClause = applyFilters(filters);
    const [rows] = await pool.query(
      `SELECT id, name, state, city, status, is_live, created_at, updated_at FROM destinations ${whereClause}`,
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/destinations/:id/hotels",
  requireCatalogRead,
  async (req, res, next) => {
    const { id } = req.params;
    const destinationFilters = ["id = ?"];
    const destinationParams = [id];

    if (req.userRole !== "ADMIN") {
      destinationFilters.push("is_live = 1");
      destinationFilters.push("status = 'ACTIVE'");
    }

    try {
      const destinationWhere = applyFilters(destinationFilters);
      const [destinations] = await pool.query(
        `SELECT id FROM destinations ${destinationWhere}`,
        destinationParams
      );

      if (destinations.length === 0) {
        return res.status(404).json({ error: "Destination not found" });
      }

      const hotelFilters = ["destination_id = ?"];
      const hotelParams = [id];

      if (req.userRole !== "ADMIN") {
        hotelFilters.push("is_live = 1");
        hotelFilters.push("status = 'ACTIVE'");
      }

      const hotelsWhere = applyFilters(hotelFilters);
      const [rows] = await pool.query(
        `SELECT id, destination_id, name, status, is_live, created_at, updated_at FROM hotels ${hotelsWhere} ORDER BY name`,
        hotelParams
      );

      return res.json({ data: rows });
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/packages", requireCatalogRead, async (req, res, next) => {
  const { destination_id: destinationId } = req.query;
  const filters = [];
  const params = [];

  if (destinationId) {
    filters.push("destination_id = ?");
    params.push(destinationId);
  }

  if (req.userRole !== "ADMIN") {
    filters.push("is_live = 1");
    filters.push("status = 'ACTIVE'");
  }

  try {
    const whereClause = applyFilters(filters);
    const [rows] = await pool.query(
      `SELECT id, destination_id, name, status, is_live, price, created_at, updated_at FROM packages ${whereClause} ORDER BY name`,
      params
    );

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

const parseLiveToggle = (value) => {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (value === 1 || value === 0) {
    return value;
  }

  if (value === "1" || value === "0") {
    return Number.parseInt(value, 10);
  }

  return null;
};

const handleLiveToggle = async (req, res, next, table) => {
  const isLive = parseLiveToggle(req.body?.is_live);

  if (isLive === null) {
    return res.status(400).json({ error: "is_live must be a boolean" });
  }

  try {
    const [result] = await pool.query(`UPDATE ${table} SET is_live = ? WHERE id = ?`, [
      isLive,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const [rows] = await pool.query(
      `SELECT id, is_live FROM ${table} WHERE id = ?`,
      [req.params.id]
    );

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

router.patch("/destinations/:id", requireAdmin, (req, res, next) => {
  handleLiveToggle(req, res, next, "destinations");
});

router.patch("/hotels/:id", requireAdmin, (req, res, next) => {
  handleLiveToggle(req, res, next, "hotels");
});

router.patch("/packages/:id", requireAdmin, (req, res, next) => {
  handleLiveToggle(req, res, next, "packages");
});

module.exports = router;
