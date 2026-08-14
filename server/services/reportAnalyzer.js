const SUPPORTED = [
  {
    key: "vitaminB12",
    name: "Vitamin B12",
    patterns: ["Vitamin B12", "B12"]
  },
  {
    key: "vitaminD",
    name: "Vitamin D",
    patterns: ["25-OH Vitamin D", "Vitamin D", "25 OH Vitamin D"]
  },
  {
    key: "magnesium",
    name: "Magnesium",
    patterns: ["Magnesium"]
  },
  {
    key: "hemoglobin",
    name: "Hemoglobin",
    patterns: ["Hemoglobin", "Haemoglobin"]
  },
  {
    key: "glucose",
    name: "Fasting Blood Glucose",
    patterns: [
      "Fasting Blood Glucose",
      "Fasting Glucose",
      "Glucose"
    ]
  },
  {
    key: "calcium",
    name: "Calcium",
    patterns: ["Calcium"]
  }
];

/*
 * Units that are realistically used by the supported
 * laboratory parameters in this prototype.
 *
 * IMPORTANT:
 * We deliberately do NOT use [a-zA-Z]+ for the
 * reference unit because that was causing words such
 * as "Magnesium" and "Hemoglobin" to be interpreted
 * as units.
 */
const VALID_UNITS = [
  "pg/mL",
  "ng/mL",
  "mg/dL",
  "g/dL",
  "mmol/L",
  "mg/L",
  "µg/dL",
  "ug/dL",
  "µg/L",
  "ug/L",
  "IU/L",
  "mIU/L",
  "%",
  "mg",
  "g",
  "ng",
  "pg",
  "mmol",
  "µmol/L",
  "umol/L"
];

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[–—−]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unitRegex() {
  return `(?:${VALID_UNITS
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|")})`;
}


/*
 * Get the portion of the report belonging to one
 * parameter only.
 *
 * Example:
 *
 * Vitamin D 16 ng/mL 30 - 100 Magnesium 1.9 mg/dL 1.7 - 2.2
 *
 * Vitamin D section becomes:
 *
 * Vitamin D 16 ng/mL 30 - 100
 *
 * Magnesium section becomes:
 *
 * Magnesium 1.9 mg/dL 1.7 - 2.2
 *
 * This prevents one parameter from consuming the
 * next parameter's name.
 */
function getParameterSection(text, parameter) {

  const patternAlternatives = parameter.patterns
    .map(escapeRegex)
    .join("|");

  const startRegex = new RegExp(
    `(?:${patternAlternatives})`,
    "i"
  );

  const startMatch = startRegex.exec(text);

  if (!startMatch) {
    return null;
  }

  const startIndex = startMatch.index;

  let endIndex = text.length;

  /*
   * Find the next supported parameter after this one.
   */
  for (const otherParameter of SUPPORTED) {

    if (otherParameter.key === parameter.key) {
      continue;
    }

    for (const otherPattern of otherParameter.patterns) {

      const otherRegex = new RegExp(
        escapeRegex(otherPattern),
        "ig"
      );

      otherRegex.lastIndex =
        startIndex + startMatch[0].length;

      const nextMatch =
        otherRegex.exec(text);

      if (
        nextMatch &&
        nextMatch.index < endIndex
      ) {
        endIndex = nextMatch.index;
      }
    }
  }

  return text.slice(
    startIndex,
    endIndex
  );
}


function parseParameter(text, parameter) {

  /*
   * IMPORTANT:
   *
   * We parse only the section belonging to this
   * parameter. Therefore "Magnesium", "Hemoglobin",
   * "Fasting", etc. cannot accidentally become
   * reference units.
   */
  const section =
    getParameterSection(
      text,
      parameter
    );

  if (!section) {
    return null;
  }


  for (const pattern of parameter.patterns) {

    const escaped =
      escapeRegex(pattern);

    /*
     * Supported examples:
     *
     * Vitamin B12 Result: 180 pg/mL
     * Reference Range: 200 - 900 pg/mL
     *
     * Vitamin D: 16 ng/mL
     * 30 - 100 ng/mL
     *
     * Magnesium 1.9 mg/dL
     * Reference Range: 1.7 - 2.2 mg/dL
     */

    const regex = new RegExp(
      `${escaped}` +

      `(?:\\s*(?:Result|Value))?` +

      `\\s*[:\\-]?\\s*` +

      `(\\d+(?:\\.\\d+)?)` +

      `\\s*` +

      `(${unitRegex()})` +

      `(?:\\s*` +

      `(?:Reference\\s*(?:Range|Interval)|Normal\\s*Range|Ref\\.?\\s*Range)` +

      `)?` +

      `\\s*[:\\-]?\\s*` +

      `(\\d+(?:\\.\\d+)?)` +

      `\\s*-\\s*` +

      `(\\d+(?:\\.\\d+)?)` +

      `\\s*` +

      `(${unitRegex()})?`,

      "i"
    );


    const match =
      section.match(regex);


    if (match) {

      const value =
        Number(match[1]);

      const unit =
        match[2];

      const low =
        Number(match[3]);

      const high =
        Number(match[4]);

      /*
       * Use the reference-range unit when it exists.
       * Otherwise use the result unit.
       */
      const referenceUnit =
        match[5] || unit;


      let status = "within";


      if (value < low) {

        status = "below";

      } else if (value > high) {

        status = "above";

      }


      return {

        key:
          parameter.key,

        name:
          parameter.name,

        value,

        unit,

        referenceLow:
          low,

        referenceHigh:
          high,

        referenceUnit,

        status

      };
    }
  }

  return null;
}


export function analyzeReportText(rawText) {

  const text =
    normalizeText(rawText);


  const findings = [];


  for (const parameter of SUPPORTED) {

    const result =
      parseParameter(
        text,
        parameter
      );


    if (result) {

      findings.push(result);

    }
  }


  const outsideRange =
    findings.filter(
      item =>
        item.status === "below" ||
        item.status === "above"
    );


  return {

    extractedCount:
      findings.length,

    outsideRangeCount:
      outsideRange.length,

    findings,

    summary:

      findings.length === 0

        ? "No supported laboratory parameters were confidently detected."

        : `${findings.length} supported parameter(s) extracted; ${outsideRange.length} are outside the reference range shown in the report.`

  };
}