
-- ============================================================
-- AI RECRUITMENT AND RESUME SCREENING SYSTEM
-- FINAL DATABASE SCHEMA
-- PostgreSQL
-- ============================================================


-- 1. USERS TABLE

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


-- 2. JOBS TABLE

CREATE TABLE IF NOT EXISTS jobs (

    job_id SERIAL PRIMARY KEY,

    title VARCHAR(150) NOT NULL,

    description TEXT NOT NULL,

    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,

    status VARCHAR(20) NOT NULL DEFAULT 'open',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by INTEGER,

    CONSTRAINT chk_job_status
        CHECK (status IN ('open', 'closed')),

    CONSTRAINT chk_required_skills_array
        CHECK (jsonb_typeof(required_skills) = 'array'),

    CONSTRAINT fk_jobs_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT

);


-- 3. CANDIDATES TABLE

CREATE TABLE IF NOT EXISTS candidates (

    candidate_id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER UNIQUE,

    CONSTRAINT fk_candidates_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT

);


-- 4. APPLICATIONS TABLE

CREATE TABLE IF NOT EXISTS applications (

    application_id SERIAL PRIMARY KEY,

    job_id INTEGER NOT NULL,

    candidate_id INTEGER NOT NULL,

    resume_file_path TEXT NOT NULL,

    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(30) NOT NULL DEFAULT 'submitted',

    CONSTRAINT fk_application_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_application_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidates(candidate_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_job_candidate
        UNIQUE (job_id, candidate_id),

    CONSTRAINT chk_application_status
        CHECK (
            status IN (
                'submitted',
                'screening_failed',
                'screened',
                'reviewed'
            )
        )

);


-- 5. SCREENING_RESULTS TABLE
-- Multiple screening records are allowed per application.
-- Previous AI screening results are preserved.

CREATE TABLE IF NOT EXISTS screening_results (

    screening_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    extracted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,

    requirement_checks JSONB NOT NULL DEFAULT '[]'::jsonb,

    summary TEXT NOT NULL,

    interview_questions JSONB NOT NULL DEFAULT '[]'::jsonb,

    model_name VARCHAR(150),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    match_percentage DOUBLE PRECISION NOT NULL,

    CONSTRAINT fk_screening_application
        FOREIGN KEY (application_id)
        REFERENCES applications(application_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_extracted_skills_array
        CHECK (jsonb_typeof(extracted_skills) = 'array'),

    CONSTRAINT chk_requirement_checks_array
        CHECK (jsonb_typeof(requirement_checks) = 'array'),

    CONSTRAINT chk_interview_questions_array
        CHECK (jsonb_typeof(interview_questions) = 'array'),

    CONSTRAINT chk_match_percentage
        CHECK (
            match_percentage >= 0
            AND match_percentage <= 100
        )

);


-- 6. REVIEW_ACTIONS TABLE
-- One final recruiter review per application.

CREATE TABLE IF NOT EXISTS review_actions (

    review_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL UNIQUE,

    reviewer VARCHAR(150) NOT NULL,

    decision VARCHAR(30) NOT NULL,

    notes TEXT,

    reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_application
        FOREIGN KEY (application_id)
        REFERENCES applications(application_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_review_decision
        CHECK (
            decision IN (
                'proceed',
                'hold',
                'do_not_proceed'
            )
        )

);


-- 7. INDEXES

CREATE INDEX IF NOT EXISTS idx_jobs_created_by
    ON jobs(created_by);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
    ON applications(job_id);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id
    ON applications(candidate_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
    ON applications(status);

CREATE INDEX IF NOT EXISTS idx_screening_application_id
    ON screening_results(application_id);

-- candidates.user_id is UNIQUE and already has an index.
-- review_actions.application_id is UNIQUE and already has an index.
