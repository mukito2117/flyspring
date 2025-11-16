const fs = require("fs");
const axios = require("axios");
const { log } = require("console");
const API_URL = "https://api.upstox.com/v2/option/chain";
const LTP_API_URL = "https://api.upstox.com/v2/market-quote/ltp";
const ORDER_API_URL = "https://api.upstox.com/v3/order/gtt/place";

const instrumentKey = "NSE_INDEX|Nifty 50";
const qty = 75;
const expiryDate = "2025-11-18";
const tokens = [
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTE4Zjg4ZjVkNjFkNDRlYWI2MTZhNzgiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYzMjQ0MTc1LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjMzMzA0MDB9.X5Oyop4__3GUlm-uEY5vKQVtGe5OGUg9iB8AXmPqgQA",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTE4Zjg5MWJiZjU2ODY3NGZlZWEyZmUiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYzMjQ0MTc3LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjMzMzA0MDB9.CJ7_o3b2yoiTgbBRYxEHSidb8OUSt8PmJ0aAu2LlF6o",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTE4Zjg5OGJiZjU2ODY3NGZlZWEyZmYiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYzMjQ0MTg0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjMzMzA0MDB9.Vs1PqPLvKKOvllawKVZbmOE2UksxiMUnWw1DFJy_MxQ",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTE4Zjg5NDVkNjFkNDRlYWI2MTZhNzkiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYzMjQ0MTgwLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjMzMzA0MDB9.e338GCGpBRF_3bREh4hPgwaNBjVDsNFtWMqO1Q5xwOA",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTE4Zjg5YjVkNjFkNDRlYWI2MTZhN2EiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYzMjQ0MTg3LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjMzMzA0MDB9.4hk12vnY4hCHWU5Lg0L0qeT98I7zHLJqIkEorajS8zQ",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTE4Zjg5ZWJiZjU2ODY3NGZlZWEzMDAiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYzMjQ0MTkwLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjMzMzA0MDB9.YiSbS8eoZtzoA0_D9sRTTSZdPZyLWxI2nj534nMk8bM"
];
let tokenIndex = 0;

function getToken() {
    tokenIndex = (tokenIndex + 1) % tokens.length;
    return tokens[tokenIndex];
}

let datalist = [];
const datalistLength = 5;

const levels = [
    { threshold: 500, minChange: 30, stoploss: 10, gap: 1 },
    { threshold: 400, minChange: 20, stoploss: 7, gap: 1 },
    { threshold: 300, minChange: 15, stoploss: 6, gap: 1 },
    { threshold: 200, minChange: 10, stoploss: 5, gap: 1 },
    { threshold: 100, minChange: 5, stoploss: 4, gap: 1 },
    { threshold: 50, minChange: 3, stoploss: 3, gap: 1 },
    { threshold: 25, minChange: 2, stoploss: 2, gap: 1 },
    { threshold: 10, minChange: 2, stoploss: 2, gap: 1 }
];

const orderMemory = {
    call: null,
    put: null,
    history: []
};

function saveOrderToDisk() {
    fs.writeFileSync("./orderjson.json", JSON.stringify(orderMemory, null, 4));
}

async function placeOrderToUpstox(token, qty, entryPrice, stoploss, trailingGap) {
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
        'Authorization': `Bearer ${getToken()}`
    };
    try {
        const response = await axios.post(ORDER_API_URL, payload, { headers });
        if (response.data.status !== "success") throw new Error("Order rejected: " + JSON.stringify(response.data));
        return response.data;
    } catch (e) {
        console.error("Failed to place real Upstox order:", e.message);
        return null;
    }
}

function createOrderData(type, token, entryPrice, stoploss, trailingGap, qty, realOrderId = null) {
    const now = new Date().toISOString();
    return {
        type,
        token,
        entryPrice,
        stoplossPrice: entryPrice - stoploss,
        trailingGap,
        qty,
        status: "active",
        targetPrice: entryPrice * 25,
        entryTime: now,
        exitTime: null,
        exitReason: null,
        ltpTrail: [entryPrice],
        stoplossTrail: [], 
        realOrderId
    };
}

async function getNearestOptionInstrumentKeys() {
    try {
        const response = await axios.get(API_URL, {
            params: { instrument_key: instrumentKey, expiry_date: expiryDate },
            headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
        });
        const options = response.data.data;
        if (!options || options.length === 0) throw new Error("No option chain data.");
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
        if (!nearest) throw new Error("No nearest option found.");
        return {
            callKey: nearest.call_options.instrument_key,
            putKey: nearest.put_options.instrument_key,
            strike: nearest.strike_price,
            spot: nearest.underlying_spot_price,
            diff: minDiff
        };
    } catch (error) {
        console.error("Failed to get option keys:", error.message);
        return null;
    }
}

async function getLtp(keys) {
    try {
        const response = await axios.get(LTP_API_URL, {
            params: { instrument_key: keys },
            headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
        });
        const ltpData = response.data.data || {};
        let result = { call: null, put: null };
        for (const key in ltpData) {
            if (key.includes("CE")) result.call = ltpData[key];
            else if (key.includes("PE")) result.put = ltpData[key];
        }
        return result;
    } catch (error) {
        console.error("Failed to get LTP:", error.message);
        return null;
    }
}

async function monitorOrderLtp(type, lastLtp) {
    const order = orderMemory[type];
    if (!order || order.status !== "active") return false;
    order.ltpTrail.push(lastLtp);

    // Trailing logic
    if (type === "call") {
        let newStop = Math.max(order.stoplossPrice, lastLtp - order.trailingGap);
        if (newStop > order.stoplossPrice) {
            order.stoplossPrice = newStop;
            order.stoplossTrail.push(newStop);
        }
    } else if (type === "put") {
        let newStop = Math.min(order.stoplossPrice, lastLtp + order.trailingGap);
        if (newStop < order.stoplossPrice) {
            order.stoplossPrice = newStop;
            order.stoplossTrail.push(newStop);
        }
    }

    let exit = null;
    if (type === "call") {
        if (lastLtp >= order.targetPrice) exit = "target";
        else if (lastLtp <= order.stoplossPrice) exit = "stoploss";
    } else {
        if (lastLtp >= order.targetPrice) exit = "target";
        else if (lastLtp <= order.stoplossPrice) exit = "stoploss";
    }

    if (exit !== null) {
        order.status = "exited";
        order.exitTime = new Date().toISOString();
        order.exitReason = exit;
        saveOrderToDisk();
        orderMemory[type] = null;
        console.log(`Order ${type.toUpperCase()} exited by ${exit}.`);
        return true;
    }
    return false;
}

let lastStrike = null;

async function tracker() {
    const result = await getNearestOptionInstrumentKeys();
    if (!result) return;
    const { strike, callKey, putKey } = result;
    const ltpResult = await getLtp([callKey, putKey].join(","));
    if (!ltpResult || !ltpResult.call || !ltpResult.put) return;

    let entry = {
        strikePrice: strike,
        callLtp: ltpResult.call.last_price,
        callToken: ltpResult.call.instrument_token,
        putLtp: ltpResult.put.last_price,
        putToken: ltpResult.put.instrument_token
    };

    if (lastStrike !== null && strike !== lastStrike) {
        if (strike > lastStrike && strike - lastStrike <= 100) {
            // Upward logical jump; keep datalist
        } else if (strike < lastStrike) {
            datalist = [];
        }
    }
    lastStrike = strike;
    datalist.push(entry);
    if (datalist.length > datalistLength) datalist.shift();
    if (datalist.length > 1)
        while (datalist.length && datalist[0].strikePrice < strike) datalist.shift();

    // Monitor open orders' exit logic (trailing, stoploss, target)
    if (orderMemory.call) await monitorOrderLtp("call", entry.callLtp);
    if (orderMemory.put) await monitorOrderLtp("put", entry.putLtp);

    if (datalist.length < datalistLength) return;

    const calldiff = datalist[datalist.length - 1].callLtp - datalist[0].callLtp;
    const putdiff = datalist[datalist.length - 1].putLtp - datalist[0].putLtp;

    addLog(strike, entry, calldiff, putdiff);

    try {
        for (const lv of levels) {
            if (!orderMemory.call && calldiff > lv.threshold && calldiff > lv.minChange) {
                const upstoxResult = await placeOrderToUpstox(entry.callToken, qty, datalist[datalist.length - 1].callLtp, lv.stoploss, lv.gap);
                orderMemory.call = createOrderData("call", entry.callToken, datalist[datalist.length - 1].callLtp, lv.stoploss, lv.gap, qty, upstoxResult && upstoxResult.data ? upstoxResult.data.order_id : null);
                orderMemory.history.push({ ...orderMemory.call });
                saveOrderToDisk();
                break;
            }
            if (!orderMemory.put && putdiff > lv.threshold && datalist[0].putLtp > lv.minChange) {
                const upstoxResult = await placeOrderToUpstox(entry.putToken, qty, datalist[datalist.length - 1].putLtp, lv.stoploss, lv.gap);
                orderMemory.put = createOrderData("put", entry.putToken, datalist[datalist.length - 1].putLtp, lv.stoploss, lv.gap, qty, upstoxResult && upstoxResult.data ? upstoxResult.data.order_id : null);
                orderMemory.history.push({ ...orderMemory.put });
                saveOrderToDisk();
                break;
            }
        }
    } catch (e) { console.error(e); }
}

// Define the log list with max capacity 10
const maxLogLength = 10;
const logList = [];
function formatTimestamp() {
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata', month: 'short', hour12: false };
  const dd = now.toLocaleString('en-US', { ...options, day: '2-digit' });
  const mmm = now.toLocaleString('en-US', { ...options, month: 'short' });
  const yyyy = now.toLocaleString('en-US', { ...options, year: 'numeric' });
  const hh = now.toLocaleString('en-US', { ...options, hour: '2-digit' });
  const mm = now.toLocaleString('en-US', { ...options, minute: '2-digit' });
  const ss = now.toLocaleString('en-US', { ...options, second: '2-digit' });

  return `${dd}-${mmm}-${yyyy} ${hh}:${mm}:${ss}`;
}

function addLog(strike, entry, calldiff, putdiff) {
  const timestamp = formatTimestamp();
  const logEntry = {
    timestamp,
    strike,
    callLtp: entry.callLtp,
    putLtp: entry.putLtp,
    callDiff: Number(calldiff.toFixed(2)),
    putDiff: Number(putdiff.toFixed(2))
  };

  // Add new entry to list
  logList.push(logEntry);

  // Remove oldest if length exceeded max
  if (logList.length > maxLogLength) {
    logList.shift();
  }

  console.log(logEntry);
}

exports.tracker = tracker;
exports.logList = logList;
exports.orderMemory = orderMemory;
