# AI MarkSheet Parser Integration Guide

This guide describes how to integrate with the AI MarkSheet Parser API. The API provides deterministic extraction of marksheet data using OCR and Gemini models, including a Keccak-256 hash for data integrity.

## Base URL
The API is hosted locally by default at:
`http://localhost:8000`

## Endpoints

### 1. Parse MarkSheet
Extract structured JSON data from a marksheet image.

**URL**: `/parse-marksheet`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`

#### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | Binary | The image file (PNG/JPG) of the marksheet. |

#### Response Format (JSON)
The API returns a JSON object containing the extracted data and a cryptographic hash.

```json
{
  "name": "STUDENT NAME",
  "registration_no": "REG_12345",
  "subjects": [
    {
      "code": "CS101",
      "title": "Introduction to Programming",
      "credits": "3.0",
      "grade": "A"
    }
  ],
  "gpa": "3.85"
}


```

---

## Integration Examples

### Using cURL
```bash
curl -X POST "http://localhost:8000/parse-marksheet" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@/path/to/your/marksheet.png"
```

### Using Python (Requests)
```python
import requests

url = "http://localhost:8000/parse-marksheet"
image_path = "marksheet.png"

with open(image_path, "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)

if response.status_code == 200:
    data = response.json()
    print("Student Name:", data["name"])
    print("GPA:", data["gpa"])
    print("Keccak-256 Hash:", data["keccak256_hash"])
else:
    print("Error:", response.text)
```

### Using JavaScript (Fetch)
```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:8000/parse-marksheet", {
    method: "POST",
    body: formData
});

const result = await response.json();
console.log(result);
```

## Error Handling
The API returns standard HTTP status codes:
- `200 OK`: Success.
- `422 Unprocessable Entity`: Invalid file format or missing field.
- `500 Internal Server Error`: OCR or LLM extraction failure.
