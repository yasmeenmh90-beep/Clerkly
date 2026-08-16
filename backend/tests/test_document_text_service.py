from io import BytesIO

import pytest
from docx import Document
from fastapi import HTTPException
from pypdf import PdfWriter
from pypdf.generic import (
    DecodedStreamObject,
    DictionaryObject,
    NameObject,
)

from app.services.document_text_service import (
    extract_text_from_file,
)


def create_docx_bytes(text: str) -> bytes:
    document = Document()

    if text:
        document.add_paragraph(text)

    output = BytesIO()
    document.save(output)

    return output.getvalue()


def create_pdf_bytes(text: str) -> bytes:
    writer = PdfWriter()

    page = writer.add_blank_page(
        width=612,
        height=792,
    )

    font = DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/Type1"),
            NameObject("/BaseFont"): NameObject("/Helvetica"),
        }
    )

    font_reference = writer._add_object(font)

    page[NameObject("/Resources")] = DictionaryObject(
        {
            NameObject("/Font"): DictionaryObject(
                {
                    NameObject("/F1"): font_reference,
                }
            ),
        }
    )

    content_stream = DecodedStreamObject()
    content_stream.set_data(
        (
            "BT /F1 12 Tf 72 720 Td "
            f"({text}) Tj ET"
        ).encode("utf-8")
    )

    page[NameObject("/Contents")] = writer._add_object(
        content_stream
    )

    output = BytesIO()
    writer.write(output)

    return output.getvalue()


def test_extracts_text_from_txt():
    result = extract_text_from_file(
        filename="renewal.txt",
        raw_content=b"Renewal fee of AED 350 is required.",
    )

    assert result == "Renewal fee of AED 350 is required."


def test_extracts_text_from_docx():
    result = extract_text_from_file(
        filename="renewal.docx",
        raw_content=create_docx_bytes(
            "Vehicle registration renewal"
        ),
    )

    assert result == "Vehicle registration renewal"


def test_extracts_text_from_pdf():
    result = extract_text_from_file(
        filename="renewal.pdf",
        raw_content=create_pdf_bytes(
            "Vehicle registration renewal"
        ),
    )

    assert "Vehicle registration renewal" in result


def test_empty_docx_returns_400():
    with pytest.raises(HTTPException) as exception:
        extract_text_from_file(
            filename="empty.docx",
            raw_content=create_docx_bytes(""),
        )

    assert exception.value.status_code == 400
    assert exception.value.detail == (
        "No readable text was found in the document"
    )


def test_invalid_pdf_returns_400():
    with pytest.raises(HTTPException) as exception:
        extract_text_from_file(
            filename="invalid.pdf",
            raw_content=b"not a real PDF",
        )

    assert exception.value.status_code == 400
    assert exception.value.detail == (
        "Unable to read the PDF document"
    )