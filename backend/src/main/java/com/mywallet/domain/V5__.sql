ALTER TABLE users
    ADD name VARCHAR(255);

ALTER TABLE users
    ADD password_hash VARCHAR(255);

ALTER TABLE users
    ALTER COLUMN name SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;

ALTER TABLE users
    DROP COLUMN username;