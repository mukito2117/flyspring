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



const levels = [
    { threshold: 500, minChange: 30, stoploss: 10, gap: 1 },
    { threshold: 400, minChange: 20, stoploss: 7, gap: 1 },
    { threshold: 300, minChange: 15, stoploss: 6, gap: 1 },
    { threshold: 200, minChange: 10, stoploss: 5, gap: 1 },
    { threshold: 100, minChange: 5, stoploss: 4, gap: 1 },
    { threshold: 50, minChange: 3, stoploss: 3, gap: 1 },
    { threshold: 25, minChange: 2, stoploss: 2, gap: 1 },
    { threshold: 10, minChange: 2, stoploss: 2, gap: 1 },
   // { threshold: 5, minChange: 0.75, stoploss: 0.5, gap: 0.25 }
];

// Order memory
const orderMemory = {
    call: null,
    put: null
};

async function placeOrderToUpstox(type, token, entryPrice, stoploss, trailingGap, qty) {
    const payload = {
        type: 'MULTIPLE',
        quantity: qty,
        product: 'I',
        instrument_token: token,
        transaction_type: 'BUY',
        rules: [
            { strategy: 'ENTRY',   trigger_type: 'ABOVE',    trigger_price: entryPrice },
            { strategy: 'TARGET',  trigger_type: 'IMMEDIATE', trigger_price: entryPrice * 25 },
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

        if (!response.data || response.data.status !== 'success') {
            const msg = `Order rejected (${type}). Status: ${response.data?.status}, Body: ${JSON.stringify(response.data)}`;

            console.error(msg);

            // Save failure alert in MongoDB
            const mongo = new MongoDBClient();
            await mongo.insertData('alerts', {
                side: type,
                type: 'ORDER_FAILURE',
                reason: 'REJECTED',
                message: msg,
                payload,
                token,
                qty,
                entryPrice,
                stoploss,
                trailingGap,
                timestamp: new Date()
            });

            throw new Error(msg);
        }

        return response.data;

    } catch (e) {
        // Build detailed error info (network errors, non-2xx, etc.)
        const errMsg = e.response
            ? `Upstox order API error (${type}) - HTTP ${e.response.status}: ${JSON.stringify(e.response.data)}`
            : `Upstox order API error (${type}) - ${e.message}`;

        console.error(errMsg);

        try {
            const mongo = new MongoDBClient();
            await mongo.insertData('alerts', {
                side: type,
                type: 'ORDER_FAILURE',
                reason: 'EXCEPTION',
                message: errMsg,
                payload,
                token,
                qty,
                entryPrice,
                stoploss,
                trailingGap,
                stack: e.stack,
                timestamp: new Date()
            });
        } catch (mongoErr) {
            console.error('Failed to insert order failure alert into MongoDB:', mongoErr.message);
        }

        return null;
    }
}

// Place order
async function placeOrderToUpstox_old(type, token, entryPrice, stoploss, trailingGap, qty) {
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

const MongoDBClient = require("./MongoDBClientFile");  // <-- your MongoDB client



// Active positions in memory, keyed by strike
// structure:
// activePositions[strike] = {
//   side: "CALL" | "PUT",
//   entryPrice: number,
//   stopLoss: number,
//   trailingGap: number,
//   token: string,
//   qty: number,
//   level: object,        // level used for entry
//   createdAt: Date,
//   updatedAt: Date
// }
const activePositions = {};

// Detect trend and place orders using levels[]
async function detectTrendMove(strike) {
    const history = strikeHistory[strike];
    if (!history || history.length < 3) return;

    const first = history[0];
    const last  = history[history.length - 1];

    // --------------------------
    // FIND LEVEL BASED ON LTP
    // --------------------------
    function getLevel(ltp) {
        return levels.find(l => ltp >= l.threshold)
            || levels[levels.length - 1];
    }

    const callLevel = getLevel(last.callLtp);
    const putLevel  = getLevel(last.putLtp);

    // --------------------------
    // CALCULATE LTP DIFFERENCE
    // --------------------------
    const callLtpDiff = last.callLtp - first.callLtp;
    const putLtpDiff  = last.putLtp - first.putLtp;

    // OI / Volume / IV
    const callOIChange = ((last.callOI - first.callOI) / first.callOI) * 100;
    const putOIChange  = ((last.putOI - first.putOI) / first.putOI) * 100;

    const callVolRatio = last.callVolume / first.callVolume;
    const putVolRatio  = last.putVolume / first.putVolume;

    const callIVChange = last.callIV - first.callIV;
    const putIVChange  = last.putIV - first.putIV;

    // Helper to create Mongo client
    const getMongo = () => new MongoDBClient();

    try {
        // ==========================================================
        // IF POSITION ALREADY ACTIVE -> MANAGE (SL / TRAIL / EXIT)
        // ==========================================================
        const pos = activePositions[strike];
        if (pos) {
            // Track current LTP depending on side
            const currentLtp = pos.side === "CALL" ? last.callLtp : last.putLtp;

            // 1) Check for STOP LOSS HIT (EXIT)
            if (currentLtp <= pos.stopLoss) {
                try {
                    // Exit order: for simplicity, just market exit at currentLtp
                    const exitResult = await placeOrderToUpstox(
                        pos.side === "CALL" ? "CALL_EXIT" : "PUT_EXIT",
                        pos.token,
                        currentLtp,
                        null,        // exit SL (not needed)
                        null,        // exit trailing (not needed)
                        pos.qty
                    );

                    const mongo = getMongo();
                    await mongo.insertData("alerts", {
                        strike,
                        side: pos.side,
                        type: "EXIT",          // exit alert
                        reason: "STOPLOSS_HIT",
                        exitLTP: currentLtp,
                        stopLossUsed: pos.stopLoss,
                        entryPrice: pos.entryPrice,
                        level: pos.level,
                        timestamp: new Date(),
                        orderResult: exitResult
                    });

                    console.log(`🚪 ${pos.side} Exit triggered on ${strike} @ LTP ${currentLtp} (SL hit: ${pos.stopLoss})`);

                    // Remove active position
                    delete activePositions[strike];

                    // reset history after exit
                    strikeHistory[strike] = [];
                } catch (err) {
                    console.error("❌ Error exiting position:", err.message);
                }

                // after handling exit, return; no new buy signal this tick
                return;
            }

            // 2) Check for TRAILING STOP UPDATE
            // If LTP is above entryPrice and price moved more than trailingGap,
            // move stopLoss up by trailingGap (can also do stepwise or more complex logic)
            const favorableMove = currentLtp - pos.entryPrice;
            if (favorableMove >= pos.trailingGap) {
                // new SL: either currentLtp - trailingGap OR oldSL + trailingGap,
                // depending on how you want to trail.
                const newStopLoss = currentLtp - pos.trailingGap;

                if (newStopLoss > pos.stopLoss) {
                    const oldSL = pos.stopLoss;
                    pos.stopLoss = newStopLoss;
                    pos.updatedAt = new Date();

                    const mongo = getMongo();
                    await mongo.insertData("alerts", {
                        strike,
                        side: pos.side,
                        type: "TRAIL_UPDATE",
                        entryPrice: pos.entryPrice,
                        oldStopLoss: oldSL,
                        newStopLoss,
                        currentLTP: currentLtp,
                        trailingGap: pos.trailingGap,
                        level: pos.level,
                        timestamp: new Date()
                    });

                    console.log(`⬆️ Trailing SL updated on ${strike} (${pos.side}): ${oldSL} -> ${newStopLoss}`);
                }
            }

            // If position is active, do NOT create new buy alert.
            return;
        }

        // ==========================================================
        // NO ACTIVE POSITION -> CHECK FOR NEW BUY SIGNALS
        // ==========================================================

        // --------------------------
        // CALL SIGNAL CHECK
        // --------------------------
        if (
            callLtpDiff >= callLevel.minChange ||
            callOIChange > OIChange ||
            callVolRatio > VolChange ||
            callIVChange > IVChange
        ) {
            // --------------------------
            // INSERT BUY ALERT INTO MONGO
            // --------------------------
            const mongo = getMongo();
            await mongo.insertData("alerts", {
                strike,
                side: "CALL",
                type: "ENTRY",          // buy/entry alert
                firstLTP: first.callLtp,
                lastLTP: last.callLtp,
                difference: callLtpDiff,
                level: callLevel,
                callOIChange,
                callVolRatio,
                callIVChange,
                token: last.callToken,
                timestamp: new Date()
            });

            // --------------------------
            // PLACE CALL ORDER
            // --------------------------
            const callStopLoss = last.callLtp - callLevel.stoploss;
            const callTrailing = callLevel.gap;

            const callResult = await placeOrderToUpstox(
                "CALL",
                last.callToken,
                last.callLtp,
                callStopLoss,
                callTrailing,
                qty
            );

            console.log(`🔥 CALL Order Triggered on ${strike}`);
            console.log({
                firstLTP: first.callLtp,
                lastLTP: last.callLtp,
                diff: callLtpDiff,
                levelUsed: callLevel
            });
            console.log("Order:", callResult);

            // --------------------------
            // SAVE ACTIVE POSITION (NO NEW BUY UNTIL EXIT)
            // --------------------------
            activePositions[strike] = {
                side: "CALL",
                entryPrice: last.callLtp,
                stopLoss: callStopLoss,
                trailingGap: callTrailing,
                token: last.callToken,
                qty,
                level: callLevel,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // RESET HISTORY for this strike (start fresh after entry)
            strikeHistory[strike] = [];

            // after CALL entry, return; skip PUT for this strike
            return;
        }

        // --------------------------
        // PUT SIGNAL CHECK
        // --------------------------
        if (
            putLtpDiff >= putLevel.minChange ||
            putOIChange > OIChange ||
            putVolRatio > VolChange ||
            putIVChange > IVChange
        ) {
            // --------------------------
            // INSERT BUY ALERT INTO MONGO
            // --------------------------
            const mongo = getMongo();
            await mongo.insertData("alerts", {
                strike,
                side: "PUT",
                type: "ENTRY",
                firstLTP: first.putLtp,
                lastLTP: last.putLtp,
                difference: putLtpDiff,
                level: putLevel,
                putOIChange,
                putVolRatio,
                putIVChange,
                token: last.putToken,
                timestamp: new Date()
            });

            // --------------------------
            // PLACE PUT ORDER
            // --------------------------
            const putStopLoss = last.putLtp - putLevel.stoploss;
            const putTrailing = putLevel.gap;

            const putResult = await placeOrderToUpstox(
                "PUT",
                last.putToken,
                last.putLtp,
                putStopLoss,
                putTrailing,
                qty
            );

            console.log(`🔥 PUT Order Triggered on ${strike}`);
            console.log({
                firstLTP: first.putLtp,
                lastLTP: last.putLtp,
                diff: putLtpDiff,
                levelUsed: putLevel
            });
            console.log("Order:", putResult);

            // --------------------------
            // SAVE ACTIVE POSITION
            // --------------------------
            activePositions[strike] = {
                side: "PUT",
                entryPrice: last.putLtp,
                stopLoss: putStopLoss,
                trailingGap: putTrailing,
                token: last.putToken,
                qty,
                level: putLevel,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // RESET HISTORY after entry
            strikeHistory[strike] = [];

            return;
        }

    } catch (err) {
        console.error("❌ Error in detectTrendMove / placing or managing order:", err.message);
    }
}


// Detect trend and place orders using levels[]
async function detectTrendMove_old(strike) { 
    const history = strikeHistory[strike];
    if (!history || history.length < 3) return;

    const first = history[0];
    const last = history[history.length - 1];

    // --------------------------
    // FIND LEVEL BASED ON LTP
    // --------------------------
    function getLevel(ltp) {
        return levels.find(l => ltp >= l.threshold) 
            || levels[levels.length - 1];
    }

    const callLevel = getLevel(last.callLtp);
    const putLevel  = getLevel(last.putLtp);

    // --------------------------
    // CALCULATE LTP DIFFERENCE
    // --------------------------
    const callLtpDiff = last.callLtp - first.callLtp;
    const putLtpDiff  = last.putLtp - first.putLtp;

    // OI / Volume / IV
    const callOIChange = ((last.callOI - first.callOI) / first.callOI) * 100;
    const putOIChange  = ((last.putOI - first.putOI) / first.putOI) * 100;

    const callVolRatio = last.callVolume / first.callVolume;
    const putVolRatio  = last.putVolume / first.putVolume;

    const callIVChange = last.callIV - first.callIV;
    const putIVChange  = last.putIV - first.putIV;

    try {

        // ==========================================================
        // CALL SIGNAL CHECK
        // ==========================================================
        if (callLtpDiff >= callLevel.minChange 
            || callOIChange > OIChange 
            || callVolRatio > VolChange 
            || callIVChange > IVChange) {

            // --------------------------
            // INSERT ALERT INTO MONGO
            // --------------------------
            const mongo = new MongoDBClient();
            await mongo.insertData("alerts", {
                strike,
                side: "CALL",
                firstLTP: first.callLtp,
                lastLTP: last.callLtp,
                difference: callLtpDiff,
                level: callLevel,
                callOIChange,
                callVolRatio,
                callIVChange,
                token: last.callToken,
                timestamp: new Date()
            });

            // --------------------------
            // PLACE CALL ORDER
            // --------------------------
            const callStopLoss = last.callLtp - callLevel.stoploss;
            const callTrailing = callLevel.gap;

            const callResult = await placeOrderToUpstox(
                "CALL",
                last.callToken,
                last.callLtp,
                callStopLoss,
                callTrailing,
                qty
            );

            console.log(`🔥 CALL Order Triggered on ${strike}`);
            console.log({
                firstLTP: first.callLtp,
                lastLTP: last.callLtp,
                diff: callLtpDiff,
                levelUsed: callLevel
            });
            console.log("Order:", callResult);

            // RESET HISTORY
            strikeHistory[strike] = [];
        }

        // ==========================================================
        // PUT SIGNAL CHECK
        // ==========================================================
        if (putLtpDiff >= putLevel.minChange 
            || putOIChange > OIChange 
            || putVolRatio > VolChange 
            || putIVChange > IVChange) {

            // --------------------------
            // INSERT ALERT INTO MONGO
            // --------------------------
            const mongo = new MongoDBClient();
            await mongo.insertData("alerts", {
                strike,
                side: "PUT",
                firstLTP: first.putLtp,
                lastLTP: last.putLtp,
                difference: putLtpDiff,
                level: putLevel,
                putOIChange,
                putVolRatio,
                putIVChange,
                token: last.putToken,
                timestamp: new Date()
            });

            // --------------------------
            // PLACE PUT ORDER
            // --------------------------
            const putStopLoss = last.putLtp - putLevel.stoploss;
            const putTrailing = putLevel.gap;

            const putResult = await placeOrderToUpstox(
                "PUT",
                last.putToken,
                last.putLtp,
                putStopLoss,
                putTrailing,
                qty
            );

            console.log(`🔥 PUT Order Triggered on ${strike}`);
            console.log({
                firstLTP: first.putLtp,
                lastLTP: last.putLtp,
                diff: putLtpDiff,
                levelUsed: putLevel
            });
            console.log("Order:", putResult);

            // RESET HISTORY
            strikeHistory[strike] = [];
        }

    } catch (err) {
        console.error("❌ Error placing order:", err.message);
    }
}




// Tracker function
async function tracker() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!instrumentKey || !qty || !expiryDate || new Date(expiryDate) < today) {
      await setExpiry();
    }

    const result = await getNearestOptionInstrumentKeys();
    if (!result) return;

    const { strike, callKey, putKey } = result; if(strike==null){return;}
    const ltpResult = await getLtp([callKey, putKey].join(","), strike);

    // Check ltpResult before accessing its properties
    if (!ltpResult) {
      console.warn('ltpResult is null or undefined');
      return;
    }
if(ltpResult==null){return;}
if(ltpResult.strike==null){return;}
    console.log(formatDate(Date.now()) + ' >> ' + ltpResult.strike + '|' + ltpResult.callLtp + '|' + ltpResult.putLtp);

    saveToHistory(ltpResult);
    await detectTrendMove(strike);
  } catch (e) {
    console.error(e);
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
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
