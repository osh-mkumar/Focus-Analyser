import { useState, useEffect } from 'react';
import './App.css';

// Sample browser activity logs to demonstrate the analyzer
// In production, these would come from the Chrome extension
const SAMPLE_LOGS = [
  {
    timestamp: '2025-01-17T14:00:00Z',
    url: 'https://github.com/user/project',
    domain: 'github.com'
  },
  {
    timestamp: '2025-01-17T14:01:00Z',
    url: 'https://stackoverflow.com/questions/12345',
    domain: 'stackoverflow.com'
  },
  {
    timestamp: '2025-01-17T14:02:00Z',
    url: 'https://github.com/user/project',
    domain: 'github.com'
  },
  {
    timestamp: '2025-01-17T14:03:00Z',
    url: 'https://stackoverflow.com/questions/67890',
    domain: 'stackoverflow.com'
  },
  {
    timestamp: '2025-01-17T14:04:00Z',
    url: 'https://github.com/user/project',
    domain: 'github.com'
  },
  {
    timestamp: '2025-01-17T14:15:00Z',
    url: 'https://notion.so/my-project',
    domain: 'notion.so'
  },
  {
    timestamp: '2025-01-17T14:20:00Z',
    url: 'https://notion.so/my-project',
    domain: 'notion.so'
  },
  {
    timestamp: '2025-01-17T14:25:00Z',
    url: 'https://notion.so/my-project',
    domain: 'notion.so'
  },
  {
    timestamp: '2025-01-17T14:30:00Z',
    url: 'https://notion.so/my-project',
    domain: 'notion.so'
  }
];

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [personality, setPersonality] = useState('zen'); // 'zen' or 'drill'
  const [darkMode, setDarkMode] = useState(false); // light by default

  // Check for analysis from Chrome extension via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const analysisParam = urlParams.get('analysis');
    
    if (analysisParam) {
      try {
        const analysisData = JSON.parse(decodeURIComponent(analysisParam));
        setAnalysis(analysisData);
        // Clean URL after loading
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse analysis from URL:', err);
      }
    }
  }, []);

  // Persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Apply site-wide dark class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  /**
   * Fetch analysis from backend
   * 
   * Why POST to /api/analyze instead of direct backend URL?
   * Vite's proxy prevents CORS issues during development.
   * In production, frontend and backend are on same origin.
   */
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Use /api prefix which Vite proxies to localhost:3001
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: SAMPLE_LOGS })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Focus Analyzer</h1>
        <p>Understand your browser behavior patterns with Gemini</p>
        
        {/* Personality Toggle */}
        <div className="personality-toggle">
          <button
            className={`toggle-btn ${personality === 'zen' ? 'active' : ''}`}
            onClick={() => setPersonality('zen')}
          >
            🧘 Zen Mode
          </button>
          <button
            className={`toggle-btn ${personality === 'drill' ? 'active' : ''}`}
            onClick={() => setPersonality('drill')}
          >
            💪 Drill Mode
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="theme-toggle">
          <button
            className="toggle-btn"
            onClick={() => setDarkMode((v) => !v)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      {/* Analysis Button */}
      <section className="controls">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="analyze-btn"
        >
          {loading ? 'Analyzing patterns with Gemini...' : 'Analyze with Gemini'}
        </button>
        {error && <p className="error">Error: {error}</p>}
      </section>

      {/* Results */}
      {analysis && (
        <div className="results">
          {/* Show fallback warning if present */}
          {analysis.is_fallback && (
            <div className="fallback-notice">
              ⚠️ Analysis temporarily unavailable. Showing fallback response.
            </div>
          )}

          {/* Focus Periods */}
          <section className="section">
            <h2>Work Periods</h2>
            <div className="periods-list">
              {analysis.periods && analysis.periods.length > 0 ? (
                analysis.periods.map((period, idx) => (
                  <div
                    key={idx}
                    className={`period-card period-${period.type}`}
                  >
                    <div className="period-header">
                      <span className="period-type">
                        {period.type === 'focus' ? '🟢 Deep Work' : '🔴 Fragmented'}
                      </span>
                      <span className="period-duration">
                        {period.duration_minutes} min
                      </span>
                    </div>
                    <div className="period-domains">
                      {period.primary_domains &&
                        period.primary_domains.map((domain) => (
                          <span key={domain} className="domain-badge">
                            {domain}
                          </span>
                        ))}
                    </div>
                    <p className="period-explanation">
                      {personality === 'zen' 
                        ? period.explanation 
                        : period.explanation.replace(/likely suggests|suggests|may indicate/gi, 'shows').replace(/possibly|perhaps/gi, 'clearly')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="no-data">No periods analyzed</p>
              )}
            </div>
          </section>

          {/* Switching Loops */}
          {analysis.switching_loops && analysis.switching_loops.length > 0 && (
            <section className="section">
              <h2>Switching Patterns</h2>
              <div className="loops-list">
                {analysis.switching_loops.map((loop, idx) => (
                  <div key={idx} className="loop-card">
                    <div className="loop-header">
                      <span className="loop-domains">
                        {loop.domains.join(' ↔ ')}
                      </span>
                      <span className="loop-count">{loop.occurrences}x</span>
                    </div>
                    <p className="loop-cause">
                      {personality === 'zen' 
                        ? loop.likely_cause 
                        : loop.likely_cause.replace(/likely|suggests|may/gi, '').replace(/possibly|perhaps/gi, '')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Overall Assessment */}
          <section className="section">
            <h2>Summary</h2>
            <div className="assessment-card">
              <p className="assessment-text">
                {analysis.overall_assessment}
              </p>
              {analysis.confidence_level && (
                <p className="confidence">
                  Confidence: <strong>{analysis.confidence_level}</strong>
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="empty-state">
          <p>Click "Analyze with Gemini" to understand your focus patterns and switching behaviors.</p>
          <p className="empty-state-hint">Our AI will identify deep work periods, switching loops, and likely behavioral causes.</p>
        </div>
      )}
    </div>
  );
}

