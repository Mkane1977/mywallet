CREATE TABLE transactions (
                              id BIGSERIAL PRIMARY KEY,
                              user_id BIGINT NOT NULL REFERENCES users(id),
                              category_id BIGINT NOT NULL REFERENCES categories(id),
                              txn_date DATE NOT NULL,
                              amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
                              direction VARCHAR(20) NOT NULL,
                              note VARCHAR(255),
                              created_at TIMESTAMP DEFAULT now()
);
