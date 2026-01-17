CREATE TABLE IF NOT EXISTS payouts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payouts_agent (agent_id),
  KEY idx_payouts_status (status),
  CONSTRAINT fk_payouts_agent
    FOREIGN KEY (agent_id) REFERENCES agents(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
