-- ============================================================
-- Online Event Booking Platform — Full Database Schema
-- Fully normalized (3NF), with indexes and constraints
-- ============================================================

CREATE DATABASE IF NOT EXISTS event_booking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE event_booking_db;

-- ─────────────────────────────────────────────
-- TABLE: roles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL UNIQUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO roles (name) VALUES ('user'), ('organizer'), ('admin');

-- ─────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  role_id       INT           NOT NULL DEFAULT 1,
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(180)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20)   DEFAULT NULL,
  avatar_url    VARCHAR(500)  DEFAULT NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ─────────────────────────────────────────────
-- TABLE: categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  icon        VARCHAR(100) DEFAULT 'event',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO categories (name, icon) VALUES
  ('Music',       'music_note'),
  ('Technology',  'computer'),
  ('Sports',      'sports'),
  ('Arts',        'palette'),
  ('Business',    'business'),
  ('Food',        'restaurant'),
  ('Health',      'favorite'),
  ('Education',   'school'),
  ('Comedy',      'sentiment_very_satisfied'),
  ('Other',       'event');

-- ─────────────────────────────────────────────
-- TABLE: events
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id              INT            AUTO_INCREMENT PRIMARY KEY,
  organizer_id    INT            NOT NULL,
  category_id     INT            NOT NULL DEFAULT 10,
  title           VARCHAR(200)   NOT NULL,
  description     TEXT           NOT NULL,
  venue           VARCHAR(300)   NOT NULL,
  city            VARCHAR(100)   NOT NULL,
  state           VARCHAR(100)   DEFAULT NULL,
  country         VARCHAR(100)   NOT NULL DEFAULT 'India',
  event_date      DATE           NOT NULL,
  start_time      TIME           NOT NULL,
  end_time        TIME           DEFAULT NULL,
  total_seats     INT            NOT NULL DEFAULT 100,
  available_seats INT            NOT NULL DEFAULT 100,
  ticket_price    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  image_url       VARCHAR(500)   DEFAULT NULL,
  status          ENUM('draft','pending','approved','rejected','cancelled') NOT NULL DEFAULT 'approved',
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_category  FOREIGN KEY (category_id)  REFERENCES categories(id)
);

CREATE INDEX idx_events_organizer   ON events(organizer_id);
CREATE INDEX idx_events_category    ON events(category_id);
CREATE INDEX idx_events_date        ON events(event_date);
CREATE INDEX idx_events_status      ON events(status);
CREATE INDEX idx_events_city        ON events(city);

-- ─────────────────────────────────────────────
-- TABLE: seats
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seats (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  event_id    INT         NOT NULL,
  row_label   CHAR(2)     NOT NULL,
  seat_number INT         NOT NULL,
  seat_code   VARCHAR(10) NOT NULL,
  seat_type   ENUM('standard','vip','premium') NOT NULL DEFAULT 'standard',
  price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status      ENUM('available','locked','booked') NOT NULL DEFAULT 'available',
  locked_by   INT         DEFAULT NULL,
  locked_at   TIMESTAMP   DEFAULT NULL,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_seat_event_code (event_id, seat_code),
  CONSTRAINT fk_seat_event   FOREIGN KEY (event_id)  REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_seat_locked  FOREIGN KEY (locked_by) REFERENCES users(id)  ON DELETE SET NULL
);

CREATE INDEX idx_seats_event_status ON seats(event_id, status);

-- ─────────────────────────────────────────────
-- TABLE: bookings
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                INT           AUTO_INCREMENT PRIMARY KEY,
  user_id           INT           NOT NULL,
  event_id          INT           NOT NULL,
  booking_reference VARCHAR(20)   NOT NULL UNIQUE,
  total_seats       INT           NOT NULL DEFAULT 1,
  total_amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status            ENUM('pending','confirmed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  cancelled_at      TIMESTAMP     DEFAULT NULL,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookings_user    ON bookings(user_id);
CREATE INDEX idx_bookings_event   ON bookings(event_id);
CREATE INDEX idx_bookings_status  ON bookings(status);
CREATE INDEX idx_bookings_ref     ON bookings(booking_reference);

-- ─────────────────────────────────────────────
-- TABLE: booking_seats (junction)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_seats (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  seat_id    INT NOT NULL,
  UNIQUE KEY uq_booking_seat (booking_id, seat_id),
  CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bs_seat    FOREIGN KEY (seat_id)    REFERENCES seats(id)    ON DELETE CASCADE
);

CREATE INDEX idx_bs_seat ON booking_seats(seat_id);

-- ─────────────────────────────────────────────
-- TABLE: payments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               INT            AUTO_INCREMENT PRIMARY KEY,
  booking_id       INT            NOT NULL UNIQUE,
  user_id          INT            NOT NULL,
  amount           DECIMAL(10,2)  NOT NULL,
  currency         VARCHAR(5)     NOT NULL DEFAULT 'INR',
  payment_method   ENUM('card','upi','netbanking','wallet') NOT NULL DEFAULT 'card',
  payment_status   ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_id   VARCHAR(100)   DEFAULT NULL UNIQUE,
  paid_at          TIMESTAMP      DEFAULT NULL,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE INDEX idx_payments_user    ON payments(user_id);
CREATE INDEX idx_payments_status  ON payments(payment_status);
