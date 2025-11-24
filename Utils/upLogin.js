const qs = require('qs');
const axios = require('axios');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');  // Import chrome options
const speakeasy = require('speakeasy');

const redirectUri = 'https://localhost/getCode';
//const redirectUri = 'https://flyspring-feh2b5gqc4bchgh0.canadacentral-01.azurewebsites.net/getCode';
const mobileNumber = '9773544834';
const totpkey = '5IM3OQ4XMF2YK6ZD6T62TO36BBMYERWN';

const apikeys = [
  '64bcafc6-5965-46c3-9e9b-113e396b1ecb',
  '15b39ed0-f0b0-4e16-9948-80a46f62e295',
  '6cfc3a27-df0f-4aa8-9e33-7b8bc20b255b',
  '7b717ec7-2cd4-4ff8-b852-de03162a80f1',
  'a34aec7f-b199-4fc7-b0a3-ee965b61d9e1',
  '03f2cbd6-b835-43ad-a587-ca8a6190bf33',
];

const apiSecret = [
  'v4d0xp6cy3',
  'pe3ihrm4kw',
  'nyukt3ypxc',
  'u7qs0lh0g6',
  '4puy3lz9v6',
  'gva4ir4tfg',
];

const pinCode = '171285';


const MongoDBClient = require('./Utils/MongoDBClient.js');
const mongoClient = new MongoDBClient();



async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTokenbyAuthCode(authcode, state)
{
const currentDate = new Date();
  const datetimeoptions = {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
  };
  const istTime = currentDate.toLocaleString('en-GB', datetimeoptions);


  try{
    const apikey = apikeys[state-1];
    const apiSecretKey = apiSecret[state-1];
    const data = await getUpstoxAccessToken(apikey, apiSecretKey, redirectUri, authcode);
    const token = data.access_token;
     

    const newTokenValue = data.access_token;
    const collectionName = 'upstoxTokens';
    const clientInstance = new MongoDBClient();
    let mongoresp = null;

   
        // Ensure connection is active
        await MongoDBClient.connect(); 

        // 1. Check if the collection has any documents
        // We use an efficient count operation if possible, or fetch to check length
        const allDocs = await clientInstance.getData(collectionName, {});

        if (!allDocs || allDocs.length === 0) {
            // --- Collection is EMPTY: Insert a new document ---
          
            // Define the default document structure
            const initialDocument = {
                "Token1": "", // Set these to appropriate defaults if needed
                "Token2": "",
                "Token3": "",
                "Token4": "",
                "Token5": "",
                "Token6": "",
                "UpdatedOn": istTime
            };

            // Overwrite the specific token field being processed right now
            const tokenFieldName = `Token${state}`;
            initialDocument[tokenFieldName] = newTokenValue;
            
            mongoresp = await clientInstance.insertData(collectionName, initialDocument);
           

        } else {
            // --- Collection has data: Update the first document found ---

            // Get the _id of the first document found
            const firstDocumentId = allDocs[0]._id; 
            const filter = { _id: firstDocumentId };

            // Determine which token field to update dynamically
            const tokenFieldName = `Token${state}`; 

            // Define the update operation: set the new token AND the current timestamp
            const updateDoc = {
                $set: {
                    [tokenFieldName]: newTokenValue,
                    "UpdatedOn": istTime // Set current timestamp
                }
            };
            
            mongoresp = await clientInstance.updateData(collectionName, filter, updateDoc);
   

          }
    return token;
    }catch(err){console.log(err);}
    return null;
}
/**
 * Calls Upstox token API to exchange authorization code for access token.
 * Returns full response data (including access_token, extended_token, etc.)
 */
async function getUpstoxAccessToken(clientId, clientSecret, redirectUri, authorizationCode) {
  try {
    const response = await axios.post(
      'https://api.upstox.com/v2/login/authorization/token',
      qs.stringify({
        code: authorizationCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.data && response.data.access_token) {
      console.log('Access token retrieved successfully.');
      return response.data;
    } else {
      console.log('Failed to retrieve access token:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Upstox access token:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Build the Selenium driver with Chrome in headless mode
async function getToken() {
  const options = new chrome.Options();
  options.addArguments('--headless'); // Run Chrome in headless mode
  options.addArguments('--disable-gpu'); // Disable GPU (recommended for headless)
  options.addArguments('--no-sandbox'); // Sandbox sometimes causes problems

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const tokens = {};

  try {
    for (let i = 0; i < apikeys.length; i++) {
      const apikey = apikeys[i];
      const apiSecretKey = apiSecret[i];
      const state = (i + 1).toString();
      const loginurl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apikey}&redirect_uri=${redirectUri}&state=${state}`;

      await driver.get(loginurl);

      const mobileElements = await driver.findElements(By.id('mobileNum'));
      if (mobileElements.length > 0) {
        const elementMobile = await driver.wait(until.elementLocated(By.id('mobileNum')), 5000);
        await elementMobile.sendKeys(mobileNumber, Key.RETURN);
        await sleep(1000);
      }

      const otpElements = await driver.findElements(By.id('otpNum'));
      if (otpElements.length > 0) {
        const elementTotp = await driver.wait(until.elementLocated(By.id('otpNum')), 5000);
        const otp = speakeasy.totp({
          secret: totpkey,
          encoding: 'base32',
          algorithm: 'sha1',
          digits: 6,
          step: 30,
        });
        await elementTotp.sendKeys(otp, Key.RETURN);
        await sleep(1000);
      } else {
        console.log('OTP field not found, skipping this iteration.');
      }

      const pinElements = await driver.findElements(By.id('pinCode'));
      if (pinElements.length > 0) {
        const elementPin = await driver.wait(until.elementLocated(By.id('pinCode')), 5000);
        await elementPin.sendKeys(pinCode, Key.RETURN);
        if (i === 0) {
          await sleep(1000);
        }
      } else {
        console.log('PIN field not found, skipping this iteration.');
      }

      const currentUrlBefore = await driver.getCurrentUrl();
      await driver
        .wait(async () => {
          const currentUrlNow = await driver.getCurrentUrl();
          return currentUrlNow !== currentUrlBefore;
        }, 5000)
        .catch(() => console.log('URL did not change within wait time.'));

      const responseUrl = await driver.getCurrentUrl();
      const urlObj = new URL(responseUrl);
      const code = urlObj.searchParams.get('code');
      const returnedState = urlObj.searchParams.get('state');

      console.log(`Iteration ${i + 1}: Code = ${code}, State = ${returnedState}`);

      if (code && returnedState) {
        const tokenResponse = await getUpstoxAccessToken(apikey, apiSecretKey, redirectUri, code);

        if (tokenResponse && tokenResponse.access_token) {
          const tokenKey = `token${returnedState}`;
          tokens[tokenKey] = tokenResponse.access_token;
          console.log(`Access token for ${tokenKey}: ${tokenResponse.access_token}`);
        } else {
          console.log(`Failed to get access token for iteration ${i + 1}`);
        }
      } else {
        console.log(`No valid code or state for iteration ${i + 1}, skipping token exchange.`);
      }
    }
  } catch (err) {
    console.error('Error during token retrieval:', err);
  } finally {
    await driver.quit();
    console.log('Browser closed.');
  }

  console.log('All tokens:', tokens);
  return tokens;
}


const getCurrentDateTime = () => {
    // Input format: "DD/MM/YYYY, HH:MM:SS"


    const currentDate = new Date();
  const datetimeoptions = {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
  };
  const dateTimeString = currentDate.toLocaleString('en-GB', datetimeoptions);

    const [datePart, timePart] = dateTimeString.split(', ');
    const [day, monthStr, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    // Note: JavaScript months are 0-indexed (0=January, 11=December),
    // so we subtract 1 from the month part.
    const dateObject = new Date(
        parseInt(year, 10),
        parseInt(monthStr, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
    );
    
    return dateObject;
};


exports.getToken = getToken;
exports.getTokenbyAuthCode = getTokenbyAuthCode;
