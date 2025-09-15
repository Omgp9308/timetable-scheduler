import React, { useState, useEffect } from 'react';
// Import the actual API functions
import { addUser, getUsers, getDepartments } from '../../services/api'; 
import Spinner from '../../components/Spinner';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // State for the new user form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('HOD');
    const [selectedDept, setSelectedDept] = useState('');

    // Function to fetch all necessary data from the backend
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersData, deptsData] = await Promise.all([
                getUsers(),
                getDepartments()
            ]);
            setUsers(usersData);
            setDepartments(deptsData);
            if (deptsData.length > 0) {
                setSelectedDept(deptsData[0].id);
            }
        } catch (err) {
            setError('Failed to fetch initial user and department data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000); // Hide after 3 seconds
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!newUsername.trim() || !newPassword.trim() || !selectedRole) {
            setError('Username, password, and role are required.');
            return;
        }
        if (selectedRole !== 'Admin' && !selectedDept) {
            setError('A department must be selected for HOD or Teacher roles.');
            return;
        }

        try {
            const newUserPayload = {
                username: newUsername,
                password: newPassword,
                role: selectedRole,
                department_id: selectedRole === 'Admin' ? null : selectedDept
            };
            const newUser = await addUser(newUserPayload);
            
            // Manually add department name to the new user object for immediate display
            const deptName = departments.find(d => d.id === newUser.department_id)?.name || 'N/A';
            setUsers([...users, { ...newUser, department_name: deptName }]);

            // Reset form
            setNewUsername('');
            setNewPassword('');
            showSuccessMessage(`User "${newUser.username}" created successfully.`);

        } catch (err) {
            setError(err.message || 'Failed to add user. The username may already exist.');
        }
    };

    if (isLoading) {
        return <Spinner message="Loading users and departments..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Users</h1>
            <p>Here you can create new user accounts for Administrators or Heads of Departments (HODs).</p>

            {/* Add User Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Create New User Account</h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleAddUser}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    required
                                />
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                                    <option value="HOD">HOD</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Department</label>
                                <select 
                                    className="form-select" 
                                    value={selectedDept} 
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    disabled={selectedRole === 'Admin' || departments.length === 0}
                                >
                                     {departments.length === 0 && <option>No departments available</option>}
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-primary mt-3" type="submit">
                            <i className="bi bi-person-plus-fill me-2"></i>
                            Create User
                        </button>
                    </form>
                </div>
            </div>

            {/* Users List */}
            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">Existing Users</h5>
                </div>
                <div className="card-body">
                     {users.length > 0 ? (
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.role}</td>
                                        <td>{user.department_name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">No users have been created yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
