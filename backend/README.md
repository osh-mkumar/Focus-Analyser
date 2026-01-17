# Gemini Focus Analyzer - Backend

## Setup

```bash
npm install
```

Create `.env`:
```
GEMINI_API_KEY=your_key_here
PORT=3001
```

## Run

```bash
npm start
```

## API Endpoint

**POST** `/analyze`

### Request Body

```json
{
  "logs": [
    {
      "timestamp": "2025-01-17T14:30:00Z",
      "url": "https://github.com",
      "domain": "github.com"
    },
    {
      "timestamp": "2025-01-17T14:31:00Z",
      "url": "https://stackoverflow.com/questions/...",
      "domain": "stackoverflow.com"
    },
    {
      "timestamp": "2025-01-17T14:32:00Z",
      "url": "https://github.com",
      "domain": "github.com"
    },
    {
      "timestamp": "2025-01-17T14:45:00Z",
      "url": "https://notion.so",
      "domain": "notion.so"
    }
  ]
}
```

### Response (Success 200)

```json
{
  "periods": [
    {
      "startTime": "2025-01-17T14:30:00Z",
      "endTime": "2025-01-17T14:32:00Z",
      "type": "fragmented",
      "duration_minutes": 2,
      "primary_domains": ["github.com", "stackoverflow.com"],
      "explanation": "Rapid switching between GitHub and Stack Overflow likely suggests debugging or learning a new concept."
    },
    {
      "startTime": "2025-01-17T14:32:00Z",
      "endTime": "2025-01-17T14:45:00Z",
      "type": "focus",
      "duration_minutes": 13,
      "primary_domains": ["notion.so"],
      "explanation": "Sustained attention on Notion suggests documentation writing or task planning."
    }
  ],
  "switching_loops": [
    {
      "domains": ["github.com", "stackoverflow.com"],
      "occurrences": 2,
      "likely_cause": "Problem-solving workflow - alternating between code and reference materials."
    }
  ],
  "overall_assessment": "The session shows a mix of quick research loops followed by focused work. This pattern suggests a typical development workflow with debugging and knowledge-gathering breaks.",
  "confidence_level": "medium"
}
```

### Response (Error 400/500)

```json
{
  "error": "description of error"
}
```
