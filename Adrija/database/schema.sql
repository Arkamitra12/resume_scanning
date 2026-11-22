

 
CREATE TABLE IF NOT EXISTS jobs (

    job_id SERIAL PRIMARY KEY,

    title VARCHAR(150) NOT NULL,

    description TEXT NOT NULL,

    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,

    status VARCHAR(20) NOT NULL DEFAULT 'open',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT chk_job_status

        CHECK (status IN ('open', 'closed')),
 
    CONSTRAINT chk_required_skills_array

        CHECK (jsonb_typeof(required_skills) = 'array')

);
 
 
-- 2. CANDIDATES TABLE

-- Owner: Person A (Backend + Database)
 
CREATE TABLE IF NOT EXISTS candidates (

    candidate_id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);
 
 
-- 3. APPLICATIONS TABLE

-- Owner: Person A (Backend + Database)

-- Connects candidates with jobs.
 
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
 
 
-- 4. SCREENING_RESULTS TABLE

-- Owner: Person A + Person B

-- Person B: AI integration

-- Person A: Database persistence

--

-- Stores the structured output returned by the AI model.

-- Multiple screening records are allowed for one application

-- so that previous AI results are not overwritten.
 
CREATE TABLE IF NOT EXISTS screening_results (

    screening_id SERIAL PRIMARY KEY,
 
    application_id INTEGER NOT NULL,
 
    extracted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
 
    requirement_checks JSONB NOT NULL DEFAULT '[]'::jsonb,
 
    summary TEXT NOT NULL,
 
    interview_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
 
    review_status VARCHAR(20) NOT NULL DEFAULT 'pending',
 
    model_name VARCHAR(150),
 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_screening_application

        FOREIGN KEY (application_id)

        REFERENCES applications(application_id)

        ON DELETE CASCADE,
 
    CONSTRAINT chk_review_status

        CHECK (review_status = 'pending'),
 
    CONSTRAINT chk_extracted_skills_array

        CHECK (jsonb_typeof(extracted_skills) = 'array'),
 
    CONSTRAINT chk_requirement_checks_array

        CHECK (jsonb_typeof(requirement_checks) = 'array'),
 
    CONSTRAINT chk_interview_questions_array

        CHECK (jsonb_typeof(interview_questions) = 'array')

);
 
 
-- 5. REVIEW_ACTIONS TABLE

-- Owner: Person A (Backend + Database)

-- Stores human recruiter decisions.

-- AI does not make the final recruitment decision.
 
CREATE TABLE IF NOT EXISTS review_actions (

    review_id SERIAL PRIMARY KEY,
 
    application_id INTEGER NOT NULL,
 
    reviewer VARCHAR(150) NOT NULL,
 
    decision VARCHAR(30) NOT NULL,
 
    notes TEXT,
 
    ai_useful BOOLEAN,
 
    correction_notes TEXT,
 
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
 
 
-- ============================================================

-- INDEXES

-- Improve commonly used lookup operations.

-- ============================================================
 
CREATE INDEX IF NOT EXISTS idx_applications_job_id

    ON applications(job_id);
 
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id

    ON applications(candidate_id);
 
CREATE INDEX IF NOT EXISTS idx_applications_status

    ON applications(status);
 
CREATE INDEX IF NOT EXISTS idx_screening_application_id

    ON screening_results(application_id);
 
CREATE INDEX IF NOT EXISTS idx_review_application_id

    ON review_actions(application_id);
 
 
