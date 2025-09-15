/**
 * api.js: API Service Module
 *
 * This file centralizes all the HTTP requests to the backend API.
 * It's organized by user roles (Public, Admin, HOD, Teacher) for clarity.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Creates the authorization headers for authenticated requests.
 * @returns {HeadersInit} A headers object with the Authorization token if it exists.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * A generic handler for API responses. It checks for errors and parses JSON.
 * @param {Response} response The raw response from the fetch call.
 * @returns {Promise<any>} The parsed JSON data.
 */
const handleResponse = async (response) => {
  if (response.status === 204) return; // No Content
  const data = await response.json();
  if (!response.ok) {
    const error = (data && (data.message || data.error)) || response.statusText;
    return Promise.reject(new Error(error));
  }
  return data;
};

// ============================================================================
// --- PUBLIC ROUTES ---
// ============================================================================

export const getPublicFilters = async () => {
  const response = await fetch(`${API_BASE_URL}/api/public/filters`);
  return handleResponse(response);
};

export const getPublicTimetable = async (type, value) => {
  const params = new URLSearchParams({ type, value });
  const response = await fetch(`${API_BASE_URL}/api/public/timetable?${params}`);
  return handleResponse(response);
};

// ============================================================================
// --- AUTHENTICATION ---
// ============================================================================

export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

// ============================================================================
// --- ADMIN ROUTES ---
// ============================================================================

export const getDepartments = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const addDepartment = async (departmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(departmentData),
    });
    return handleResponse(response);
};

export const getUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const addUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

// A placeholder function for admin dashboard stats
export const getDashboardStats = async () => {
    // In a real app, this would be a dedicated endpoint.
    // Here, we can just reuse an existing data fetch for simplicity.
    const response = await fetch(`${API_BASE_URL}/api/admin/data-for-my-department`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// ============================================================================
// --- HOD ROUTES ---
// ============================================================================

export const addFaculty = async (facultyData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(facultyData),
    });
    return handleResponse(response);
};

export const getPendingTimetables = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/timetables/pending`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const approveTimetable = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/timetables/approve/${id}`, {
        method: 'POST', headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const rejectTimetable = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/timetables/reject/${id}`, {
        method: 'POST', headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// ============================================================================
// --- TEACHER & HOD SHARED ROUTES ---
// ============================================================================

export const getDataForMyDepartment = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/data-for-my-department`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// --- Subject CRUD ---
export const addSubject = async (subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/subjects`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(subjectData),
    });
    return handleResponse(response);
};

export const updateSubject = async (id, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/subjects/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(subjectData),
    });
    return handleResponse(response);
};

export const deleteSubject = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/subjects/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// --- Room CRUD ---
export const addRoom = async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(roomData),
    });
    return handleResponse(response);
};

export const updateRoom = async (id, roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(roomData),
    });
    return handleResponse(response);
};

export const deleteRoom = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// --- Batch CRUD ---
export const addBatch = async (batchData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/batches`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(batchData),
    });
    return handleResponse(response);
};

export const updateBatch = async (id, batchData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/batches/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(batchData),
    });
    return handleResponse(response);
};

export const deleteBatch = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/batches/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// --- Timetable Workflow ---
export const generateAndSaveTimetable = async (name) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/generate-and-save`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};

export const getDraftTimetables = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/timetables/drafts`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const submitTimetableForApproval = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/timetables/submit/${id}`, {
        method: 'POST', headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
