import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    getDataForMyDepartment, 
    addTeacher, 
    updateTeacherByHOD,
    deleteTeacherByHOD 
} from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

/**
 * ManageTeachers Component (CRUD for HOD)
 *
 * This component provides a complete interface for HODs to manage
 * teacher accounts and their associated faculty profiles within their
 * department.
 */
const ManageTeachers = () => {
    const { user } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // State for forms and modals
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [formData, setFormData] = useState({});
    const [teacherToDelete, setTeacherToDelete] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const deptData = await getDataForMyDepartment();
            setTeachers(deptData.faculty);
            setSubjects(deptData.subjects);
        } catch (err) {
            setError('Failed to fetch department data.');
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
        setTimeout(() => setSuccess(''), 4000);
    };

    const openModal = (type, data = {}) => {
        setModalState({ type, data });
        if (type === 'edit-teacher') {
            setFormData({ ...data, expertise: data.expertise.map(String), password: '' });
        } else {
            setFormData(data || {});
        }
        setError('');
    };

    const closeModal = () => {
        setModalState({ type: null, data: null });
        setFormData({});
        setTeacherToDelete(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, expertise: values }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { type, data } = modalState;
            if (type === 'add-teacher') {
                await addTeacher(formData);
                showSuccessMessage('Teacher added successfully!');
            } else if (type === 'edit-teacher') {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await updateTeacherByHOD(data.user_id, payload);
                showSuccessMessage('Teacher updated successfully!');
            }
            closeModal();
            fetchData();
        } catch (err) {
            setError(err.message || 'An error occurred.');
        }
    };

    const handleDelete = async (teacher) => {
        setTeacherToDelete(teacher);
    };

    const confirmDelete = async () => {
        if (!teacherToDelete) return;
        try {
            await deleteTeacherByHOD(teacherToDelete.user_id);
            showSuccessMessage('Teacher deleted successfully!');
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to delete teacher.');
        } finally {
            closeModal();
        }
    };

    if (isLoading) {
        return <Spinner message="Loading department faculty..." />;
    }

    const renderActionButtons = (teacher) => (
        <td>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('edit-teacher', teacher)}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(teacher)}>Delete</button>
        </td>
    );

    return (
        <div>
            <h1 className="h2">Manage Teachers</h1>
            <p>
                As HOD of <strong>{user.department_name}</strong>, you can add, edit, and remove teachers from your department.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Department Faculty</h5>
                    <button className="btn btn-primary" onClick={() => openModal('add-teacher', { expertise: [] })}>
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Add New Teacher
                    </button>
                </div>
                <div className="card-body">
                    {teachers.length > 0 ? (
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Login Username</th>
                                    <th>Expertise (Subject IDs)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.username || 'N/A'}</td>
                                        <td>{teacher.expertise.join(', ')}</td>
                                        {renderActionButtons(teacher)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">No teachers have been added to this department yet.</p>
                    )}
                </div>
            </div>

            {/* Add/Edit Teacher Modal */}
            <Modal
                show={modalState.type === 'add-teacher' || modalState.type === 'edit-teacher'}
                handleClose={closeModal}
                title={modalState.type === 'add-teacher' ? 'Add New Teacher' : `Edit Teacher: ${modalState.data?.name}`}
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" form="teacherForm" className="btn btn-primary">Save Changes</button>
                    </>
                }
            >
                <form id="teacherForm" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Username (for login)</label>
                            <input type="text" name="username" className="form-control" value={formData.username || ''} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-control" onChange={handleInputChange} placeholder={modalState.type === 'edit-teacher' ? 'Leave blank to keep unchanged' : ''} required={modalState.type === 'add-teacher'} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Expertise (Subjects)</label>
                            <select multiple className="form-select" style={{ height: '150px' }} value={formData.expertise || []} onChange={handleMultiSelectChange} required>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                            </select>
                            <div className="form-text">Hold Ctrl (or Cmd on Mac) to select multiple subjects.</div>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={!!teacherToDelete}
                handleClose={closeModal}
                title="Confirm Deletion"
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={confirmDelete}>Confirm Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete the teacher "{teacherToDelete?.name}"? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default ManageTeachers;