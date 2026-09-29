const { GoogleGenAI } = require('@google/genai');

/**
 * Gemini Service for Device Diagnostic Analysis
 * Handles multimodal analysis (text + optional image) using Google Gemini API.
 */
async function analyzeDevice({ itemType, issue, category, city, imageData }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured or empty.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const systemPrompt = `You are an expert repair technician and e-waste circular economy diagnostic assistant for India.
Analyze the provided device, reported problem, and optional image.

Analyze and return ONLY a valid JSON object matching this exact schema:
{
  "deviceType": "String (e.g. iPhone 13, Dell Laptop)",
  "category": "Electronics & Phones | Appliances | Bicycles | Furniture",
  "possibleFault": "String (concise description of likely fault)",
  "affectedComponent": "String (main component involved)",
  "severity": "Low | Medium | High | Critical",
  "repairability": "REPAIR | INSPECT | RECYCLE",
  "reason": "String (brief technical justification)",
  "estimatedRepairCostMin": "String in INR (e.g. ₹500)",
  "estimatedRepairCostMax": "String in INR (e.g. ₹1,500)",
  "estimatedRepairTime": "String (e.g. 1-2 hours or 1-2 days)",
  "recommendedAction": "String (clear advice for customer)",
  "safetyWarning": "String (safety caution for handling)",
  "confidence": "String (e.g. 90%)"
}

Critical Guidelines:
1. "repairability" MUST strictly be one of: "REPAIR", "INSPECT", or "RECYCLE".
   - Use "RECYCLE" if repair cost would exceed item value, if parts are obsolete, or if water/fire damage is catastrophic.
   - Use "INSPECT" if internal testing or disassembly is required.
   - Use "REPAIR" if standard modular repair or component fix is viable.
2. Use Indian Rupees (₹) for costs.
3. Do NOT invent technician names or company names.
`;

  const userPrompt = `Device / Model: ${itemType}
Observed Issue: ${issue}
Category: ${category || 'Electronics & Phones'}
City / Location: ${city || 'Mumbai'}`;

  const contents = [];

  if (imageData && typeof imageData === 'string') {
    let mimeType = 'image/jpeg';
    let base64Data = imageData;

    if (imageData.startsWith('data:')) {
      const matches = imageData.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    contents.push({
      inlineData: {
        mimeType,
        data: base64Data
      }
    });
  }

  contents.push(systemPrompt + '\n\n' + userPrompt);

  let response;
  const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-3.1-pro-preview', 'gemini-2.0-flash-001'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseMimeType: 'application/json'
        }
      });
      if (response && response.text) {
        break;
      }
    } catch (err) {
      console.warn(`Gemini model ${modelName} failed:`, err.message || err);
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error('All Gemini model invocations failed');
  }

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Empty response received from Gemini API');
  }

  let parsed;
  try {
    const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON output from Gemini API: ${err.message}`);
  }

  const rawRepairability = (parsed.repairability || 'INSPECT').toUpperCase();
  const validRepairability = ['REPAIR', 'INSPECT', 'RECYCLE'].includes(rawRepairability)
    ? rawRepairability
    : 'INSPECT';

  return {
    deviceType: parsed.deviceType || itemType,
    category: parsed.category || category || 'Electronics & Phones',
    possibleFault: parsed.possibleFault || 'Requires physical diagnostic inspection',
    affectedComponent: parsed.affectedComponent || 'Internal Hardware',
    severity: parsed.severity || 'Medium',
    repairability: validRepairability,
    reason: parsed.reason || 'Based on reported symptom analysis.',
    estimatedRepairCostMin: parsed.estimatedRepairCostMin || '₹499',
    estimatedRepairCostMax: parsed.estimatedRepairCostMax || '₹1,499',
    estimatedRepairTime: parsed.estimatedRepairTime || '1-2 days',
    recommendedAction: parsed.recommendedAction || 'Schedule inspection with a local certified technician.',
    safetyWarning: parsed.safetyWarning || 'Ensure device is unplugged before inspection.',
    confidence: parsed.confidence || '88%'
  };
}

module.exports = { analyzeDevice };
