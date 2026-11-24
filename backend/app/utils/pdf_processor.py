
from pypdf import PdfReader
from io import BytesIO


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def extract_resume_text(file_content: bytes) -> str:

    if not file_content:
        raise ValueError("Uploaded file is empty")

    if len(file_content) > MAX_FILE_SIZE:
        raise ValueError("Resume file must not exceed 5 MB")

    if not file_content.startswith(b"%PDF-"):
        raise ValueError("Only valid PDF files are allowed")

    try:
        pdf_reader = PdfReader(BytesIO(file_content))

        if len(pdf_reader.pages) == 0:
            raise ValueError("PDF contains no pages")

        extracted_text = ""

        for page in pdf_reader.pages:
            extracted_text += page.extract_text() or ""

        if not extracted_text.strip():
            raise ValueError(
                "Unable to extract readable text from the PDF"
            )

        return extracted_text.strip()

    except ValueError:
        raise

    except Exception:
        raise ValueError("Invalid or unreadable PDF file")
