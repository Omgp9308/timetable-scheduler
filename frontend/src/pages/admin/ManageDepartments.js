import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
// We will need to add these functions to the api service in the next step
// import { addDepartment, getDepartments } from '../../services/api'; 
import Spinner from '../../components/Spinner';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');
    
    // Mock API functions for now - we will replace these
    const getDepartments = async () => Promise.resolve([{id: 1, name: "Computer Science"}, {id: 2, name: "Electrical Engineering"}]);
    const addDepartment = async (name) => Promise.resolve({id: 3, name});


    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch (err) {
                setError('Failed to fetch departments.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDepartmentName.trim()) {
            setError('Department name cannot be empty.');
            return;
        }
        try {
            const newDept = await addDepartment({ name: newDepartmentName });
            setDepartments([...departments, newDept]);
            setNewDepartmentName('');
            setError('');
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
                    <form onSubmit={handleAddDepartment}>
                        {error && <div className="alert alert-danger">{error}</div>}
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
                                    {/* Edit/Delete buttons can be added here later */}
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
