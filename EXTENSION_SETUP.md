# Chrome Extension Setup

## Installation Steps

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or: Menu → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select: `C:\Users\manmo\Desktop\hackday\extension`
   - Extension should appear with 🧠 icon

4. **Verify Installation**
   - Extension icon should appear in toolbar
   - Click icon to open popup

## Usage Flow

**Step 1: Start Backend**
```bash
cd backend
node server.js
```
Backend runs on http://localhost:3001

**Step 2: Start Tracking**
- Click extension icon (🧠)
- Click "Start Tracking"
- Status shows: ✅ Tracking active

**Step 3: Browse Normally**
- Switch between tabs
- Visit websites
- Activity is recorded locally

**Step 4: Analyze**
- Click extension icon
- Check activity count (e.g., "15 activities recorded")
- Click "Analyze My Focus"
- Web app opens with Gemini analysis results

## Testing Checklist

- [ ] Extension loads without errors
- [ ] "Start Tracking" enables tracking
- [ ] Tab switches increment activity count
- [ ] "Analyze My Focus" calls backend successfully
- [ ] Results open in web app at localhost:5173
- [ ] "Clear Logs" removes stored activities
- [ ] "Stop Tracking" disables tracking

## Troubleshooting

**Extension not loading:**
- Check Developer Mode is enabled
- Verify path to extension/ folder is correct
- Check console for errors (Inspect views → service worker)

**Analysis fails:**
- Ensure backend is running on port 3001
- Check backend console for errors
- Verify logs are being stored (check activity count)

**No activities tracked:**
- Verify "Start Tracking" was clicked
- Check status shows ✅ Tracking active
- Try switching to a few different tabs
- Avoid chrome:// internal pages

## Files Created

```
extension/
├── manifest.json      - Chrome MV3 config
├── background.js      - Tab tracking service worker
├── popup.html         - Extension UI
├── popup.js           - Popup logic
└── README.md          - Documentation
```

## Demo Ready ✓

Extension integrates cleanly with existing backend.
No changes needed to backend or frontend web app.
