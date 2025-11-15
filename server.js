import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { tracker, logList } from './Utils/UpLogic.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const filePath = path.join(__dirname, 'datetimeLog.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'front', 'build')));

app.get("/placeorder/details", (req, res) => {
    res.json(orderMemory);
});

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

// API endpoint to get datetime log data from file
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

// New API endpoint to get in-memory logList data
app.get('/api/loglist', (req, res) => {
  res.json(logList);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for root and client-side routes
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

// Schedule tracker job every second
schedule.scheduleJob('*/1 * * * * *', tracker);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
