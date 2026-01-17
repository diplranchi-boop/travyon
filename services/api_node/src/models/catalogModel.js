const pool = require("../db");

const buildDestinationFilters = ({ search, state, city }) => {
  const filters = [];
  const params = [];

  filters.push("status = 'ACTIVE'");
  filters.push("is_live = 1");

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

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  return { whereClause, params };
};

const listDestinations = async ({ search, state, city, limit, offset }) => {
  const { whereClause, params } = buildDestinationFilters({ search, state, city });
  const [rows] = await pool.query(
    `SELECT id, name, state, city, status, is_live
     FROM destinations
     ${whereClause}
     ORDER BY name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
};

const countDestinations = async ({ search, state, city }) => {
  const { whereClause, params } = buildDestinationFilters({ search, state, city });
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM destinations
     ${whereClause}`,
    params
  );
  return rows[0]?.total || 0;
};

const getDestinationById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, state, city, status, is_live
     FROM destinations
     WHERE id = ? AND status = 'ACTIVE' AND is_live = 1`,
    [id]
  );
  return rows[0] || null;
};

const listHotelsByDestination = async ({ destinationId, limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT h.id, h.destination_id, h.name, h.status, h.is_live
     FROM hotels h
     INNER JOIN destinations d ON d.id = h.destination_id
     WHERE h.destination_id = ?
       AND h.status = 'ACTIVE'
       AND h.is_live = 1
       AND d.status = 'ACTIVE'
       AND d.is_live = 1
     ORDER BY h.name ASC
     LIMIT ? OFFSET ?`,
    [destinationId, limit, offset]
  );
  return rows;
};

const countHotelsByDestination = async (destinationId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM hotels h
     INNER JOIN destinations d ON d.id = h.destination_id
     WHERE h.destination_id = ?
       AND h.status = 'ACTIVE'
       AND h.is_live = 1
       AND d.status = 'ACTIVE'
       AND d.is_live = 1`,
    [destinationId]
  );
  return rows[0]?.total || 0;
};

const buildPackageFilters = ({ destinationId }) => {
  const filters = [
    "p.status = 'ACTIVE'",
    "p.is_live = 1",
    "d.status = 'ACTIVE'",
    "d.is_live = 1"
  ];
  const params = [];

  if (destinationId) {
    filters.push("p.destination_id = ?");
    params.push(destinationId);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  return { whereClause, params };
};

const listPackages = async ({ destinationId, limit, offset }) => {
  const { whereClause, params } = buildPackageFilters({ destinationId });
  const [rows] = await pool.query(
    `SELECT p.id, p.destination_id, p.name, p.status, p.price, p.is_live
     FROM packages p
     INNER JOIN destinations d ON d.id = p.destination_id
     ${whereClause}
     ORDER BY p.name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
};

const countPackages = async ({ destinationId }) => {
  const { whereClause, params } = buildPackageFilters({ destinationId });
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM packages p
     INNER JOIN destinations d ON d.id = p.destination_id
     ${whereClause}`,
    params
  );
  return rows[0]?.total || 0;
};

module.exports = {
  listDestinations,
  countDestinations,
  getDestinationById,
  listHotelsByDestination,
  countHotelsByDestination,
  listPackages,
  countPackages
};
