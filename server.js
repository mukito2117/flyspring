const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const filePath = path.join(__dirname, 'datetimeLog.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'front', 'build')));

// API Routes
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  res.status(201).json({
    id: 3,
    name,
    email,
    message: 'User created successfully'
  });
});

// API endpoint to get datetime log data
app.get('/api/datetimelog', (req, res) => {
  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading datetimeLog.json:', err);
      return res.status(500).json({ error: 'Failed to read datetime log' });
    }

    try {
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (parseError) {
      console.error('Error parsing datetimeLog.json:', parseError);
      res.status(500).json({ error: 'Failed to parse datetime log' });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for root and other non-API routes (client-side routing)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
});

app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
  }
});

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Scheduled job to add current datetime to local JSON file every 10 seconds
const addCurrentDateTimeToFile = () => {
  const now = new Date();
  let data = [];

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (fileContent) {
      try {
        data = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error parsing JSON file, resetting data:', error);
        data = [];
      }
    }
  }

  data.push({ datetime: now.toISOString() });
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Logged datetime: ${now.toISOString()}`);
  } catch (error) {
    console.error('Error writing to JSON file:', error);
  }
};

// Schedule job every 10 seconds
schedule.scheduleJob('*/10 * * * * *', addCurrentDateTimeToFile);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
