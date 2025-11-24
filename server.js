import express from 'express';
import https from 'https';
import cors from 'cors';
import path from 'path';
import fs, { stat } from 'fs';
//import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { tracker, orderMemory,tokens,instrumentKey,qty,expiryDate,setExpiry } from './Utils/UpLogic.js';
import { getToken,getTokenbyAuthCode } from './Utils/upLogin.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MongoDBClient from './Utils/MongoDBClient.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const filePath = path.join(__dirname, 'datetimeLog.json');




// SSL cert and key paths
const sslDirectory = path.join(__dirname, 'ssl');
const privateKey = fs.readFileSync(path.join(sslDirectory, 'private.key'), 'utf8');
const certificate = fs.readFileSync(path.join(sslDirectory, 'flyspring_in.crt'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'front', 'build')));

app.get("/placeorder/details", (req, res) => {
    res.json(orderMemory);
});

app.get("/getCode", async(req, res) => {
  let state = req.query.state.replace('state','');
console.log("Authorization code received:", req.query.code+' - State: '+state);
  const access_token = await getTokenbyAuthCode(req.query.code, state);
  tokens[state-1] = access_token;
     res.json(access_token);
});



app.get("/getMongotoken", async(req, res) => {
   const mongoClient = new MongoDBClient();
const tokens =await mongoClient.getData('upstoxTokens');
     res.json( tokens);

});



app.get("/token", async(req, res) => {
     res.json(await getToken());
});

app.get("/setExpiry", async(req, res) => {
     res.json(await setExpiry());
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
  res.json(null);
});


app.post('/api/setExpiry', (req, res) => {
  const index = req.body.index;
  const expiry = req.body.expiry;
  instrumentKey = index;
  expiryDate = expiry;
  qty = index.includes('Nifty') ? 75 : 25;

  res.json('Expiry date set successfully' );
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

const getTokenfromMongodb = async() => { 
const mongoClient = new MongoDBClient();
mongoClient.getData('upstoxTokens').then((data)=>{
  console.log('Fetched tokens from MongoDB:');
  data.forEach(item => {
   for(let state=0;state<tokens.length;state++)
   {
  
    tokens[state] = item["Token" + (state + 1)];
   }
   
  });
});
}

// Schedule tracker job every second

//schedule.scheduleJob('*/1 * * * * *', tracker);
await MongoDBClient.connect(); 
await getTokenfromMongodb();
setInterval(tracker, 300);



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on https://localhost:${PORT}`);
});
