CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       username VARCHAR(255),
                       enabled BOOLEAN NOT NULL DEFAULT TRUE
);
