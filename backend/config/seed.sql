-- ============================================================
-- SEED DATA — Online Event Booking Platform
-- Run AFTER database.sql
-- Creates: 1 admin, 2 organizers, 3 users, 10 events, seats
-- ============================================================

USE event_booking_db;

-- ── Users ───────────────────────────────────────────────────
-- Passwords are all bcrypt of 'password123' (12 rounds)
INSERT INTO users (full_name, email, password_hash, phone, role_id) VALUES
-- Admin (password: admin123)
('Platform Admin',   'admin@eventhub.com',   '$2a$12$LQv3c1yqBWVHxkd0LQ1Cr.eNmvQwc2tWbqHG7tWb3A.y5PjvUxJuq', '9999000001', 3),
-- Organizers (password: password123)
('Ravi Sharma',      'ravi@eventhub.com',    '$2a$12$K9wFpnAjpKb7.0P1OWFC9eTVaUSGlPzxX3Ey/h2n/IaM9OFJWB9gO', '9999000002', 2),
('Priya Mehta',      'priya@eventhub.com',   '$2a$12$K9wFpnAjpKb7.0P1OWFC9eTVaUSGlPzxX3Ey/h2n/IaM9OFJWB9gO', '9999000003', 2),
-- Regular Users (password: password123)
('Aarav Patel',      'aarav@example.com',    '$2a$12$K9wFpnAjpKb7.0P1OWFC9eTVaUSGlPzxX3Ey/h2n/IaM9OFJWB9gO', '9999000004', 1),
('Meera Nair',       'meera@example.com',    '$2a$12$K9wFpnAjpKb7.0P1OWFC9eTVaUSGlPzxX3Ey/h2n/IaM9OFJWB9gO', '9999000005', 1),
('Rohan Gupta',      'rohan@example.com',    '$2a$12$K9wFpnAjpKb7.0P1OWFC9eTVaUSGlPzxX3Ey/h2n/IaM9OFJWB9gO', '9999000006', 1);

-- ── Events ──────────────────────────────────────────────────
INSERT INTO events
  (organizer_id, category_id, title, description, venue, city, state, country,
   event_date, start_time, end_time, total_seats, available_seats, ticket_price, status)
VALUES
(2, 1,  'Bangalore Jazz Festival 2025', 'A night of soulful jazz featuring top artists from across India. Food stalls, art installations, and non-stop music await!', 'Palace Grounds', 'Bangalore', 'Karnataka', 'India', '2025-07-15', '18:00', '23:00', 500, 500, 999.00,  'approved'),
(2, 2,  'DevFest India 2025',           'Google Developer Festival celebrating tech innovation. Talks on AI, Flutter, Firebase, Cloud and more from industry leaders.', 'NIMHANS Convention Centre', 'Bangalore', 'Karnataka', 'India', '2025-08-02', '09:00', '18:00', 1000, 1000, 499.00, 'approved'),
(3, 3,  'IPL Fan Park – Mumbai',        'Watch IPL matches on a giant LED screen with fellow fans. Food, games, contests and prizes every match night!', 'Bandra-Kurla Complex', 'Mumbai', 'Maharashtra', 'India', '2025-09-10', '19:00', '23:30', 2000, 2000, 299.00, 'approved'),
(3, 4,  'National Art Expo 2025',       'A curated exhibition of contemporary Indian art — paintings, sculpture, digital art and live installations by 50+ artists.', 'NGMA', 'Delhi', 'Delhi', 'India', '2025-07-20', '10:00', '20:00', 300, 300, 199.00,  'approved'),
(2, 5,  'Startup Pitch Night',          'Founders pitch to top VCs and Angel investors. Network with 200+ startup ecosystem leaders over cocktails and dinner.', 'WeWork Galaxy', 'Bangalore', 'Karnataka', 'India', '2025-07-25', '17:00', '21:00', 200, 200, 1499.00, 'approved'),
(3, 6,  'Street Food Festival',         'Over 100 food stalls serving cuisines from every corner of India! Live cooking demos, chef battles, and eating contests.', 'Juhu Beach', 'Mumbai', 'Maharashtra', 'India', '2025-08-15', '11:00', '22:00', 5000, 5000, 99.00,  'approved'),
(2, 7,  'Yoga & Wellness Summit',       'A holistic day of yoga sessions, Ayurveda workshops, meditation practices, and wellness talks by certified practitioners.', 'Leela Palace', 'Bangalore', 'Karnataka', 'India', '2025-08-10', '06:00', '14:00', 150, 150, 799.00,  'approved'),
(3, 8,  'BYJU\'S Education Conclave',   'The future of education — panel discussions on EdTech, NEP 2020, hybrid learning models, and student-centric pedagogy.', 'Hyatt Regency', 'Chennai', 'Tamil Nadu', 'India', '2025-09-05', '09:00', '17:00', 400, 400, 599.00,  'approved'),
(2, 9,  'Stand-Up Comedy Night',        '4 of India\'s hottest comedians take the stage for a 2-hour laughter riot you won\'t forget!', 'Canvas Laugh Club', 'Mumbai', 'Maharashtra', 'India', '2025-07-18', '20:00', '22:30', 250, 250, 699.00,  'approved'),
(3, 1,  'Sufi Night Under the Stars',   'An enchanting evening of Sufi music, ghazals, and qawwali performed by maestros from Rajasthan and Punjab.', 'Amer Fort Lawns', 'Jaipur', 'Rajasthan', 'India', '2025-08-22', '19:30', '23:00', 350, 350, 1299.00, 'approved');

-- ── Seats for each event ─────────────────────────────────────
-- Each event gets 10 rows A-J × seats_per_row
-- VIP = Row A (price * 1.5), Premium = Row B (price * 1.2), rest Standard
DROP PROCEDURE IF EXISTS generate_seats_for_all;
DELIMITER //

CREATE PROCEDURE generate_seats_for_all()
BEGIN
  DECLARE ev_id INT;
  DECLARE base_price DECIMAL(10,2);
  DECLARE total_s INT;
  DECLARE done INT DEFAULT 0;
  DECLARE cur CURSOR FOR SELECT id, ticket_price, total_seats FROM events;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  ev_loop: LOOP
    FETCH cur INTO ev_id, base_price, total_s;
    IF done THEN LEAVE ev_loop; END IF;

    SET @row = 0;
    SET @generated = 0;

    WHILE @generated < total_s AND @row < 26 DO
      SET @row_label = CHAR(65 + @row); -- A, B, C...
      SET @seats_in_row = 10;
      IF @generated + @seats_in_row > total_s THEN
        SET @seats_in_row = total_s - @generated;
      END IF;

      SET @seat_num = 1;
      WHILE @seat_num <= @seats_in_row DO
        SET @code = CONCAT(@row_label, @seat_num);
        SET @type = IF(@row = 0, 'vip', IF(@row = 1, 'premium', 'standard'));
        SET @price = IF(@row = 0, ROUND(base_price * 1.5, 2), IF(@row = 1, ROUND(base_price * 1.2, 2), base_price));

        INSERT INTO seats (event_id, row_label, seat_number, seat_code, seat_type, price, status)
        VALUES (ev_id, @row_label, @seat_num, @code, @type, @price, 'available');

        SET @seat_num = @seat_num + 1;
        SET @generated = @generated + 1;
      END WHILE;

      SET @row = @row + 1;
    END WHILE;
  END LOOP;
  CLOSE cur;
END //

DELIMITER ;
CALL generate_seats_for_all();
DROP PROCEDURE IF EXISTS generate_seats_for_all;

SELECT CONCAT('✅ Seed complete! ', COUNT(*), ' seats generated.') AS result FROM seats;
