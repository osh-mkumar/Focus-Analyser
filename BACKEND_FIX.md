# Backend Fix: Defensive JSON Parsing ✓

## Problem
Frontend error: `"Unexpected end of JSON input"` when clicking "Analyze with Gemini"
- Root cause: Backend returning empty or malformed response
- Gemini sometimes includes markdown, extra text, or incomplete JSON
- No fallback when parsing fails

## Solution: Defensive Response Handling

### Three-layer defense:

**Layer 1 – /analyze Route (always returns JSON)**
```javascript
app.post('/analyze', async (req, res) => {
  try {
    // ... process logs ...
    const analysis = await analyzeWithGemini(formattedLogs);
    return res.json(analysis);  // Always valid JSON
  } catch (error) {
    // Even if Gemini fails, return fallback JSON
    return res.json({
      periods: [],
      switching_loops: [],
      overall_assessment: 'Unable to complete analysis...',
      confidence_level: 'low',
      error: error.message
    });
  }
});
```

**Layer 2 – Defensive JSON Extraction**
```javascript
function extractAndParseJSON(text) {
  // 1. Strip markdown backticks
  let cleaned = text
    .replace(/^```json\n?/i, '')
    .replace(/\n?```$/i, '');

  // 2. Find first { and last } (isolate JSON)
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    return null;  // No JSON found
  }

  // 3. Extract substring and parse
  const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (parseError) {
    return null;  // Parse failed
  }
}
```

**Layer 3 – Fallback Object**
```javascript
function getFallbackAnalysis(reason) {
  return {
    periods: [],
    switching_loops: [],
    overall_assessment: `Analysis unavailable (${reason}). Try again.`,
    confidence_level: 'low',
    is_fallback: true
  };
}
```

## Key Changes

1. **Always returns JSON** – No error status codes, no empty responses
2. **Strips markdown** – Removes ```json``` fences if Gemini adds them
3. **Extracts JSON defensively** – Finds first { and last } to isolate JSON
4. **Never throws** – Returns fallback if parsing fails
5. **Logs errors** – Console logs what failed, but server doesn't crash

## Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Gemini returns valid JSON | ✓ Works | ✓ Works |
| Gemini adds markdown | ✗ Crash | ✓ Parses |
| Gemini returns partial text | ✗ Crash | ✓ Fallback |
| Gemini API fails | ✗ Crash | ✓ Fallback |
| Any parsing error | ✗ Crash | ✓ Fallback |

**Frontend never crashes on response.json()**

## Files Modified

- `backend/server.js` – Added `extractAndParseJSON()`, `getFallbackAnalysis()`, modified `/analyze` route

## Servers Status

✓ Backend: http://localhost:3001 (running with new fix)
✓ Frontend: http://localhost:5173 (running)
✓ Ready for testing
