CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id),
                            name VARCHAR(100) NOT NULL,
                            type VARCHAR(20) NOT NULL,
                            archived BOOLEAN NOT NULL DEFAULT FALSE,
                            UNIQUE(user_id, name, type)
);
