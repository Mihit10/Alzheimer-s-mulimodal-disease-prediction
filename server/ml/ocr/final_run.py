import os
import json
import base64
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class MedicalBloodReportExtractor:
    def __init__(self, model_name="meta-llama/llama-4-maverick-17b-128e-instruct"):
        self.model_name = model_name

    def encode_file_bytes(self, file_bytes: bytes) -> str:
        """Convert file bytes -> base64 string"""
        return base64.b64encode(file_bytes).decode("utf-8")

    def extract_from_file(self, file_bytes: bytes):
        """Takes raw file bytes instead of image path"""
        b64_image = self.encode_file_bytes(file_bytes)

        prompt = """
You are a strict medical report OCR parser.
Extract ONLY fields actually visible in the image.
If a field is missing or unreadable, return "N/A".
Output valid JSON only. No extra text.

JSON FORMAT:
{
  "patient_information": {
    "name": "",
    "age": "",
    "gender": "",
    "lab_no": "",
    "report_date": "",
    "ref_by": ""
  },
  "report_information": {
    "report_status": "",
    "lab_name": "",
    "processed_at": ""
  },
  "test_results": [
    {
      "test_name": "",
      "result": "",
      "unit": "",
      "reference_range": ""
    }
  ],
  "diagnoses": [],
  "medications": [],
  "clinical_notes": [],
  "additional_information": {}
}
"""

        # Call Groq Vision model
        response = client.chat.completions.create(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{b64_image}"
                            }
                        },
                    ],
                }
            ],
            temperature=0,
            max_tokens=4096,
        )

        raw = response.choices[0].message.content.strip()

        # Remove ```json or ``` fences if present
        clean = re.sub(r"^```(?:json)?", "", raw)
        clean = re.sub(r"```$", "", clean)
        clean = clean.strip()

        # Convert to JSON
        try:
            return json.loads(clean)
        except Exception:
            print("\n❌ RAW OUTPUT:\n", raw)
            print("\n❌ CLEANED OUTPUT:\n", clean)
            raise
