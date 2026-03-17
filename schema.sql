-- ============================================================
-- DIETA MILENAR — SCHEMA MySQL
-- Compatível com localhost (Termux/XAMPP) e hospedagem compartilhada
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS executions;
DROP TABLE IF EXISTS timeline_blocks;
DROP TABLE IF EXISTS timelines;
DROP TABLE IF EXISTS bots;
DROP TABLE IF EXISTS bonus_items;
DROP TABLE IF EXISTS bonus_categories;
DROP TABLE IF EXISTS ebooks;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS bonuses;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS withdrawals;
DROP TABLE IF EXISTS commissions;
DROP TABLE IF EXISTS affiliate_clicks;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS global_settings;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('VISITANTE','MEMBRO','VIP','REVENDA','ADMIN') DEFAULT 'VISITANTE',
  status ENUM('active','blocked','pending') DEFAULT 'active',
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(36),
  wallet_balance DECIMAL(12,2) DEFAULT 0.00,
  pix_key VARCHAR(200),
  pix_key_type ENUM('cpf','email','phone','random'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE TABLE user_profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  phone VARCHAR(30),
  gender ENUM('masculino','feminino','outro'),
  age TINYINT UNSIGNED,
  weight DECIMAL(5,2),
  height SMALLINT UNSIGNED,
  activity_level ENUM('sedentario','leve','moderado','intenso'),
  goal ENUM('perda','ganho','saude','energia'),
  restrictions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- GLOBAL SETTINGS
-- ============================================================
CREATE TABLE global_settings (
  id INT PRIMARY KEY DEFAULT 1,
  app_name VARCHAR(100) DEFAULT 'Dieta Milenar',
  primary_color VARCHAR(20) DEFAULT '#D4AF37',
  stripe_key VARCHAR(255),
  pixel_id VARCHAR(100),
  logo_url TEXT,
  terms_of_use TEXT,
  support_whatsapp VARCHAR(30) DEFAULT '5511999999999',
  support_email VARCHAR(150),
  hero_video_url TEXT,
  commission_rate DECIMAL(5,4) DEFAULT 0.5000,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO global_settings (id, app_name, support_whatsapp, support_email, commission_rate)
VALUES (1, 'Dieta Milenar', '5511999999999', 'suporte@dietasmilenares.com', 0.5);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  offer_price DECIMAL(10,2),
  cover_image TEXT,
  active BOOLEAN DEFAULT TRUE,
  drip_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_modules (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_chapters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  module_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT,
  sort_order INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (module_id) REFERENCES product_modules(id) ON DELETE CASCADE
);

-- ============================================================
-- PLANS
-- ============================================================
CREATE TABLE plans (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  period VARCHAR(50) DEFAULT 'único',
  is_popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  product_id VARCHAR(36),
  affiliate_id VARCHAR(36),
  plan_name VARCHAR(100),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_gateway_id VARCHAR(200),
  status ENUM('pending','paid','refunded','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (affiliate_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- COMMISSIONS
-- ============================================================
CREATE TABLE commissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  affiliate_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
  release_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================================
-- AFFILIATE CLICKS
-- ============================================================
CREATE TABLE affiliate_clicks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  affiliate_id VARCHAR(36),
  ip VARCHAR(45),
  user_agent TEXT,
  landing_page TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- WITHDRAWALS
-- ============================================================
CREATE TABLE withdrawals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pix_key VARCHAR(200),
  status ENUM('requested','approved','paid','rejected') DEFAULT 'requested',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('commission','rejection','system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- BONUSES (legado — mantido para compatibilidade)
-- ============================================================
CREATE TABLE bonuses (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image TEXT,
  download_url TEXT,
  content LONGTEXT,
  target_audience ENUM('MEMBRO','REVENDA','VIP','ADMIN','VISITANTE') DEFAULT 'MEMBRO',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- LIBRARY (CATEGORIES / SUBCATEGORIES / EBOOKS)
-- ============================================================
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT FALSE,
  drip_days INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE subcategories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  drip_days INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE ebooks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  category_id VARCHAR(36) NOT NULL,
  subcategory_id VARCHAR(36),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image TEXT,
  content LONGTEXT,
  download_url TEXT,
  sort_order INT DEFAULT 0,
  drip_days INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
);

-- ============================================================
-- BONUS LIBRARY (BONUS_CATEGORIES / BONUS_ITEMS)
-- ============================================================
CREATE TABLE bonus_categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT FALSE,
  drip_days INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bonus_items (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  bonus_category_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image TEXT,
  content LONGTEXT,
  download_url TEXT,
  sort_order INT DEFAULT 0,
  drip_days INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bonus_category_id) REFERENCES bonus_categories(id) ON DELETE CASCADE
);

-- ============================================================
-- BOTS & TIMELINES (Social Proof Engine)
-- ============================================================
CREATE TABLE bots (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  persona TEXT,
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  role VARCHAR(50),
  is_online BOOLEAN DEFAULT FALSE
);

CREATE TABLE timelines (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(150) NOT NULL,
  product_id VARCHAR(36),
  bot_id VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  page_route VARCHAR(200),
  trigger_type ENUM('onLoad','onScroll','onExitIntent','manual') DEFAULT 'manual',
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE SET NULL
);

CREATE TABLE timeline_blocks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  timeline_id VARCHAR(36) NOT NULL,
  bot_id VARCHAR(36),
  category ENUM('objection','proof','result','question','urgency') DEFAULT 'result',
  script TEXT NOT NULL,
  delay_ms INT DEFAULT 1000,
  typing_time_ms INT DEFAULT 2000,
  random_variations JSON,
  condition_type ENUM('scroll','time','exit','click','manual') DEFAULT 'time',
  condition_value VARCHAR(100),
  sort_order INT DEFAULT 0,
  FOREIGN KEY (timeline_id) REFERENCES timelines(id) ON DELETE CASCADE,
  FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE SET NULL
);

CREATE TABLE executions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  timeline_id VARCHAR(36),
  session_id VARCHAR(100),
  current_block_index INT DEFAULT 0,
  status ENUM('running','finished','stopped') DEFAULT 'running',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (timeline_id) REFERENCES timelines(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED: Admin padrão
-- Senha: admin123 (bcrypt hash gerado no server.ts)
-- ============================================================
INSERT INTO users (id, name, email, password_hash, role, status)
VALUES (
  'admin-default-001',
  'Admin Faraó',
  'admin@dietasmilenares.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhmO',
  'ADMIN',
  'active'
);

-- ============================================================
-- SEED: Planos padrão
-- ============================================================
INSERT INTO plans (id, name, price, old_price, period, is_popular, active, features) VALUES
('plan-essential', 'Protocolo Essencial', 97.00, 197.00, 'único', FALSE, TRUE,
  JSON_ARRAY('Guia Completo da Dieta Milenar','Lista de Alimentos Sagrados','Protocolo de Desintoxicação de 7 dias','Acesso vitalício à plataforma','Suporte via comunidade')),
('plan-imperial', 'Protocolo Imperial', 147.00, 297.00, 'único', TRUE, TRUE,
  JSON_ARRAY('Tudo do Protocolo Essencial','Receitas Milenares Exclusivas','Guia de Chás e Elixires Egípcios','Protocolo de Jejum Intermitente Sagrado','Bônus: Mentalidade de Aço','Acesso Prioritário ao Suporte')),
('plan-divine', 'Protocolo Divino', 197.00, 598.00, 'único', FALSE, TRUE,
  JSON_ARRAY('Tudo do Protocolo Imperial','Mentoria Mensal em Grupo','Análise de Papiro Nutricional','Acesso a Eventos Presenciais','Certificado de Mestre da Longevidade'));

-- ============================================================
-- SEED: Categorias da biblioteca
-- ============================================================
INSERT INTO categories (id, name, description, sort_order, is_mandatory, active) VALUES
('cat-detox', 'Detox', 'O início da sua jornada de purificação.', 1, TRUE, TRUE),
('cat-weight-loss', 'Perda de Peso', 'Protocolos avançados para queima de gordura.', 2, FALSE, TRUE),
('cat-pochete', 'Destruir Pochete', 'Foco total na região abdominal.', 3, FALSE, TRUE);

INSERT INTO ebooks (id, category_id, title, description, cover_image, sort_order, drip_days, active) VALUES
('eb-detox-f1', 'cat-detox', 'Fase 1 - O Início', 'Os primeiros 7 dias de limpeza profunda.', 'https://picsum.photos/seed/detox1/300/400', 1, 0, TRUE),
('eb-detox-f2', 'cat-detox', 'Fase 2 - Aceleração', 'Dias 8 a 14: Potencializando a queima.', 'https://picsum.photos/seed/detox2/300/400', 2, 7, TRUE),
('eb-detox-f3', 'cat-detox', 'Fase 3 - Consolidação', 'Dias 15 a 21: Selando os resultados.', 'https://picsum.photos/seed/detox3/300/400', 3, 14, TRUE);
