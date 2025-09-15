import React, { useState, useEffect } from 'react';
// Import the actual API functions
import { addDepartment, getDepartments } from '../../services/api'; 
import Spinner from '../../components/Spinner';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');
    
    // We will now use the real API functions
    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            setError('Failed to fetch departments.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000); // Hide after 3 seconds
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newDepartmentName.trim()) {
            setError('Department name cannot be empty.');
            return;
        }
        try {
            const newDept = await addDepartment({ name: newDepartmentName });
            setDepartments([...departments, newDept]);
            setNewDepartmentName('');
            showSuccessMessage(`Department "${newDept.name}" added successfully.`);
        } catch (err) {
            setError(err.message || 'Failed to add department.');
        }
    };

    if (isLoading) {
        return <Spinner message="Loading departments..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Departments</h1>
            <p>Here you can add new departments to the system.</p>

            {/* Add Department Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Add New Department</h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleAddDepartment}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., Mechanical Engineering"
                                value={newDepartmentName}
                                onChange={(e) => setNewDepartmentName(e.target.value)}
                            />
                            <button className="btn btn-primary" type="submit">
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Department
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Departments List */}
            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">Existing Departments</h5>
                </div>
                <div className="card-body">
                    {departments.length > 0 ? (
                        <ul className="list-group">
                            {departments.map(dept => (
                                <li key={dept.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    {dept.name}
                                    {/* // Future implementation: Add edit/delete buttons when backend supports it
                                    <div>
                                        <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                                        <button className="btn btn-sm btn-outline-danger">Delete</button>
                                    </div>
                                    */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">No departments have been added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageDepartments;

