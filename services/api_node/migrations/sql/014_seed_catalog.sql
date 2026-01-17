INSERT INTO destinations (name, state, city, status, is_live)
VALUES
  ('Goa Beach Escape', 'Goa', 'Panaji', 'ACTIVE', 1),
  ('Jaipur Heritage Trail', 'Rajasthan', 'Jaipur', 'ACTIVE', 1),
  ('Kerala Backwaters', 'Kerala', 'Kochi', 'ACTIVE', 1),
  ('Ladakh Adventure', 'Ladakh', 'Leh', 'ACTIVE', 1),
  ('Rishikesh Retreat', 'Uttarakhand', 'Rishikesh', 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE
  state = VALUES(state),
  city = VALUES(city),
  status = VALUES(status),
  is_live = VALUES(is_live);

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Panaji Bay Resort', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Goa Beach Escape'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Panaji Bay Resort');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Candolim Sands Hotel', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Goa Beach Escape'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Candolim Sands Hotel');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Pink City Palace Stay', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Jaipur Heritage Trail'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Pink City Palace Stay');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Amber Fort View Inn', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Jaipur Heritage Trail'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Amber Fort View Inn');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Kochi Lagoon Resort', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Kerala Backwaters'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Kochi Lagoon Resort');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Alleppey Houseboat Suites', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Kerala Backwaters'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Alleppey Houseboat Suites');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Leh Mountain Lodge', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Ladakh Adventure'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Leh Mountain Lodge');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Nubra Valley Camp', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Ladakh Adventure'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Nubra Valley Camp');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Ganga Riverside Retreat', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Rishikesh Retreat'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Ganga Riverside Retreat');

INSERT INTO hotels (destination_id, name, status, is_live)
SELECT d.id, 'Himalayan Yoga Stay', 'ACTIVE', 1
FROM destinations d
WHERE d.name = 'Rishikesh Retreat'
  AND NOT EXISTS (SELECT 1 FROM hotels h WHERE h.name = 'Himalayan Yoga Stay');

INSERT INTO packages (destination_id, name, status, price, is_live)
SELECT d.id, 'Goa Sun & Sand (4D/3N)', 'ACTIVE', 18999.00, 1
FROM destinations d
WHERE d.name = 'Goa Beach Escape'
  AND NOT EXISTS (SELECT 1 FROM packages p WHERE p.name = 'Goa Sun & Sand (4D/3N)');

INSERT INTO packages (destination_id, name, status, price, is_live)
SELECT d.id, 'Royal Jaipur Weekend (3D/2N)', 'ACTIVE', 14999.00, 1
FROM destinations d
WHERE d.name = 'Jaipur Heritage Trail'
  AND NOT EXISTS (SELECT 1 FROM packages p WHERE p.name = 'Royal Jaipur Weekend (3D/2N)');

INSERT INTO packages (destination_id, name, status, price, is_live)
SELECT d.id, 'Kerala Backwaters Bliss (5D/4N)', 'ACTIVE', 24999.00, 1
FROM destinations d
WHERE d.name = 'Kerala Backwaters'
  AND NOT EXISTS (SELECT 1 FROM packages p WHERE p.name = 'Kerala Backwaters Bliss (5D/4N)');
