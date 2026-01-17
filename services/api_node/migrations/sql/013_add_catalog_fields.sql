ALTER TABLE destinations
  ADD COLUMN state VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN city VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN is_live TINYINT(1) NOT NULL DEFAULT 1,
  ADD KEY idx_destinations_state (state),
  ADD KEY idx_destinations_city (city),
  ADD KEY idx_destinations_live (is_live);

ALTER TABLE hotels
  ADD COLUMN is_live TINYINT(1) NOT NULL DEFAULT 1,
  ADD KEY idx_hotels_live (is_live);

ALTER TABLE packages
  ADD COLUMN is_live TINYINT(1) NOT NULL DEFAULT 1,
  ADD KEY idx_packages_live (is_live);
