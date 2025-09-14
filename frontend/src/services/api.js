/**
 * api.js: API Service Module
 *
 * This file centralizes all the HTTP requests to the backend API.
 * It simplifies component logic by abstracting away the details of fetch,
 * headers, and error handling.
 */

// The base URL of your Flask backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  // If the response is a 204 No Content, we don't need to parse a body
  if (response.status === 204) {
    return;
  }
  const data = await response.json();
  if (!response.ok) {
    // If the server returns an error (4xx or 5xx), throw an error
    // with the message from the API response.
    const error = (data && (data.message || data.error)) || response.statusText;
    return Promise.reject(new Error(error));
  }
  return data;
};

// --- Authentication ---
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
  const response = await fetch(`${API_BASE_URL}/api/public/filters`);
  return handleResponse(response);
};

export const getPublicTimetable = async (type, value) => {
  const params = new URLSearchParams({ type, value });
  const response = await fetch(`${API_BASE_URL}/api/public/timetable?${params}`);
  return handleResponse(response);
};

// --- Admin GET Routes (Protected) ---
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const getAllAdminData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/all-data`, { headers: getAuthHeaders() });
  return handleResponse(response);
};


// --- Admin POST (Create) Routes ---
export const addSubject = async (subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/add-subject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subjectData),
    });
    return handleResponse(response);
};

export const addFaculty = async (facultyData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/add-faculty`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(facultyData),
    });
    return handleResponse(response);
};

export const addRoom = async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/add-room`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(roomData),
    });
    return handleResponse(response);
};

export const addBatch = async (batchData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/add-batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(batchData),
    });
    return handleResponse(response);
};


// --- Admin PUT (Update) Routes ---
export const updateSubject = async (id, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/update-subject/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(subjectData),
    });
    return handleResponse(response);
};

export const updateFaculty = async (id, facultyData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/update-faculty/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(facultyData),
    });
    return handleResponse(response);
};

export const updateRoom = async (id, roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/update-room/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(roomData),
    });
    return handleResponse(response);
};

export const updateBatch = async (id, batchData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/update-batch/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(batchData),
    });
    return handleResponse(response);
};


// --- Admin DELETE Routes ---
export const deleteSubject = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delete-subject/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const deleteFaculty = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delete-faculty/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const deleteRoom = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delete-room/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const deleteBatch = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delete-batch/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};


// --- Timetable Generation & Publishing ---
export const generateTimetable = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const publishTimetable = async (timetableData) => {
  const response = await fetch(`${API_BAsE_URL}/api/admin/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(timetableData),
  });
  return handleResponse(response);
};

