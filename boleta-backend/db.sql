CREATE TABLE shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shopify_domain VARCHAR(255) UNIQUE NOT NULL,
  shopify_token VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  plan_name VARCHAR(100),
  installed_at DATETIME,
  uninstalled_at DATETIME NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE app_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  shopify_subscription_id BIGINT,
  name VARCHAR(100),
  status ENUM('pending', 'active', 'cancelled', 'declined', 'expired') DEFAULT 'pending',
  trial_ends_at DATETIME NULL,
  billing_on DATETIME NULL,
  price DECIMAL(10,2),
  currency VARCHAR(10),
  return_url TEXT,
  confirmation_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE usage_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  subscription_id INT NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_to_shopify BOOLEAN DEFAULT 0,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES app_subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE webhook_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic VARCHAR(100),
  shop_domain VARCHAR(255),
  payload JSON,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT 0
);

CREATE TABLE app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  `key` VARCHAR(100),
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  email VARCHAR(255),
  role ENUM('owner', 'staff') DEFAULT 'staff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);