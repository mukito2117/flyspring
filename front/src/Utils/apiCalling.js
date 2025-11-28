// src/utils/apiCalling.js

// Define the base URL for your backend API
// Use a relative path if the backend runs on the same host/port as your React app proxy
//const API_BASE_URL = ''; 
// Or use an absolute URL if your backend is separate (e.g., 'http://localhost:3001')
 const API_BASE_URL = 'https://www.flyspring.in/api'; 


/**
 * A generic helper function to make API requests.
 * @param {string} endpoint - The API endpoint path (e.g., '/placeorder/details').
 * @param {string} method - HTTP method (GET, POST, etc.).
 * @param {object} [data=null] - Request body data for POST/PUT requests.
 * @returns {Promise<any>} The parsed JSON response data.
 */
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  // Construct the full URL using the base
  const url = `${API_BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Add other headers like authorization tokens here if needed
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
    throw new Error(errorData.message || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// --- Specific API Call Functions ---

/**
 * Fetches the list of orders from the /placeorder/details endpoint.
 */
export const fetchOrdersDetails = async () => {
  return apiRequest('/placeorder/details', 'GET');
};


export const setExpiry = async () => {
  return apiRequest('/setExpiry', 'GET');
};

/**
 * Example POST request for placing a new order.
 */
export const placeNewOrder = async (orderData) => {
  return apiRequest('/placeorder/new', 'POST', orderData);
};

export default apiRequest;
