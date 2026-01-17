/**
 * Quick test script to validate the /analyze endpoint
 * 
 * Run: node test-analyze.js
 * (Make sure server is running on PORT 3001)
 */

const testLogs = {
  logs: [
    {
      timestamp: "2025-01-17T14:00:00Z",
      url: "https://github.com/user/project",
      domain: "github.com"
    },
    {
      timestamp: "2025-01-17T14:01:00Z",
      url: "https://stackoverflow.com/questions/12345",
      domain: "stackoverflow.com"
    },
    {
      timestamp: "2025-01-17T14:02:00Z",
      url: "https://github.com/user/project",
      domain: "github.com"
    },
    {
      timestamp: "2025-01-17T14:03:00Z",
      url: "https://stackoverflow.com/questions/67890",
      domain: "stackoverflow.com"
    },
    {
      timestamp: "2025-01-17T14:04:00Z",
      url: "https://github.com/user/project",
      domain: "github.com"
    },
    // Long focus period on Notion
    {
      timestamp: "2025-01-17T14:15:00Z",
      url: "https://notion.so/my-project",
      domain: "notion.so"
    },
    {
      timestamp: "2025-01-17T14:20:00Z",
      url: "https://notion.so/my-project",
      domain: "notion.so"
    },
    {
      timestamp: "2025-01-17T14:25:00Z",
      url: "https://notion.so/my-project",
      domain: "notion.so"
    },
    {
      timestamp: "2025-01-17T14:30:00Z",
      url: "https://notion.so/my-project",
      domain: "notion.so"
    }
  ]
};

async function test() {
  try {
    console.log('Sending test logs to /analyze...\n');
    
    const response = await fetch('http://localhost:3001/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testLogs)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      process.exit(1);
    }

    console.log('✓ Analysis successful!\n');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    process.exit(1);
  }
}

test();
