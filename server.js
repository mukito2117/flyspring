import express from 'express';
import https from 'https';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MongoDBClient from './Utils/MongoDBClientFile.js';

import {
  getPlaceOrderDetails,
  getCode,
  getMongoToken,
  getOrders,
  getTokenController,
  setExpiryController,
  getDatetimeLog,
  getLogList,
  setManualExpiry,
  getTokenFromMongodb,
  tracker
} from './Utils/controller.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// SSL cert and key paths
const sslDirectory = path.join(__dirname, 'ssl');
const privateKey = fs.readFileSync(
  path.join(sslDirectory, 'private.key'),
  'utf8'
);
const certificate = fs.readFileSync(
  path.join(sslDirectory, 'flyspring_in.crt'),
  'utf8'
);

const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'front', 'build')));

// ===== Routes wired to controllers =====

app.get('/api/placeorder/details', getPlaceOrderDetails);

app.get('/api/getCode', getCode);

app.get('/api/getMongotoken', getMongoToken);

app.get('/api/getOrders', getOrders);

app.get('/api/token', getTokenController);

app.get('/api/setExpiry', setExpiryController);

app.get('/api/datetimelog', getDatetimeLog);

app.get('/api/loglist', getLogList);

app.post('/api/setExpiry', setManualExpiry);

// Serve React app for root and client-side routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
});

app.get('/*splat', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});


// 404 handler for any other unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== Bootstrap async stuff and start server =====

const start = async () => {
  await MongoDBClient.connect();
  await getTokenFromMongodb();
  setInterval(tracker, 300);

  httpsServer.listen(PORT, () => {
    console.log(`🚀 Server is running on https://localhost:${PORT}`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
