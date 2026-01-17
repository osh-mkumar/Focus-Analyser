import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================
// 1. LOAD ENVIRONMENT VARIABLES
// ========================================
dotenv.config();

// ========================================
// 2. CREATE EXPRESS APP
// ========================================
const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// 3. MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ========================================
// 4. GEMINI CLIENT
// ========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ========================================
// DEMO MODE (for judge-safe presentations)
// ========================================
const DEMO_MODE = false; // Set to true to bypass Gemini API calls

// ========================================
// 5. ROUTES
// ========================================

app.post('/analyze', async (req, res) => {
  console.log('✅ /analyze HIT');

  try {
    // ✅ FIX: support BOTH payload formats
    const logs = Array.isArray(req.body)
      ? req.body
      : req.body?.logs;

    if (!Array.isArray(logs) || logs.length === 0) {
      console.warn('⚠️ No valid logs received');

      return res.status(200).json({
        periods: [],
        switching_loops: [],
        overall_assessment: 'No valid activity data was provided for analysis.',
        confidence_level: 'low',
        is_fallback: true
      });
    }

    const formattedLogs = logs.map(log => ({
      timestamp: log.timestamp,
      domain: log.domain || extractDomain(log.url)
    }));

    // Demo mode: return static realistic analysis
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Returning static analysis');
      return res.status(200).json({
        periods: [
          {
            startTime: formattedLogs[0]?.timestamp || '2025-01-17T14:00:00Z',
            endTime: formattedLogs[4]?.timestamp || '2025-01-17T14:04:00Z',
            type: 'fragmented',
            duration_minutes: 4,
            primary_domains: ['github.com', 'stackoverflow.com'],
            explanation: 'Rapid switching between GitHub and Stack Overflow likely suggests active debugging or problem-solving.'
          },
          {
            startTime: formattedLogs[5]?.timestamp || '2025-01-17T14:15:00Z',
            endTime: formattedLogs[8]?.timestamp || '2025-01-17T14:30:00Z',
            type: 'focus',
            duration_minutes: 15,
            primary_domains: ['notion.so'],
            explanation: 'Sustained attention on Notion suggests documentation or planning work.'
          }
        ],
        switching_loops: [
          {
            domains: ['github.com', 'stackoverflow.com'],
            occurrences: 3,
            likely_cause: 'Typical development workflow - alternating between code and reference materials.'
          }
        ],
        overall_assessment: 'Session shows a healthy mix of focused work and research. The switching pattern suggests productive problem-solving behavior.',
        confidence_level: 'medium'
      });
    }

    const analysis = await analyzeWithGemini(formattedLogs);

    // 🔒 ABSOLUTE GUARANTEE: always return JSON body
    return res.status(200).json(analysis);

  } catch (error) {
    console.error('🔥 /analyze fatal error:', error);

    return res.status(200).json({
      periods: [],
      switching_loops: [],
      overall_assessment:
        'An internal error occurred, but the system remained stable.',
      confidence_level: 'low',
      is_fallback: true
    });
  }
});

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// 6. GEMINI ANALYSIS
// ========================================

async function analyzeWithGemini(logs) {
  try {
    const prompt = `
You are a behavioral analysis engine.

Rules:
- Use probabilistic language only
- No judgment, no diagnosis
- Return VALID JSON ONLY

Logs:
${JSON.stringify(logs, null, 2)}

Return this JSON:
{
  "periods": [],
  "switching_loops": [],
  "overall_assessment": "",
  "confidence_level": "low | medium | high"
}
`;

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

// ========================================
// 7. HELPERS
// ========================================

function extractAndParseJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function getFallbackAnalysis(reason) {
  return {
    periods: [],
    switching_loops: [],
    overall_assessment:
      `Analysis temporarily unavailable (${reason}).`,
    confidence_level: 'low',
    is_fallback: true
  };
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

// ========================================
// 8. START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`✓ Backend running on http://localhost:${PORT}`);
  console.log(
    `✓ Gemini API Key loaded: ${process.env.GEMINI_API_KEY ? 'yes' : 'NO'}`
  );
});
