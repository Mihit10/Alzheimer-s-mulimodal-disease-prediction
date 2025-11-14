import os
import json
import base64
from dotenv import load_dotenv
from groq import Groq
from PIL import Image

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class MedicalBloodReportExtractor:
    def __init__(self, model_name="meta-llama/llama-4-maverick-17b-128e-instruct"):
        self.model_name = model_name

    def encode_image(self, image_path):
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def extract(self, image_path):
        b64_image = self.encode_image(image_path)

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

        response = client.chat.completions.create(
    model=self.model_name,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_image}"}}
            ]
        }
    ],
    temperature=0,
    max_tokens=4096,
)


        import re

        raw = response.choices[0].message.content.strip()

        # Clean code fences if model returns ```json ... ```
        raw_clean = re.sub(r"^```(?:json)?", "", raw)
        raw_clean = re.sub(r"```$", "", raw_clean)
        raw_clean = raw_clean.strip()

        try:
            return json.loads(raw_clean)
        except Exception:
            print("\n❌ RAW OUTPUT:\n", raw)
            print("\n❌ CLEANED OUTPUT:\n", raw_clean)
            raise


# Usage
if __name__ == "__main__":
    image_path = "1.png"
    extractor = MedicalBloodReportExtractor()
    result = extractor.extract(image_path)

    print(json.dumps(result, indent=2, ensure_ascii=False))

