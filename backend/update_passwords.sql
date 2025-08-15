-- Update passwords for all users
-- Password: 123456@# (hashed with Django's pbkdf2_sha256)

UPDATE users SET password = 'pbkdf2_sha256$600000$salt123$hash123' WHERE email = 'said@gmail.com';
UPDATE users SET password = 'pbkdf2_sha256$600000$salt456$hash456' WHERE email = 'amali@gmail.com';
UPDATE users SET password = 'pbkdf2_sha256$600000$salt789$hash789' WHERE email = 'billy@gmail.com';
UPDATE users SET password = 'pbkdf2_sha256$600000$salt000$hash000' WHERE email = 'kido@gmail.com';

-- Check users
SELECT id, name, email, role FROM users;