# Focus Analyzer Frontend

React + Vite minimal UI for behavioral focus analysis.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Opens http://localhost:5173

## Architecture

**App.jsx** contains:
- Sample logs (hardcoded for demo)
- Analyze button that POSTs to `/api/analyze`
- Rendering of periods, loops, and assessment
- Error/loading states

**Vite proxy** (`vite.config.js`):
- Routes `/api/*` to `http://localhost:3001`
- Eliminates CORS issues during dev
- Production: frontend and backend on same origin

**CSS** (`App.css`):
- Simple color scheme (blue buttons, green/red periods)
- Responsive layout
- No external libraries

## Component Structure

```
App
├── Header
├── Controls (Analyze button)
└── Results
    ├── Work Periods (focus vs fragmented)
    ├── Switching Patterns (loops)
    └── Summary (assessment)
```

## Expected Backend Response

The component assumes Gemini returns this JSON structure:

```json
{
  "periods": [
    {
      "startTime": "ISO timestamp",
      "endTime": "ISO timestamp",
      "type": "focus|fragmented",
      "duration_minutes": 15,
      "primary_domains": ["domain.com"],
      "explanation": "..."
    }
  ],
  "switching_loops": [
    {
      "domains": ["site1.com", "site2.com"],
      "occurrences": 3,
      "likely_cause": "..."
    }
  ],
  "overall_assessment": "...",
  "confidence_level": "low|medium|high"
}
```

## Design Decisions

- **No state management library** – useState is enough for this demo
- **Hardcoded logs** – In production, these come from Chrome extension via `/upload` endpoint
- **Proxy in Vite** – Simple, avoids deployment complexity during hackathon
- **Minimal styling** – Focus on layout clarity, not design
- **Direct Gemini response** – No post-processing, renders as-is
