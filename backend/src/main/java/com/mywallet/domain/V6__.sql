ALTER TABLE users
    ADD password VARCHAR(255);

ALTER TABLE users
    ALTER COLUMN password SET NOT NULL;

ALTER TABLE users
    DROP COLUMN password_hash;

ALTER TABLE users
    ALTER COLUMN name SET NOT NULL;