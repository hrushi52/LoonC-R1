-- LoonCamp Admin Panel Database Schema
-- MySQL Database Schema for Property Booking Management

-- =====================================================
-- ADMINS TABLE
-- Stores admin users who can manage the system
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROPERTIES TABLE
-- Stores all property listings (camping, cottages, villas)
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category ENUM('camping', 'cottage', 'villa') NOT NULL,
  location VARCHAR(255),
  price VARCHAR(50),
  price_note VARCHAR(255),
  capacity INT DEFAULT 4,
  max_capacity INT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  is_top_selling BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  check_in_time VARCHAR(50) DEFAULT '2:00 PM',
  check_out_time VARCHAR(50) DEFAULT '11:00 AM',
  contact VARCHAR(20),
  address TEXT,
  amenities JSON,
  highlights JSON,
  activities JSON,
  policies JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROPERTY_IMAGES TABLE
-- Stores image URLs for properties with display order
-- =====================================================
CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property_id (property_id),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DEFAULT ADMIN USER
-- =====================================================
-- Generate password hash using: node scripts/generate-password.js YOUR_PASSWORD
-- Then run the INSERT statement below with your hash
--
-- Example:
-- INSERT INTO admins (email, password_hash)
-- VALUES ('admin@looncamp.com', 'your_generated_bcrypt_hash_here')
-- ON DUPLICATE KEY UPDATE email=email;
--
-- SECURITY: Never use default passwords in production!
