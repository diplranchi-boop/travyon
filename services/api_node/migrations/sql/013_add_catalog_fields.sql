ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS state VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS is_live TINYINT(1) NOT NULL DEFAULT 1,
  ADD KEY idx_destinations_is_live (is_live),
  ADD KEY idx_destinations_state (state),
  ADD KEY idx_destinations_city (city);

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS is_live TINYINT(1) NOT NULL DEFAULT 1,
  ADD KEY idx_hotels_is_live (is_live);

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS is_live TINYINT(1) NOT NULL DEFAULT 1,
  ADD KEY idx_packages_is_live (is_live);
