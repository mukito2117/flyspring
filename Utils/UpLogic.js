const fs = require("fs");
const axios = require("axios");

const API_URL = "https://api.upstox.com/v2/option/chain";
const option_greek_API_URL = "https://api.upstox.com/v3/market-quote/option-greek";
const ORDER_API_URL = "https://api.upstox.com/v3/order/gtt/place";

// Configurable Tokens
const tokens = [
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTIzY2RjNGFhNDdmMDczMmM0MWNlYjAiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mzk1NDExNiwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY0MDIxNjAwfQ.B09bv6sS9gI9BQS8r_UNE2qa1nxbMrWI3wR2AZ-fQ3E",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTIzY2RjNzU0ZDU3NTI1YTFiNGY5YjQiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mzk1NDExOSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY0MDIxNjAwfQ.mbaFfJW4psG8HQC0hNLvqqjTmCVET5DL6WGWiA5uBJs",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTIzY2RjOWUwNmRjMTY2MTgzNzBmMjIiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mzk1NDEyMSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY0MDIxNjAwfQ.5YWQ9TXSwZsMxCTCCKBBaqTUKJKmpR9IvmZXBaT_8oY",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTIzY2RjY2UwNmRjMTY2MTgzNzBmMjUiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mzk1NDEyNCwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY0MDIxNjAwfQ.GDxoDq15TmVpvFqfkFPEMQlsAs-8luRmdImQt1qHNL0",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTIzY2RjZTFjM2U0NTVkYTNlODgwZjAiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mzk1NDEyNiwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY0MDIxNjAwfQ.WIVq6UZMcVUd4fhbAvLBjV-sjyb5NMzLD8-t64la1LU",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTIzY2RkMTU0ZDU3NTI1YTFiNGY5YjgiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mzk1NDEyOSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY0MDIxNjAwfQ.2Dc5zpPlSxSgnyIw_qLUGZ4xbQs4JEtmubvylf-Vu1Q"
];
let tokenIndex = 0;

async function getToken() {
    tokenIndex = (tokenIndex + 1) % tokens.length;
    return tokens[tokenIndex];
}

// Instrument details
let instrumentKey = null;
let expiryDate = null;
let qty = null;

// Thresholds
const LTPChange = 5; // percentage
const OIChange = 10; // percentage
const VolChange = 2; // percentage
const IVChange = 0.5; // absolute change

// History tracking
const HISTORY_WINDOW = 3000; // 3 seconds
const HISTORY_LIMIT = HISTORY_WINDOW / 250; // 12 samples
let strikeHistory = {};

// Order memory
const orderMemory = {
    call: null,
    put: null
};

// Save order to disk
function saveOrderToDisk() {
    fs.writeFileSync("./orderjson.json", JSON.stringify(orderMemory, null, 4));
}

// Place order
async function placeOrderToUpstox(type, token, entryPrice, stoploss, trailingGap, qty) {
    const payload = {
        type: 'MULTIPLE',
        quantity: qty,
        product: 'I',
        instrument_token: token,
        transaction_type: 'BUY',
        rules: [
            { strategy: 'ENTRY', trigger_type: 'ABOVE', trigger_price: entryPrice },
            { strategy: 'TARGET', trigger_type: 'IMMEDIATE', trigger_price: entryPrice * 25 },
            { strategy: 'STOPLOSS', trigger_type: 'IMMEDIATE', trigger_price: entryPrice - stoploss, trailing_gap: trailingGap }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${await getToken()}`
    };
    try {
        const response = await axios.post(ORDER_API_URL, payload, { headers });
        if (response.data.status !== "success") throw new Error("Order rejected: " + JSON.stringify(response.data));
        return response.data;
    } catch (e) {
        console.error(`Failed to place ${type} order:`, e.message);
        return null;
    }
}

// Save history of LTP/OI/IV/Volume
function saveToHistory(data) {
    if (!data || !data.strike) return;
    const key = data.strike;
    if (!strikeHistory[key]) strikeHistory[key] = [];
    strikeHistory[key].push(data);
    if (strikeHistory[key].length > HISTORY_LIMIT) strikeHistory[key].shift();
}

// Fetch nearest option instrument keys
async function getNearestOptionInstrumentKeys() {
    try {
        const _headers = { Accept: "application/json", Authorization: `Bearer ${await getToken()}` };
        const response = await axios.get(API_URL, { params: { instrument_key: instrumentKey, expiry_date: expiryDate }, headers: _headers });
        const options = response.data.data;
        if (!options || options.length === 0) return null;

        let nearest = null, minDiff = Infinity;
        for (const option of options) {
            if (typeof option.strike_price === "number" && typeof option.underlying_spot_price === "number") {
                const diff = Math.abs(option.strike_price - option.underlying_spot_price);
                if (diff < minDiff) {
                    minDiff = diff;
                    nearest = option;
                }
            }
        }
        if (!nearest) return null;
        return {
            callKey: nearest.call_options.instrument_key,
            putKey: nearest.put_options.instrument_key,
            strike: nearest.strike_price
        };
    } catch (error) {
        console.error("Failed to get option keys:", error.message);
        return null;
    }
}

// Fetch LTP data
async function getLtp(keys, strike) {
    try {
        const response = await axios.get(option_greek_API_URL, {
            params: { instrument_key: keys },
            headers: { Accept: "application/json", Authorization: `Bearer ${await getToken()}` }
        });

        const ltpData = response.data.data || {};
        let result = { strike, callToken: null, callLtp: null, callVolume: null, callIV: null, callOI: null, putToken: null, putLtp: null, putVolume: null, putIV: null, putOI: null };

        for (const key in ltpData) {
            if (key.includes("CE")) {
                result.callToken = ltpData[key].instrument_token;
                result.callLtp = ltpData[key].last_price;
                result.callVolume = ltpData[key].volume;
                result.callIV = ltpData[key].iv;
                result.callOI = ltpData[key].oi;
            } else if (key.includes("PE")) {
                result.putToken = ltpData[key].instrument_token;
                result.putLtp = ltpData[key].last_price;
                result.putVolume = ltpData[key].volume;
                result.putIV = ltpData[key].iv;
                result.putOI = ltpData[key].oi;
            }
        }
        return result;
    } catch (error) {
        console.error("Failed to get LTP:", keys, strike, error.message);
        return null;
    }
}

// Detect trend and place orders
async function detectTrendMove(strike) {
    const history = strikeHistory[strike];
    if (!history || history.length < 3) return;

    const first = history[0];
    const last = history[history.length - 1];

    const callLtpChange = ((last.callLtp - first.callLtp) / first.callLtp) * 100;
    const putLtpChange = ((last.putLtp - first.putLtp) / first.putLtp) * 100;

    const callOIChange = ((last.callOI - first.callOI) / first.callOI) * 100;
    const putOIChange = ((last.putOI - first.putOI) / first.putOI) * 100;

    const callVolRatio = last.callVolume / first.callVolume;
    const putVolRatio = last.putVolume / first.putVolume;

    const callIVChange = last.callIV - first.callIV;
    const putIVChange = last.putIV - first.putIV;

    try {
        // CALL order
        if (callLtpChange > LTPChange || callOIChange > OIChange || callVolRatio > VolChange || callIVChange > IVChange) {
            const callStopLoss = last.callLtp - 2;
            const callTrailing = 1;
            const callResult = await placeOrderToUpstox("CALL", last.callToken, last.callLtp, callStopLoss, callTrailing, qty);
            console.log(`CALL Order Placed on Strike ${strike}:`, callResult);
            strikeHistory[strike] = []; // clear history after order
        }

        // PUT order
        if (putLtpChange > LTPChange || putOIChange > OIChange || putVolRatio > VolChange || putIVChange > IVChange) {
            const putStopLoss = last.putLtp - 2;
            const putTrailing = 1;
            const putResult = await placeOrderToUpstox("PUT", last.putToken, last.putLtp, putStopLoss, putTrailing, qty);
            console.log(`PUT Order Placed on Strike ${strike}:`, putResult);
            strikeHistory[strike] = []; // clear history after order
        }
    } catch (err) {
        console.error("❌ Error placing order:", err.message);
    }
}

// Tracker function
async function tracker() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!instrumentKey || !qty || !expiryDate || new Date(expiryDate) < today) {
        await setExpiry();
    }

    const result = await getNearestOptionInstrumentKeys();
    if (!result) return;

    const { strike, callKey, putKey } = result;
    const ltpResult = await getLtp([callKey, putKey].join(","), strike); 
    console.log(ltpResult.strike+'|'+ltpResult.callLtp+'|'+ltpResult.putLtp);
    if (!ltpResult) return;

    saveToHistory(ltpResult);
    await detectTrendMove(strike);
}

// Set expiry date for trading
async function setExpiry() {
    console.log('Setting expiry date...');
    const niftyKey = "NSE_INDEX|Nifty 50";
    const sensexKey = "BSE_INDEX|SENSEX";

    const sensexExpiryDate = await getOptionContract(sensexKey);
    const niftyExpiryDate = await getOptionContract(niftyKey);

    if (sensexExpiryDate <= niftyExpiryDate) {
        instrumentKey = sensexKey;
        expiryDate = sensexExpiryDate;
        qty = "20";
    } else {
        instrumentKey = niftyKey;
        expiryDate = niftyExpiryDate;
        qty = "75";
    }

    return { instrumentKey, expiryDate, qty };
}

// Get option contract expiry
async function getOptionContract(instrumentKey) {
    const url = `https://api.upstox.com/v2/option/contract?instrument_key=${instrumentKey}`;
    const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${await getToken()}` };
    try {
        const response = await axios.get(url, { headers });
        const expiryDates = (response.data.data || []).map(item => item.expiry).filter(date => date);
        if (!expiryDates.length) return null;
        expiryDates.sort();
        return expiryDates[0];
    } catch (error) {
        console.error("Failed to get option contract:", error.message);
        return null;
    }
}

module.exports = { tracker, orderMemory, tokens, instrumentKey, qty, expiryDate, setExpiry };
