import path from 'path';
import fs from 'fs';
import MongoDBClient from './MongoDBClientFile.js';
import {
  tracker,
  orderMemory,
  tokens,
  instrumentKey,
  qty,
  expiryDate,
  setExpiry
} from './UpLogic.js';
import { getToken, getTokenbyAuthCode } from './upLogin.js';

const filePath = path.join(process.cwd(), 'datetimeLog.json');

// ===== Route handlers / controllers =====

export const getPlaceOrderDetails = (req, res) => {
  res.json(orderMemory);
};

export const getCode = async (req, res) => {
  try {
    let state = req.query.state.replace('state', '');
    console.log(
      'Authorization code received:',
      req.query.code + ' - State: ' + state
    );
    const access_token = await getTokenbyAuthCode(req.query.code, state);
    tokens[state - 1] = access_token;
    res.json(access_token);
  } catch (err) {
    console.error('Error in getCode:', err);
    res.status(500).json({ error: 'Failed to get access token' });
  }
};

export const getMongoToken = async (req, res) => {
  try {
    const mongoClient = new MongoDBClient();
    const mongoTokens = await mongoClient.getData('upstoxTokens');
    res.json(mongoTokens);
  } catch (err) {
    console.error('Error in getMongoToken:', err);
    res.status(500).json({ error: 'Failed to fetch tokens from MongoDB' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const mongoClient = new MongoDBClient();
    const mongoTokens = await mongoClient.getData('alerts');
    res.json(mongoTokens);
  } catch (err) {
    console.error('Error in getOrders:', err);
    res.status(500).json({ error: 'Failed to fetch tokens from MongoDB' });
  }
};

export const getTokenController = async (req, res) => {
  try {
    const t = await getToken();
    res.json(t);
  } catch (err) {
    console.error('Error in getTokenController:', err);
    res.status(500).json({ error: 'Failed to get token' });
  }
};

export const setExpiryController = async (req, res) => {
  try {
    const result = await setExpiry();
    res.json(result);
  } catch (err) {
    console.error('Error in setExpiryController:', err);
    res.status(500).json({ error: 'Failed to set expiry' });
  }
};

export const getDatetimeLog = (req, res) => {
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
};

export const getLogList = (req, res) => {
  res.json(null);
};

export const setManualExpiry = (req, res) => {
  const index = req.body.index;
  const expiry = req.body.expiry;

  // instrumentKey, expiryDate, qty are imported from UpLogic and mutated here
  // Ensure they are not declared as const in UpLogic
  // eslint-disable-next-line no-global-assign
  instrumentKey = index;
  // eslint-disable-next-line no-global-assign
  expiryDate = expiry;
  // eslint-disable-next-line no-global-assign
  qty = index.includes('Nifty') ? 75 : 25;

  res.json('Expiry date set successfully');
};

// ===== Helper used during bootstrap =====

export const getTokenFromMongodb = async () => {
  const mongoClient = new MongoDBClient();
  const data = await mongoClient.getData('upstoxTokens');
  console.log('Fetched tokens from MongoDB:');
  data.forEach(item => {
    for (let state = 0; state < tokens.length; state++) {
      tokens[state] = item['Token' + (state + 1)];
    }
  });
};

// re‑export tracker for server bootstrap
export { tracker };
