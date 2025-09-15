/**
 * api.js: API Service Module
 *
 * This file centralizes all the HTTP requests to the backend API.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
    if (response.status === 204) return; 
    const data = await response.json();
    if (!response.ok) {
        const error = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
        return Promise.reject(new Error(error));
    }
    return data;
};


// --- Authentication ---
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

// --- Public Routes ---
export const getPublicDepartments = async () => {
  const response = await fetch(`${API_BASE_URL}/api/public/departments`);
  return handleResponse(response);
};

export const getPublicFilters = async (departmentId) => {
  const response = await fetch(`${API_BASE_URL}/api/public/filters/${departmentId}`);
  return handleResponse(response);
};

export const getPublicTimetable = async (departmentId, type, value) => {
  const params = new URLSearchParams({ department_id: departmentId, type, value });
  const response = await fetch(`${API_BASE_URL}/api/public/timetable?${params}`);
  return handleResponse(response);
};

// --- Admin: Department Management ---
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

export const updateDepartment = async (id, departmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/departments/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(departmentData),
    });
    return handleResponse(response);
};

export const deleteDepartment = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/departments/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
};


// --- Admin: User Management ---
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

export const updateUser = async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const deleteUser = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
};

// --- Admin: Course Data Management ---
export const getSubjectsForDepartment = async (deptId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/data/subjects/${deptId}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};
export const getRoomsForDepartment = async (deptId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/data/rooms/${deptId}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};
export const getBatchesForDepartment = async (deptId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/data/batches/${deptId}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};
export const getFacultyForDepartment = async (deptId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/data/faculty/${deptId}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};
export const updateFaculty = async (facultyId, facultyData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/faculty/${facultyId}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(facultyData),
    });
    return handleResponse(response);
};


// --- HOD Routes ---
export const addTeacher = async (facultyData) => {
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

// --- Teacher & HOD Routes ---
export const getDataForMyDepartment = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/data-for-my-department`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// --- Universal Course Data Routes (for Teacher, HOD, & Admin) ---

// CREATE
export const addSubject = async (subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/subjects`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(subjectData),
    });
    return handleResponse(response);
};
export const addRoom = async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(roomData),
    });
    return handleResponse(response);
};
export const addBatch = async (batchData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/batches`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(batchData),
    });
    return handleResponse(response);
};

// UPDATE
export const updateSubject = async (id, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/subjects/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(subjectData),
    });
    return handleResponse(response);
};
export const updateRoom = async (id, roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(roomData),
    });
    return handleResponse(response);
};
export const updateBatch = async (id, batchData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/batches/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(batchData),
    });
    return handleResponse(response);
};

// DELETE
export const deleteSubject = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/subjects/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
};
export const deleteRoom = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
};
export const deleteBatch = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/batches/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
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

// --- Admin: Dashboard Stats ---
export const getDashboardStats = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: getAuthHeaders() });
    return handleResponse(response);
};