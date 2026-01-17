const pool = require("../db");

const buildDestinationFilters = ({ search, state, city, includeNonLive }) => {
  const filters = [];
  const params = [];

  filters.push("status = 'ACTIVE'");
  if (!includeNonLive) {
    filters.push("is_live = 1");
  }

  if (search) {
    filters.push("(name LIKE ? OR state LIKE ? OR city LIKE ?)");
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue, likeValue);
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

const listDestinations = async ({ search, state, city, limit, offset, includeNonLive }) => {
  const { whereClause, params } = buildDestinationFilters({
    search,
    state,
    city,
    includeNonLive
  });
  const [rows] = await pool.query(
    `SELECT id, name, state, city, description, hero_image_url, status, is_live
     FROM destinations
     ${whereClause}
     ORDER BY name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
};

const countDestinations = async ({ search, state, city, includeNonLive }) => {
  const { whereClause, params } = buildDestinationFilters({
    search,
    state,
    city,
    includeNonLive
  });
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM destinations
     ${whereClause}`,
    params
  );
  return rows[0]?.total || 0;
};

const getDestinationById = async ({ id, includeNonLive }) => {
  const liveFilter = includeNonLive ? "" : " AND is_live = 1";
  const [rows] = await pool.query(
    `SELECT id, name, state, city, description, hero_image_url, status, is_live
     FROM destinations
     WHERE id = ? AND status = 'ACTIVE'${liveFilter}`,
    [id]
  );
  return rows[0] || null;
};

const listHotelsByDestination = async ({
  destinationId,
  limit,
  offset,
  includeNonLive
}) => {
  const liveFilter = includeNonLive ? "" : " AND h.is_live = 1 AND d.is_live = 1";
  const [rows] = await pool.query(
    `SELECT h.id, h.destination_id, h.name, h.address, h.price_from, h.rating, h.status, h.is_live
     FROM hotels h
     INNER JOIN destinations d ON d.id = h.destination_id
     WHERE h.destination_id = ?
       AND h.status = 'ACTIVE'
       AND d.status = 'ACTIVE'${liveFilter}
     ORDER BY h.rating DESC, h.price_from ASC
     LIMIT ? OFFSET ?`,
    [destinationId, limit, offset]
  );
  return rows;
};

const countHotelsByDestination = async ({ destinationId, includeNonLive }) => {
  const liveFilter = includeNonLive ? "" : " AND h.is_live = 1 AND d.is_live = 1";
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM hotels h
     INNER JOIN destinations d ON d.id = h.destination_id
     WHERE h.destination_id = ?
       AND h.status = 'ACTIVE'
       AND d.status = 'ACTIVE'${liveFilter}`,
    [destinationId]
  );
  return rows[0]?.total || 0;
};

const buildPackageFilters = ({ destinationId, includeNonLive }) => {
  const filters = [
    "p.status = 'ACTIVE'",
    "d.status = 'ACTIVE'"
  ];
  const params = [];
  if (!includeNonLive) {
    filters.push("p.is_live = 1");
    filters.push("d.is_live = 1");
  }

  if (destinationId) {
    filters.push("p.destination_id = ?");
    params.push(destinationId);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  return { whereClause, params };
};

const listPackages = async ({ destinationId, limit, offset, includeNonLive }) => {
  const { whereClause, params } = buildPackageFilters({ destinationId, includeNonLive });
  const [rows] = await pool.query(
    `SELECT p.id,
            p.destination_id,
            COALESCE(p.title, p.name) AS title,
            p.duration_days,
            COALESCE(p.price_from, p.price) AS price_from,
            p.inclusions_json,
            p.status,
            p.is_live
     FROM packages p
     INNER JOIN destinations d ON d.id = p.destination_id
     ${whereClause}
     ORDER BY p.name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
};

const countPackages = async ({ destinationId, includeNonLive }) => {
  const { whereClause, params } = buildPackageFilters({ destinationId, includeNonLive });
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
