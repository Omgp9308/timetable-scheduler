import React, { useState, useEffect } from 'react';
import { addUser, getUsers, getDepartments, updateUser, deleteUser } from '../../services/api'; 
import Spinner from '../../components/Spinner';

// Reusable Modal Component for Forms
const FormModal = ({ show, handleClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        </div>
    );
};

// Reusable Confirmation Modal for Delete Actions
const ConfirmationModal = ({ show, handleClose, handleConfirm, title, message }) => {
    if (!show) return null;
    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body"><p>{message}</p></div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={handleConfirm}>Confirm Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // State for modals and forms
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null for 'Add', user object for 'Edit'
    const [formData, setFormData] = useState({});
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersData, deptsData] = await Promise.all([getUsers(), getDepartments()]);
            setUsers(usersData);
            setDepartments(deptsData);
        } catch (err) {
            setError('Failed to fetch initial data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setFormData({ role: 'HOD', department_id: departments[0]?.id || '' });
        setError('');
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setFormData({ ...user, password: '' }); // Clear password field for security
        setError('');
        setAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
    };

    const handleCloseModals = () => {
        setAddEditModalOpen(false);
        setUserToDelete(null);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username?.trim() || !formData.role) {
            setError('Username and role are required.');
            return;
        }
        if (!editingUser && !formData.password?.trim()) {
            setError('Password is required for new users.');
            return;
        }

        try {
            if (editingUser) {
                // Don't send an empty password field on update
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await updateUser(editingUser.id, payload);
                showSuccessMessage('User updated successfully!');
            } else {
                await addUser(formData);
                showSuccessMessage('User added successfully!');
            }
            handleCloseModals();
            fetchData();
        } catch (err) {
            setError(err.message || 'An error occurred.');
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete.id);
            showSuccessMessage('User deleted successfully!');
            handleCloseModals();
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to delete user.');
            handleCloseModals();
        }
    };

    if (isLoading) {
        return <Spinner message="Loading users and departments..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Users</h1>
            <p>Here you can create, edit, and delete user accounts.</p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Existing Users</h5>
                    <button className="btn btn-primary" onClick={handleOpenAddModal}>
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Add New User
                    </button>
                </div>
                <div className="card-body">
                     {users.length > 0 ? (
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.role}</td>
                                        <td>{user.department_name || 'N/A'}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleOpenEditModal(user)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleOpenDeleteModal(user)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">No users have been created yet.</p>
                    )}
                </div>
            </div>

            <FormModal 
                show={isAddEditModalOpen}
                handleClose={handleCloseModals}
                title={editingUser ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Username</label>
                            <input type="text" name="username" className="form-control" value={formData.username || ''} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-control" onChange={handleInputChange} placeholder={editingUser ? 'Leave blank to keep unchanged' : ''} required={!editingUser} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Role</label>
                            <select name="role" className="form-select" value={formData.role || 'HOD'} onChange={handleInputChange}>
                                <option value="Admin">Admin</option>
                                <option value="HOD">HOD</option>
                                <option value="Teacher">Teacher</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Department</label>
                            <select name="department_id" className="form-select" value={formData.department_id || ''} onChange={handleInputChange} disabled={formData.role === 'Admin'}>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer mt-3">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </FormModal>

            <ConfirmationModal
                show={!!userToDelete}
                handleClose={handleCloseModals}
                handleConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the user "${userToDelete?.username}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default ManageUsers;

