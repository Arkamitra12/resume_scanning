-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'candidate',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role
        CHECK (role IN ('candidate', 'recruiter'))
);

-- 2. Add user link to candidates
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- 3. Add recruiter link to jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS created_by INTEGER;

-- 4. Add reviewer user link to review_actions
ALTER TABLE review_actions
ADD COLUMN IF NOT EXISTS reviewer_user_id INTEGER;

-- 5. Add foreign keys safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_candidates_user'
    ) THEN
        ALTER TABLE candidates
        ADD CONSTRAINT fk_candidates_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_jobs_created_by'
    ) THEN
        ALTER TABLE jobs
        ADD CONSTRAINT fk_jobs_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_review_actions_reviewer_user'
    ) THEN
        ALTER TABLE review_actions
        ADD CONSTRAINT fk_review_actions_reviewer_user
        FOREIGN KEY (reviewer_user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT;
    END IF;
END $$;

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_candidates_user_id
ON candidates(user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_created_by
ON jobs(created_by);

CREATE INDEX IF NOT EXISTS idx_review_actions_reviewer_user_id
ON review_actions(reviewer_user_id);