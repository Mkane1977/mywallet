-- Remove old username column
ALTER TABLE users
DROP COLUMN IF EXISTS username;

-- Add name column (required)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add password hash column
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Make name NOT NULL
ALTER TABLE users
    ALTER COLUMN name SET NOT NULL;

-- Make password_hash NOT NULL
ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;

-- Ensure enabled has default true
ALTER TABLE users
    ALTER COLUMN enabled SET DEFAULT TRUE;
