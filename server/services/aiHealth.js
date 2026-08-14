import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;


function cleanJson(text) {

  const cleaned = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start =
    cleaned.indexOf('{');

  const end =
    cleaned.lastIndexOf('}');

  if (
    start === -1 ||
    end === -1
  ) {
    throw new Error(
      'AI did not return valid JSON'
    );
  }

  return JSON.parse(
    cleaned.slice(
      start,
      end + 1
    )
  );
}


export async function generateHealthExplanation({

  findings = [],

  summary = '',

  profile = {}

}) {

  // ----------------------------------------------------------
  // If API key is not configured,
  // keep the existing analyzer working.
  // ----------------------------------------------------------

  if (!client) {

    console.warn(
      'OPENAI_API_KEY not configured. AI disabled.'
    );

    return {

      enabled: false,

      summary,

      explanations: []

    };
  }


  // ----------------------------------------------------------
  // Only send structured report findings to AI.
  // ----------------------------------------------------------

  const safeFindings =
    findings.map(item => ({

      parameter:
        item.parameter,

      value:
        item.value,

      unit:
        item.unit,

      referenceRange:
        item.referenceRange,

      status:
        item.status

    }));


  // ----------------------------------------------------------
  // AI INSTRUCTIONS
  // ----------------------------------------------------------

  const instructions = `
You are the AI explanation layer
of a college software prototype
called DailyMeds.

Your job is to explain laboratory
report findings in simple,
educational language.

IMPORTANT SAFETY RULES:

1. Do not diagnose diseases.

2. Do not prescribe medicines.

3. Do not calculate personalized
   medicine doses.

4. Never tell the user that they
   definitely "need" a medicine.

5. Never invent laboratory values.

6. Never invent a reference range.

7. Use only the values and reference
   ranges supplied in the input.

8. If the reference range is missing,
   say that it is missing.

9. Product names may only be mentioned
   as catalogue products "for review".

10. Do not recommend high-dose
    supplementation.

11. Encourage professional review
    when a result is abnormal,
    unclear, or potentially important.

12. Keep explanations understandable
    to a normal user.

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "short overall explanation",

  "explanations": [
    {
      "parameter": "parameter name",

      "status":
        "low | high | normal | review",

      "simpleExplanation":
        "simple explanation",

      "whyItMatters":
        "general educational context",

      "nextStep":
        "safe next step",

      "productForReview":
        "catalogue product or null"
    }
  ]
}
`;


  // ----------------------------------------------------------
  // USER DATA
  // ----------------------------------------------------------

  const safeProfile = {

    age:
      profile?.age,

    height:
      profile?.height,

    weight:
      profile?.weight,

    allergies:
      profile?.allergies,

    conditions:
      profile?.conditions,

    currentMedicines:
      profile?.currentMedicines

  };


  // ----------------------------------------------------------
  // PROMPT
  // ----------------------------------------------------------

  const input = `
Report summary:

${summary}


Laboratory findings:

${JSON.stringify(
  safeFindings,
  null,
  2
)}


User profile:

${JSON.stringify(
  safeProfile,
  null,
  2
)}
`;


  // ----------------------------------------------------------
  // OPENAI REQUEST
  // ----------------------------------------------------------

  const response =
    await client.responses.create({

      model:
        process.env.OPENAI_MODEL ||
        'gpt-5-mini',

      instructions,

      input,

      store: false

    });


  // ----------------------------------------------------------
  // PARSE RESPONSE
  // ----------------------------------------------------------

  const result =
    cleanJson(
      response.output_text
    );


  return {

    enabled: true,

    summary:
      result.summary || summary,

    explanations:
      Array.isArray(
        result.explanations
      )
        ? result.explanations
        : []

  };

}
