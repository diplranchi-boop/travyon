CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(64) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  agent_id BIGINT UNSIGNED NULL,
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  travel_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookings_code (booking_code),
  KEY idx_bookings_status (status),
  KEY idx_bookings_customer (customer_id),
  KEY idx_bookings_agent (agent_id),
  CONSTRAINT fk_bookings_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_agent
    FOREIGN KEY (agent_id) REFERENCES agents(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
