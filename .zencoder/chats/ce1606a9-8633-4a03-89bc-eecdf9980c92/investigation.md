# Bug Investigation: Gemini REST API HTTP 404

## Bug Summary
Gemini REST API returning HTTP 404 errors after API key rotation. This is a MODEL/ENDPOINT mismatch issue, not a quota/auth issue.

## Current Implementation Analysis

### Current Code (server.js:127-198)
```javascript
async function analyzeWithGemini(logs) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };
  
  const resp = await fetch(url, { method: 'POST', ... });
}
```

### What's Correct ✓
1. Using `v1beta` endpoint
2. Using `gemini-pro` model name
3. Using fetch() directly (not SDK)
4. API key passed as query parameter
5. Request body structure is correct
6. Response parsing from `candidates[0].content.parts[0].text`

### Root Cause Analysis

**CRITICAL FINDING**: The current implementation is actually **CORRECT** according to Gemini REST API specifications. The HTTP 404 suggests one of these scenarios:

1. **Most Likely**: The implementation is actually fine, and the 404 was from a previous incorrect version OR the SDK (line 4-26) interfering
2. **Possible**: Model name needs verification (could be `gemini-1.0-pro` instead of `gemini-pro`)
3. **Edge Case**: URL construction issue with template literal

## Affected Components
- `backend/server.js` - `analyzeWithGemini()` function (lines 127-198)
- Unused SDK import on line 4 and instantiation on line 26 (should be removed)

## Proposed Solution

### Option 1: Clean Implementation (RECOMMENDED)
```javascript
async function analyzeWithGemini(logs) {
  try {
    const prompt = `[EXISTING PROMPT]`;

    // CRITICAL: v1beta endpoint with gemini-pro model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      console.error('Gemini REST HTTP error:', resp.status, resp.statusText);
      return getFallbackAnalysis(`HTTP ${resp.status}`);
    }

    const json = await resp.json();
    const candidates = json?.candidates;
    
    if (!candidates || candidates.length === 0) {
      console.error('Gemini REST: no candidates', json);
      return getFallbackAnalysis('Empty Gemini response');
    }

    const rawText = candidates[0]?.content?.parts?.[0]?.text;
    
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      console.error('Gemini REST: empty text', json);
      return getFallbackAnalysis('Empty Gemini response');
    }

    const parsed = extractAndParseJSON(rawText);
    
    if (!parsed) {
      return getFallbackAnalysis('Unparseable Gemini output');
    }

    return parsed;

  } catch (err) {
    console.error('Gemini REST fatal error:', err);
    return getFallbackAnalysis('Gemini failure');
  }
}
```

### Additional Actions
1. **Remove unused SDK imports** (lines 4, 26) - they're not used and may cause confusion
2. **Verify API key** is correctly loaded from `.env`
3. **Test immediately** after implementation

## FINAL SOLUTION ✓

### Root Cause (CONFIRMED)
The model name `gemini-pro` **does not exist** in Gemini API.
The model name `gemini-1.5-flash` **is not supported** with v1beta endpoint.

### Correct Model for v1beta
Use `gemini-2.5-flash` (stable, current model as of Jan 2026)

### Final Implementation
```javascript
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
```

## Test Results ✓
- HTTP 200 OK
- Valid JSON response with analysis
- Confidence level: medium
- Real Gemini analysis working perfectly

## Files Modified
1. `backend/server.js` - Lines 4, 26, 143
   - Removed SDK import
   - Removed SDK instantiation  
   - Updated model to `gemini-2.5-flash`

## Status: **FIXED AND VERIFIED** ✓
