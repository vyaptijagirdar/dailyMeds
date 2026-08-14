# DailyMeds — Step 3: Medical Report Intelligence

This step adds a real report pipeline to the Step 2 full-stack app:

- Real React → Express API connection
- PDF text extraction using pdf-parse
- JPG/PNG OCR using Tesseract.js
- Structured extraction for Vitamin B12, Vitamin D, Magnesium, Hemoglobin and Glucose
- Reference-range comparison when a range is visible in the report
- Report results stored against the authenticated user
- Safety language: this step does not diagnose or prescribe doses

## 1. Backend

```bash
cd server
npm install
npm run dev
```

Keep MongoDB running and keep `server/.env` from Step 2.

## 2. Frontend

From the project root in another terminal:

```bash
npm install
npm run dev
```

Optional root `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Test with a sample report

Use a text-based PDF or clear image containing lines such as:

Vitamin B12 180 pg/mL Reference Range: 200 - 900
Vitamin D 16 ng/mL Reference Range: 30 - 100
Magnesium 1.9 mg/dL Reference Range: 1.7 - 2.2

The app should extract the value, unit, reference range and status.

## Safety note

This is a college-project prototype. Extraction and range comparison are not medical advice, diagnosis, or prescribing. A production healthcare system requires validated clinical rules, professional review, privacy/security controls, regulatory compliance, and medicine-specific safeguards.
