
import asyncio
import pytest

from app.services.screening_service import screen_resume


# ==========================================================
# JOB 1: SOFTWARE DEVELOPER
# ==========================================================

SOFTWARE_JOB_DESCRIPTION = """
We are hiring a Junior Software Developer.

The candidate should have:
- Python programming
- SQL
- FastAPI
- REST API development
- React

The candidate should understand backend development
and basic frontend development.
"""

SOFTWARE_REQUIRED_SKILLS = [
    "Python",
    "SQL",
    "FastAPI",
    "REST APIs",
    "React"
]


# ==========================================================
# JOB 2: DATA ANALYST
# ==========================================================

DATA_ANALYST_JOB_DESCRIPTION = """
We are hiring a Junior Data Analyst.

The candidate should have:
- Python programming
- SQL
- Power BI
- Excel
- Data analysis

The candidate should be able to clean datasets,
analyze information and prepare reports.
"""

DATA_ANALYST_REQUIRED_SKILLS = [
    "Python",
    "SQL",
    "Power BI",
    "Excel",
    "Data Analysis"
]


# ==========================================================
# JOB 3: COOK
# ==========================================================

COOK_JOB_DESCRIPTION = """
We are hiring a Cook.

The candidate should have:
- Food preparation
- Cooking techniques
- Kitchen hygiene
- Menu planning

The candidate should understand kitchen operations
and food safety practices.
"""

COOK_REQUIRED_SKILLS = [
    "Food Preparation",
    "Cooking Techniques",
    "Kitchen Hygiene",
    "Menu Planning"
]


# ==========================================================
# 12 CANDIDATE TEST SCENARIOS
# ==========================================================

TEST_SCENARIOS = [

    # ------------------------------------------------------
    # SOFTWARE DEVELOPER CANDIDATES
    # ------------------------------------------------------

    {
        "name": "Software - Strong Candidate",
        "resume": """
        Name: Alex Morgan

        Skills:
        Python, SQL, FastAPI, REST APIs, React, HTML, CSS, Git.

        Experience:
        Developed backend applications using Python and FastAPI.
        Created REST APIs and connected applications to SQL databases.
        Built frontend interfaces using React.
        Completed full-stack development projects.
        """,
        "job_description": SOFTWARE_JOB_DESCRIPTION,
        "required_skills": SOFTWARE_REQUIRED_SKILLS
    },

    {
        "name": "Software - Partial Candidate",
        "resume": """
        Name: Jamie Smith

        Skills:
        Python, SQL, HTML, CSS, JavaScript.

        Experience:
        Worked on Python programming projects.
        Used SQL queries to retrieve and manage data.
        Created basic frontend pages using HTML and CSS.
        No demonstrated experience with FastAPI or React.
        """,
        "job_description": SOFTWARE_JOB_DESCRIPTION,
        "required_skills": SOFTWARE_REQUIRED_SKILLS
    },

    {
        "name": "Software - Weak Candidate",
        "resume": """
        Name: Taylor Brown

        Skills:
        HTML, CSS, JavaScript.

        Experience:
        Created static websites using HTML and CSS.
        Has basic knowledge of JavaScript.
        No demonstrated experience with Python, SQL,
        FastAPI, REST API development or React.
        """,
        "job_description": SOFTWARE_JOB_DESCRIPTION,
        "required_skills": SOFTWARE_REQUIRED_SKILLS
    },

    {
        "name": "Software - Unrelated Candidate",
        "resume": """
        Name: Morgan Davis

        Skills:
        Accounting, Financial Reporting, Taxation,
        Bookkeeping and Invoice Management.

        Experience:
        Worked as an accountant for three years.
        Prepared financial statements and managed accounts.
        No demonstrated software development experience.
        """,
        "job_description": SOFTWARE_JOB_DESCRIPTION,
        "required_skills": SOFTWARE_REQUIRED_SKILLS
    },

    # ------------------------------------------------------
    # DATA ANALYST CANDIDATES
    # ------------------------------------------------------

    {
        "name": "Data Analyst - Strong Candidate",
        "resume": """
        Name: Priya Sharma

        Skills:
        Python, SQL, Power BI, Excel, Data Analysis.

        Experience:
        Analyzed business datasets using Python and SQL.
        Created interactive dashboards using Power BI.
        Used advanced Excel functions and pivot tables.
        Cleaned datasets and prepared analytical reports.
        """,
        "job_description": DATA_ANALYST_JOB_DESCRIPTION,
        "required_skills": DATA_ANALYST_REQUIRED_SKILLS
    },

    {
        "name": "Data Analyst - Partial Candidate",
        "resume": """
        Name: Rahul Verma

        Skills:
        Python, SQL, Excel.

        Experience:
        Used Python for basic data cleaning.
        Wrote SQL queries to retrieve information.
        Used Excel formulas and charts for reporting.
        No demonstrated Power BI experience.
        Limited data analysis project experience.
        """,
        "job_description": DATA_ANALYST_JOB_DESCRIPTION,
        "required_skills": DATA_ANALYST_REQUIRED_SKILLS
    },

    {
        "name": "Data Analyst - Weak Candidate",
        "resume": """
        Name: Neha Roy

        Skills:
        MS Word, PowerPoint, Communication.

        Experience:
        Prepared presentations and maintained documents.
        Has basic computer knowledge.
        No demonstrated experience with Python, SQL,
        Power BI, Excel or data analysis.
        """,
        "job_description": DATA_ANALYST_JOB_DESCRIPTION,
        "required_skills": DATA_ANALYST_REQUIRED_SKILLS
    },

    {
        "name": "Data Analyst - Unrelated Candidate",
        "resume": """
        Name: Sam Wilson

        Skills:
        Cooking, Food Preparation, Kitchen Management.

        Experience:
        Worked in restaurant kitchen operations.
        Prepared food and maintained kitchen hygiene.
        No demonstrated data analysis experience.
        """,
        "job_description": DATA_ANALYST_JOB_DESCRIPTION,
        "required_skills": DATA_ANALYST_REQUIRED_SKILLS
    },

    # ------------------------------------------------------
    # COOK CANDIDATES
    # ------------------------------------------------------

    {
        "name": "Cook - Strong Candidate",
        "resume": """
        Name: Jordan Lee

        Skills:
        Food Preparation, Cooking Techniques,
        Kitchen Hygiene, Menu Planning.

        Experience:
        Worked as a Cook for three years in a restaurant.
        Experienced in food preparation and different
        cooking techniques.
        Maintained kitchen hygiene and food safety standards.
        Assisted in menu planning and kitchen operations.
        """,
        "job_description": COOK_JOB_DESCRIPTION,
        "required_skills": COOK_REQUIRED_SKILLS
    },

    {
        "name": "Cook - Partial Candidate",
        "resume": """
        Name: Chris Martin

        Skills:
        Food Preparation, Cooking Techniques.

        Experience:
        Worked as a kitchen assistant for one year.
        Assisted chefs with food preparation.
        Experienced in basic cooking techniques.
        Limited experience with menu planning and
        kitchen hygiene responsibilities.
        """,
        "job_description": COOK_JOB_DESCRIPTION,
        "required_skills": COOK_REQUIRED_SKILLS
    },

    {
        "name": "Cook - Weak Candidate",
        "resume": """
        Name: Daniel Thomas

        Skills:
        Customer Service, Sales, Communication.

        Experience:
        Worked as a retail sales assistant.
        Handled customers and maintained sales records.
        No demonstrated cooking or kitchen experience.
        """,
        "job_description": COOK_JOB_DESCRIPTION,
        "required_skills": COOK_REQUIRED_SKILLS
    },

    {
        "name": "Cook - Unrelated Candidate",
        "resume": """
        Name: Robin Das

        Skills:
        Python, SQL, FastAPI, React, REST APIs.

        Experience:
        Worked as a junior software developer.
        Developed web applications and REST APIs.
        No demonstrated food preparation or cooking experience.
        """,
        "job_description": COOK_JOB_DESCRIPTION,
        "required_skills": COOK_REQUIRED_SKILLS
    }
]


# ==========================================================
# HELPER FUNCTION
# ==========================================================

def run_screening(resume, job_description, required_skills):

    return asyncio.run(
        screen_resume(
            resume_text=resume,
            job_description=job_description,
            required_skills=required_skills
        )
    )


# ==========================================================
# VALIDATE SCREENING RESULT
# ==========================================================

def validate_screening_result(result, required_skills):

    # Screening must remain pending for human review
    assert result.review_status == "pending"

    # Extracted skills should be returned
    assert isinstance(result.extracted_skills, list)

    # Every required skill must have one requirement check
    assert len(result.requirement_checks) == len(required_skills)

    returned_requirements = [
        check.requirement for check in result.requirement_checks
    ]

    assert len(set(returned_requirements)) == len(required_skills)

    assert set(returned_requirements) == set(required_skills)

    # Validate requirement statuses
    valid_statuses = {"supported", "not_found", "unclear"}

    for check in result.requirement_checks:
        assert check.status.value in valid_statuses

    # Validate interview questions
    assert 2 <= len(result.interview_questions) <= 3

    # Validate match percentage
    assert 0 <= result.match_percentage <= 100

    # Independently verify percentage calculation
    score = 0

    for check in result.requirement_checks:

        if check.status.value == "supported":
            score += 1

        elif check.status.value == "unclear":
            score += 0.5

    expected_percentage = round(
        (score / len(required_skills)) * 100,
        2
    )

    assert result.match_percentage == expected_percentage


# ==========================================================
# PARAMETRIZED TEST: ALL 12 SCENARIOS
# ==========================================================

@pytest.mark.parametrize(
    "scenario",
    TEST_SCENARIOS,
    ids=[scenario["name"] for scenario in TEST_SCENARIOS]
)
def test_resume_screening_scenarios(scenario):

    result = run_screening(
        scenario["resume"],
        scenario["job_description"],
        scenario["required_skills"]
    )

    print("\n" + "=" * 65)
    print("SCENARIO:", scenario["name"])
    print("=" * 65)

    print(result.model_dump_json(indent=4))

    print("\nMATCH PERCENTAGE:", result.match_percentage, "%")

    validate_screening_result(
        result,
        scenario["required_skills"]
    )

    print("\nSCREENING TEST PASSED:", scenario["name"])
