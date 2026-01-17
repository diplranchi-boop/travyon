const ROLE_HEADER = "x-user-role";

const normalizeRole = (req) => {
  return (req.header(ROLE_HEADER) || "").toUpperCase();
};

const requireCatalogRead = (req, res, next) => {
  const role = normalizeRole(req);
  const allowed = new Set(["CUSTOMER", "AGENT", "ADMIN"]);

  if (!allowed.has(role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  req.userRole = role;
  return next();
};

const requireAdmin = (req, res, next) => {
  const role = normalizeRole(req);

  if (role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  req.userRole = role;
  return next();
};

module.exports = {
  normalizeRole,
  requireCatalogRead,
  requireAdmin
};
