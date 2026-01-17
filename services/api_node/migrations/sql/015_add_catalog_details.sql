ALTER TABLE destinations
  ADD COLUMN description TEXT NULL AFTER city,
  ADD COLUMN hero_image_url VARCHAR(500) NULL AFTER description;

ALTER TABLE hotels
  ADD COLUMN address VARCHAR(255) NULL AFTER name,
  ADD COLUMN price_from DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER address,
  ADD COLUMN rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00 AFTER price_from,
  ADD UNIQUE KEY uq_hotels_destination_name (destination_id, name);

ALTER TABLE packages
  ADD COLUMN title VARCHAR(255) NULL AFTER destination_id,
  ADD COLUMN duration_days INT NOT NULL DEFAULT 1 AFTER title,
  ADD COLUMN price_from DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER duration_days,
  ADD COLUMN inclusions_json JSON NULL AFTER price_from,
  ADD UNIQUE KEY uq_packages_destination_name (destination_id, name);
