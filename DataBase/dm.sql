-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 17/03/2026 às 00:00
-- Versão do servidor: 5.7.34
-- Versão do PHP: 8.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `dm`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `affiliate_clicks`
--

CREATE TABLE `affiliate_clicks` (
  `id` varchar(36) NOT NULL,
  `affiliate_id` varchar(36) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `landing_page` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonuses`
--

CREATE TABLE `bonuses` (
  `id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `cover_image` text,
  `download_url` text,
  `content` longtext,
  `target_audience` enum('MEMBRO','REVENDA','VIP','ADMIN','VISITANTE') DEFAULT 'MEMBRO',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `bonuses`
--

INSERT INTO `bonuses` (`id`, `title`, `description`, `cover_image`, `download_url`, `content`, `target_audience`, `active`, `created_at`) VALUES
('7433e476-764f-42e0-a9c3-b076420d5f8d', 'Título de bônus teste', 'Descrição HTML teste', '/img/capa.png', '/e-books/1773438404342_1.4DietaEgipcia-main__1_.zip.pdf', NULL, 'MEMBRO', 1, '2026-03-13 21:47:10');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonus_categories`
--

CREATE TABLE `bonus_categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `sort_order` int(11) DEFAULT '0',
  `is_mandatory` tinyint(1) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonus_items`
--

CREATE TABLE `bonus_items` (
  `id` varchar(36) NOT NULL,
  `bonus_category_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `cover_image` text,
  `content` longtext,
  `download_url` text,
  `sort_order` int(11) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `bonus_items`
--

INSERT INTO `bonus_items` (`id`, `bonus_category_id`, `title`, `description`, `cover_image`, `content`, `download_url`, `sort_order`, `drip_days`, `active`, `created_at`) VALUES
('e4d04fa7-e65b-415b-890d-8de7142be7b3', '0bec2286-de7d-4327-9071-d267cb8d9f6b', 'Título do e-book bônus', 'Descrição do e-book de bônus', '/img/capa.png', 'Conteúdo HTML do bomnes', NULL, 1, 0, 1, '2026-03-13 17:37:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bots`
--

CREATE TABLE `bots` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `avatar` text,
  `persona` text,
  `region` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `role` varchar(50) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `sort_order` int(11) DEFAULT '0',
  `is_mandatory` tinyint(1) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `sort_order`, `is_mandatory`, `drip_days`, `active`) VALUES
('cat-detox', 'Detox', 'O início da sua jornada de purificação.', 1, 1, 0, 1),
('cat-weight-loss', 'Perda de Peso', 'Protocolos avançados para queima de gordura.', 2, 0, 0, 1),
('cat-pochete', 'Destruir Pochete', 'Foco total na região abdominal.', 3, 0, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `commissions`
--

CREATE TABLE `commissions` (
  `id` varchar(36) NOT NULL,
  `affiliate_id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected','paid') DEFAULT 'pending',
  `release_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ebooks`
--

CREATE TABLE `ebooks` (
  `id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `subcategory_id` varchar(36) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `cover_image` text,
  `content` longtext,
  `download_url` text,
  `sort_order` int(11) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `ebooks`
--

INSERT INTO `ebooks` (`id`, `category_id`, `subcategory_id`, `title`, `description`, `cover_image`, `content`, `download_url`, `sort_order`, `drip_days`, `active`, `created_at`) VALUES
('eb-detox-f1', 'cat-detox', NULL, 'Fase 1 - O Início', 'Os primeiros 7 dias de limpeza profunda.', '/img/capa.png', '', '/e-books/1772563878141_Saga_Detox_Fase1_Despertar_do_Organismo.pdf', 1, 0, 1, '2026-03-13 13:25:12'),
('eb-detox-f2', 'cat-detox', NULL, 'Fase 2 - Aceleração', 'Dias 8 a 14: Potencializando a queima.', '/img/capa.png', '', '/e-books/1773418106392_relatorio_auditoria.pdf', 2, 7, 1, '2026-03-13 13:25:12'),
('eb-detox-f3', 'cat-detox', NULL, 'Fase 3 - Consolidação', 'Dias 15 a 21: Selando os resultados.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-13 13:25:12'),
('2725337d-96d5-4b19-9b4a-b1b9009a1876', 'cat-weight-loss', NULL, 'Teste', '', '/img/capa.png', '', '/e-books/1773418045911_relatorio_auditoria.pdf', 1, 0, 1, '2026-03-13 16:07:32');

-- --------------------------------------------------------

--
-- Estrutura para tabela `executions`
--

CREATE TABLE `executions` (
  `id` varchar(36) NOT NULL,
  `timeline_id` varchar(36) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `current_block_index` int(11) DEFAULT '0',
  `status` enum('running','finished','stopped') DEFAULT 'running',
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int(11) NOT NULL DEFAULT '1',
  `app_name` varchar(100) DEFAULT 'Dieta Milenar',
  `primary_color` varchar(20) DEFAULT '#D4AF37',
  `stripe_key` varchar(255) DEFAULT NULL,
  `pixel_id` varchar(100) DEFAULT NULL,
  `logo_url` text,
  `terms_of_use` text,
  `support_whatsapp` varchar(30) DEFAULT '5511999999999',
  `support_email` varchar(150) DEFAULT NULL,
  `hero_video_url` text,
  `commission_rate` decimal(5,4) DEFAULT '0.5000',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `global_settings`
--

INSERT INTO `global_settings` (`id`, `app_name`, `primary_color`, `stripe_key`, `pixel_id`, `logo_url`, `terms_of_use`, `support_whatsapp`, `support_email`, `hero_video_url`, `commission_rate`, `updated_at`) VALUES
(1, 'Dieta Milenar', '#D4AF37', NULL, NULL, NULL, NULL, '5511999999999', 'suporte@dietasmilenares.com', NULL, 0.5000, '2026-03-11 22:27:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `message` text NOT NULL,
  `type` enum('commission','rejection','system') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `affiliate_id` varchar(36) DEFAULT NULL,
  `plan_name` varchar(100) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_gateway_id` varchar(200) DEFAULT NULL,
  `status` enum('pending','paid','refunded','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `plans`
--

CREATE TABLE `plans` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `period` varchar(50) DEFAULT 'único',
  `is_popular` tinyint(1) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `features` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `plans`
--

INSERT INTO `plans` (`id`, `name`, `price`, `old_price`, `period`, `is_popular`, `active`, `features`, `created_at`) VALUES
('plan-essential', 'Protocolo Essencial', 29.90, 297.90, 'único', 0, 1, '[\"Guia Completo da Dieta Milenar\", \"Lista de Alimentos Sagrados\", \"Protocolo de Desintoxicação de 7 dias\", \"Acesso vitalício à plataforma\", \"Suporte via comunidade\"]', '2026-03-11 22:27:02'),
('plan-imperial', 'Protocolo Imperial', 147.00, 297.00, 'único', 1, 1, '[\"Tudo do Protocolo Essencial\", \"Receitas Milenares Exclusivas\", \"Guia de Chás e Elixires Egípcios\", \"Protocolo de Jejum Intermitente Sagrado\", \"Bônus: Mentalidade de Aço\", \"Acesso Prioritário ao Suporte\"]', '2026-03-11 22:27:02'),
('plan-divine', 'Protocolo Divino', 197.00, 598.00, 'único', 0, 1, '[\"Tudo do Protocolo Imperial\", \"Mentoria Mensal em Grupo\", \"Análise de Papiro Nutricional\", \"Acesso a Eventos Presenciais\", \"Certificado de Mestre da Longevidade\"]', '2026-03-11 22:27:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `offer_price` decimal(10,2) DEFAULT NULL,
  `cover_image` text,
  `active` tinyint(1) DEFAULT '1',
  `drip_enabled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_link` text,
  `pix_key` varchar(200) DEFAULT NULL,
  `pix_key_type` varchar(20) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `offer_price`, `cover_image`, `active`, `drip_enabled`, `created_at`, `payment_link`, `pix_key`, `pix_key_type`) VALUES
('fac9d7ec-fd02-46a3-9099-d0176d133616', 'Membro VIP - Mensal', 'teste', 'Teste descrição', 29.90, 99.90, '/img/capa.png', 1, 1, '2026-03-13 19:09:54', 'https://pay.infinitepay.io/Ri0x-IU1vzEVMn-29,90', '', 'random'),
('2c220545-8681-4002-b4ad-b70203f99c9f', 'Fjvc', '', 'Fhhh', 80.00, 880.00, '/img/capa.png', 0, 0, '2026-03-14 14:47:20', 'Google.com', '', 'random');

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_chapters`
--

CREATE TABLE `product_chapters` (
  `id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` longtext,
  `sort_order` int(11) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_modules`
--

CREATE TABLE `product_modules` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `sort_order` int(11) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reseller_requests`
--

CREATE TABLE `reseller_requests` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `reseller_requests`
--

INSERT INTO `reseller_requests` (`id`, `user_id`, `name`, `email`, `phone`, `status`, `created_at`) VALUES
('f65f03c6-b4c2-4373-be47-50cc053280b3', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Membro - Sistema', 'Membro@admin.com', NULL, 'approved', '2026-03-16 22:59:07');

-- --------------------------------------------------------

--
-- Estrutura para tabela `subcategories`
--

CREATE TABLE `subcategories` (
  `id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `sort_order` int(11) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timelines`
--

CREATE TABLE `timelines` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `bot_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `page_route` varchar(200) DEFAULT NULL,
  `trigger_type` enum('onLoad','onScroll','onExitIntent','manual') DEFAULT 'manual'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timeline_blocks`
--

CREATE TABLE `timeline_blocks` (
  `id` varchar(36) NOT NULL,
  `timeline_id` varchar(36) NOT NULL,
  `bot_id` varchar(36) DEFAULT NULL,
  `category` enum('objection','proof','result','question','urgency') DEFAULT 'result',
  `script` text NOT NULL,
  `delay_ms` int(11) DEFAULT '1000',
  `typing_time_ms` int(11) DEFAULT '2000',
  `random_variations` json DEFAULT NULL,
  `condition_type` enum('scroll','time','exit','click','manual') DEFAULT 'time',
  `condition_value` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('VISITANTE','MEMBRO','VIP','REVENDA','ADMIN') DEFAULT 'VISITANTE',
  `status` enum('active','blocked','pending') DEFAULT 'active',
  `referral_code` varchar(50) DEFAULT NULL,
  `referred_by` varchar(36) DEFAULT NULL,
  `wallet_balance` decimal(12,2) DEFAULT '0.00',
  `pix_key` varchar(200) DEFAULT NULL,
  `pix_key_type` enum('cpf','email','phone','random') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `referral_code`, `referred_by`, `wallet_balance`, `pix_key`, `pix_key_type`, `created_at`) VALUES
('admin-default-001', 'Admin Faraó', 'admin@dietasmilenares.com', 'admin123', 'ADMIN', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-11 22:27:02'),
('904c0d9f-6961-4975-bf73-a115f6b43605', 'Membro - Sistema', 'Membro@admin.com', '123456', 'REVENDA', 'active', 'REFU6HF33', NULL, 0.00, NULL, NULL, '2026-03-12 00:04:23'),
('489d27ce-f0f4-4408-bb6f-077cb9555549', 'Visitante - Sistema', 'visitante@admin.com', '123456', 'VISITANTE', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 10:38:52'),
('d7a13929-427d-4be2-a8c8-f864e34bbfff', 'Membro VIP - Sistema', 'membrovip@admin.com', '123456', 'VIP', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 13:02:48'),
('280f726b-f8e4-41ff-875b-1a3275fe1fc4', 'Revenda - Sistema', 'revenda@admin.com', '123456', 'REVENDA', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 13:04:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `gender` enum('masculino','feminino','outro') DEFAULT NULL,
  `age` tinyint(3) UNSIGNED DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` smallint(5) UNSIGNED DEFAULT NULL,
  `activity_level` enum('sedentario','leve','moderado','intenso') DEFAULT NULL,
  `goal` enum('perda','ganho','saude','energia') DEFAULT NULL,
  `restrictions` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `phone`, `gender`, `age`, `weight`, `height`, `activity_level`, `goal`, `restrictions`, `created_at`, `updated_at`) VALUES
('6345d430-1739-11f1-88ec-b6a721b01145', '2115baaa-0aca-4a9a-bc2c-3843213d4801', '11919211370', 'masculino', 36, 110.00, 186, 'leve', 'perda', 'Tijolos', '2026-03-03 19:44:27', '2026-03-03 19:44:27'),
('cbfd933d-2178-11f1-88ec-b6a721b01145', 'f2cf4956-60e1-4f5d-bb49-a1395fe28cff', '9999999999', 'outro', 35, 120.00, 185, 'intenso', 'energia', 'Ovo', '2026-03-16 20:43:32', '2026-03-16 21:08:35');

-- --------------------------------------------------------

--
-- Estrutura para tabela `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pix_key` varchar(200) DEFAULT NULL,
  `status` enum('requested','approved','paid','rejected') DEFAULT 'requested',
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `affiliate_clicks`
--
ALTER TABLE `affiliate_clicks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_id` (`affiliate_id`);

--
-- Índices de tabela `bonuses`
--
ALTER TABLE `bonuses`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `bonus_categories`
--
ALTER TABLE `bonus_categories`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `bonus_items`
--
ALTER TABLE `bonus_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bonus_category_id` (`bonus_category_id`);

--
-- Índices de tabela `bots`
--
ALTER TABLE `bots`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_id` (`affiliate_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Índices de tabela `ebooks`
--
ALTER TABLE `ebooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `subcategory_id` (`subcategory_id`);

--
-- Índices de tabela `executions`
--
ALTER TABLE `executions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timeline_id` (`timeline_id`);

--
-- Índices de tabela `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `affiliate_id` (`affiliate_id`);

--
-- Índices de tabela `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices de tabela `product_chapters`
--
ALTER TABLE `product_chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`);

--
-- Índices de tabela `product_modules`
--
ALTER TABLE `product_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Índices de tabela `reseller_requests`
--
ALTER TABLE `reseller_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`);

--
-- Índices de tabela `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Índices de tabela `timelines`
--
ALTER TABLE `timelines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `bot_id` (`bot_id`);

--
-- Índices de tabela `timeline_blocks`
--
ALTER TABLE `timeline_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timeline_id` (`timeline_id`),
  ADD KEY `bot_id` (`bot_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD KEY `referred_by` (`referred_by`);

--
-- Índices de tabela `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Índices de tabela `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
