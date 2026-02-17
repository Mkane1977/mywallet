ALTER TABLE users
    ADD password_hash VARCHAR(255);

ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;