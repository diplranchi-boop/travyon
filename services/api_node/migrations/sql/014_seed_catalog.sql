INSERT INTO destinations (name, state, city, status, is_live)
VALUES
  ('Goa Beaches', 'Goa', 'Panaji', 'ACTIVE', 1),
  ('Jaipur Heritage', 'Rajasthan', 'Jaipur', 'ACTIVE', 1),
  ('Kerala Backwaters', 'Kerala', 'Alappuzha', 'ACTIVE', 1),
  ('Ladakh Adventure', 'Ladakh', 'Leh', 'ACTIVE', 1),
  ('Andaman Escape', 'Andaman and Nicobar Islands', 'Port Blair', 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE
  state = VALUES(state),
  city = VALUES(city),
  status = VALUES(status),
  is_live = VALUES(is_live);

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Casa Goa Boutique Stay', 'ACTIVE', 1 FROM destinations WHERE name = 'Goa Beaches';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Seaview Panaji Resort', 'ACTIVE', 1 FROM destinations WHERE name = 'Goa Beaches';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Pink City Palace Hotel', 'ACTIVE', 1 FROM destinations WHERE name = 'Jaipur Heritage';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Amber Fort Courtyard', 'ACTIVE', 1 FROM destinations WHERE name = 'Jaipur Heritage';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Backwater Breeze Villa', 'ACTIVE', 1 FROM destinations WHERE name = 'Kerala Backwaters';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Alleppey Lakefront Lodge', 'ACTIVE', 1 FROM destinations WHERE name = 'Kerala Backwaters';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Himalayan High Pass Inn', 'ACTIVE', 1 FROM destinations WHERE name = 'Ladakh Adventure';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Leh Summit Retreat', 'ACTIVE', 1 FROM destinations WHERE name = 'Ladakh Adventure';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Coral Cove Resort', 'ACTIVE', 1 FROM destinations WHERE name = 'Andaman Escape';
INSERT INTO hotels (destination_id, name, status, is_live)
SELECT id, 'Port Blair Bay Hotel', 'ACTIVE', 1 FROM destinations WHERE name = 'Andaman Escape';

INSERT INTO packages (destination_id, name, status, price, is_live)
SELECT id, 'Goa Sunrise Getaway', 'ACTIVE', 15999.00, 1 FROM destinations WHERE name = 'Goa Beaches';
INSERT INTO packages (destination_id, name, status, price, is_live)
SELECT id, 'Jaipur Royal Weekend', 'ACTIVE', 18999.00, 1 FROM destinations WHERE name = 'Jaipur Heritage';
INSERT INTO packages (destination_id, name, status, price, is_live)
SELECT id, 'Kerala Backwater Cruise', 'ACTIVE', 22999.00, 1 FROM destinations WHERE name = 'Kerala Backwaters';
