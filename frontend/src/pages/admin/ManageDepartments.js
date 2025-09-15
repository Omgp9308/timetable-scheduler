import React, { useState, useEffect } from 'react';
import { addDepartment, getDepartments, updateDepartment, deleteDepartment } from '../../services/api'; 
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal'; // Import the new Modal component

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for modals
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null); // null for 'Add', department object for 'Edit'
    const [departmentName, setDepartmentName] = useState('');
    const [departmentToDelete, setDepartmentToDelete] = useState(null);

    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            setError('Failed to fetch departments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleOpenAddModal = () => {
        setEditingDepartment(null);
        setDepartmentName('');
        setError('');
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (dept) => {
        setEditingDepartment(dept);
        setDepartmentName(dept.name);
        setError('');
        setAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (dept) => {
        setDepartmentToDelete(dept);
    };
    
    const handleCloseModals = () => {
        setAddEditModalOpen(false);
        setDepartmentToDelete(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentName.trim()) {
            setError('Department name cannot be empty.');
            return;
        }
        try {
            if (editingDepartment) {
                await updateDepartment(editingDepartment.id, { name: departmentName });
                showSuccessMessage('Department updated successfully!');
            } else {
                await addDepartment({ name: departmentName });
                showSuccessMessage('Department added successfully!');
            }
            handleCloseModals();
            fetchDepartments(); // Refresh the list
        } catch (err) {
            setError(err.message || 'An error occurred.');
        }
    };

    const handleDelete = async () => {
        if (!departmentToDelete) return;
        try {
            await deleteDepartment(departmentToDelete.id);
            showSuccessMessage('Department deleted successfully!');
            handleCloseModals();
            fetchDepartments(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to delete department. Make sure no users or data are assigned to it.');
            handleCloseModals();
        }
    };

    if (isLoading) {
        return <Spinner message="Loading departments..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Departments</h1>
            <p>Here you can add, edit, and delete departments in the system.</p>

            {error && !isAddEditModalOpen && !departmentToDelete && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card shadow-sm">
                 <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Existing Departments</h5>
                    <button className="btn btn-primary" onClick={handleOpenAddModal}>
                        <i className="bi bi-plus-lg me-2"></i>
                        Add New Department
                    </button>
                </div>
                <div className="card-body">
                    {departments.length > 0 ? (
                        <ul className="list-group">
                            {departments.map(dept => (
                                <li key={dept.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    {dept.name}
                                    <div>
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleOpenEditModal(dept)}>
                                            <i className="bi bi-pencil-fill"></i> Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleOpenDeleteModal(dept)}>
                                            <i className="bi bi-trash-fill"></i> Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">No departments have been added yet.</p>
                    )}
                </div>
            </div>

            <Modal
                show={isAddEditModalOpen}
                handleClose={handleCloseModals}
                title={editingDepartment ? 'Edit Department' : 'Add New Department'}
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
                        <button type="submit" form="departmentForm" className="btn btn-primary">Save Changes</button>
                    </>
                }
            >
                <form id="departmentForm" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="departmentName" className="form-label">Department Name</label>
                        <input
                            type="text"
                            id="departmentName"
                            className="form-control"
                            placeholder="e.g., Mechanical Engineering"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            required
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                show={!!departmentToDelete}
                handleClose={handleCloseModals}
                title="Confirm Deletion"
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={handleDelete}>Confirm Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete the "{departmentToDelete?.name}" department? This action cannot be undone.</p>
            </Modal>

        </div>
    );
};

export default ManageDepartments; 