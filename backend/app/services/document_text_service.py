from io import BytesIO
from pathlib import Path

from docx import Document
from fastapi import HTTPException
from pypdf import PdfReader


SUPPORTED_EXTENSIONS = {
    ".txt",
    ".pdf",
    ".docx",
}


def extract_text_from_file(
    filename: str,
    raw_content: bytes,
) -> str:
    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported document type. "
                "Supported types are: .txt, .pdf and .docx"
            ),
        )

    if extension == ".txt":
        return extract_text_from_txt(raw_content)

    if extension == ".pdf":
        return extract_text_from_pdf(raw_content)

    return extract_text_from_docx(raw_content)


def extract_text_from_txt(
    raw_content: bytes,
) -> str:
    try:
        text = raw_content.decode("utf-8")
    except UnicodeDecodeError as error:
        raise HTTPException(
            status_code=400,
            detail="Text document must use UTF-8 encoding",
        ) from error

    return validate_extracted_text(text)


def extract_text_from_pdf(
    raw_content: bytes,
) -> str:
    try:
        reader = PdfReader(BytesIO(raw_content))

        text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the PDF document",
        ) from error

    return validate_extracted_text(text)


def extract_text_from_docx(
    raw_content: bytes,
) -> str:
    try:
        document = Document(BytesIO(raw_content))

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the DOCX document",
        ) from error

    return validate_extracted_text(text)


def validate_extracted_text(text: str) -> str:
    cleaned_text = text.strip()

    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in the document",
        )

    return cleaned_text