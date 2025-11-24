const axios = require("axios");

const HISTORY_WINDOW = 3000; // 3 seconds
const HISTORY_LIMIT = HISTORY_WINDOW / 250; // 12 samples

let strikeHistory = {};

const OIChange = 10; // percentage
const VolChange = 2; // percentage
const IVChange = 1.5; 
function saveToHistory(data) {
  const key = data.strike;

  if (!strikeHistory[key]) {
    strikeHistory[key] = [];
  }

  strikeHistory[key].push(data);

  // Keep only last N entries
  if (strikeHistory[key].length > HISTORY_LIMIT) {
    strikeHistory[key].shift();
  }
}

function detectTrendMove(strike) {
  const history = strikeHistory[strike];
  if (!history || history.length < 3) return;

  const first = history[0];
  const last  = history[history.length - 1];

  // ---- Trend Calculations ----
  const callLtpChange = ((last.callLtp - first.callLtp) / first.callLtp) * 100;
  const putLtpChange  = ((last.putLtp - first.putLtp) / first.putLtp) * 100;

  const callOIChange = ((last.callOI - first.callOI) / first.callOI) * 100;
  const putOIChange  = ((last.putOI - first.putOI) / first.putOI) * 100;

  const callVolRatio = last.callVolume / first.callVolume;
  const putVolRatio  = last.putVolume / first.putVolume;

  // ---- NEW: IV CHANGE ----
  const callIVChange = (last.callIV - first.callIV);
  const putIVChange  = (last.putIV - first.putIV)

  let alerts = [];

  // ---- Trend Logic ----
  if (callLtpChange > 10) alerts.push(`CALL LTP Trend ↑ ${callLtpChange.toFixed(2)}%`);
  if (putLtpChange > 10) alerts.push(`PUT LTP Trend ↑ ${putLtpChange.toFixed(2)}%`);

  if (callOIChange > OIChange) alerts.push(`CALL OI Trend ↑ ${callOIChange.toFixed(2)}%`);
  if (putOIChange > OIChange) alerts.push(`PUT OI Trend ↑ ${putOIChange.toFixed(2)}%`);

  if (callVolRatio > VolChange) alerts.push(`CALL Vol Trend ×${callVolRatio.toFixed(1)}`);
  if (putVolRatio > VolChange) alerts.push(`PUT Vol Trend ×${putVolRatio.toFixed(1)}`);

  // ---- NEW: IV TREND ----
  if (callIVChange > IVChange) alerts.push(`CALL IV Trend ↑ ${callIVChange.toFixed(2)}%`);
  if (putIVChange > IVChange) alerts.push(`PUT IV Trend ↑ ${putIVChange.toFixed(2)}%`);

  // ---- Print If Big Move ----
  if (alerts.length > 0) {
    console.log(`\n🔥 TREND MOVE (3 sec) on Strike ${strike}`);
    console.log(alerts.join(", "));
    console.log({
      callLTP: `${first.callLtp} → ${last.callLtp} -> Change - ${callLtpChange.toFixed(2)}%`,
      putLTP : `${first.putLtp} → ${last.putLtp} -> Change - ${putLtpChange.toFixed(2)}%`,
      callOI : `${first.callOI} → ${last.callOI} -> Change - ${callOIChange.toFixed(2)}%`,
      putOI  : `${first.putOI} → ${last.putOI} -> Change - ${putOIChange.toFixed(2)}%`,
      callVolume: `${first.callVolume} → ${last.callVolume} -> Change - ${callVolRatio.toFixed(2)}x`,
      putVolume : `${first.putVolume} → ${last.putVolume} -> Change - ${putVolRatio.toFixed(2)}x`,
      callIV: `${first.callIV} → ${last.callIV} -> Change - ${callIVChange.toFixed(2)}%`,
      putIV : `${first.putIV} → ${last.putIV} -> Change - ${putIVChange.toFixed(2)}%`,
      Samples: history.length
    });
    console.log("--------------------------------------------------");
  }
}