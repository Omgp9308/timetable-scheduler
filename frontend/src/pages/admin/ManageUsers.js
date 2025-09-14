import React, { useState, useEffect } from 'react';
// We will add these functions to the api service
import { addUser, getUsers, getDepartments } from '../../services/api'; 
import Spinner from '../../components/Spinner';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for the new user form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('HOD');
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both users and departments in parallel
                const [usersData, deptsData] = await Promise.all([
                    getUsers(),
                    getDepartments()
                ]);
                setUsers(usersData);
                setDepartments(deptsData);
                // Set a default department for the dropdown if available
                if (deptsData.length > 0) {
                    setSelectedDept(deptsData[0].id);
                }
            } catch (err) {
                setError('Failed to fetch initial data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUsername.trim() || !newPassword.trim() || !selectedRole || !selectedDept) {
            setError('All fields are required.');
            return;
        }
        try {
            const newUserPayload = {
                username: newUsername,
                password: newPassword,
                role: selectedRole,
                department_id: selectedDept
            };
            const newUser = await addUser(newUserPayload);
            setUsers([...users, newUser]);
            // Reset form
            setNewUsername('');
            setNewPassword('');
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to add user. The username may already exist.');
        }
    };

    if (isLoading) {
        return <Spinner message="Loading users and departments..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Users (HODs)</h1>
            <p>Here you can create new user accounts for Heads of Departments.</p>

            {/* Add User Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Create New HOD Account</h5>
                    <form onSubmit={handleAddUser}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={selectedRole} disabled>
                                    <option value="HOD">HOD</option>
                                </select>
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Department</label>
                                <select 
                                    className="form-select" 
                                    value={selectedDept} 
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
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
