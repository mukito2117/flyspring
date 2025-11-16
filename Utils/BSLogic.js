const axios = require("axios");

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