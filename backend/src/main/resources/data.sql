-- Initial admin user; password will be set to Admin123! by an initializer if needed

INSERT INTO users (id, username, email, password_hash, full_name, role, enabled, email_verified)
VALUES (
    UUID_TO_BIN(UUID()),
    'admin@lms.local',
    'admin@lms.local',
    'INIT',
    'System Administrator',
    'ADMIN',
    true,
    true
);


