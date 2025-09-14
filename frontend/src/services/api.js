/**
 * api.js: API Service Module
 *
 * This file centralizes all the HTTP requests to the backend API.
 * It simplifies component logic by abstracting away the details of fetch,
 * headers, and error handling.
 */

// The base URL of your Flask backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ;

/**
 * A helper function to get standard headers, including the auth token if it exists.
 * @returns {HeadersInit} A headers object for the fetch request.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    // In a real JWT setup, it would be 'Bearer ${token}'
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * A helper function to handle the response from the fetch API.
 * It checks for errors and parses the JSON body.
 * @param {Response} response The response object from a fetch call.
 * @returns {Promise<any>} A promise that resolves with the JSON data.
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // If the server returns an error (4xx or 5xx), throw an error
    // with the message from the API response.
    const error = (data && data.message) || response.statusText;
    return Promise.reject(new Error(error));
  }
  return data;
};

// --- Authentication ---
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

// --- Public Routes ---
export const getPublicFilters = async () => {
  const response = await fetch(`${API_BASE_URL}/public/filters`);
  return handleResponse(response);
};

export const getPublicTimetable = async (type, value) => {
  // Use URLSearchParams to safely construct the query string
  const params = new URLSearchParams({ type, value });
  const response = await fetch(`${API_BASE_URL}/public/timetable?${params}`);
  return handleResponse(response);
};

// --- Admin Routes (Protected) ---
export const getDashboardStats = async () => {
  // This endpoint needs to be created in your Flask backend.
  // It should return counts of subjects, faculty, etc.
  const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const getAllAdminData = async () => {
  // This endpoint also needs to be created in your Flask backend.
  // It should return the full lists of all data types.
  const response = await fetch(`${API_BASE_URL}/admin/all-data`, { headers: getAuthHeaders() });
  return handleResponse(response);
};


export const generateTimetable = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};