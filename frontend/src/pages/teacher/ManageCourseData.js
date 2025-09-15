import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    getDataForMyDepartment,
    addSubject, addRoom, addBatch,
    updateSubject, updateRoom, updateBatch,
    deleteSubject, deleteRoom, deleteBatch
} from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal'; // Import the new Modal component

const ManageCourseData = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('subjects');
    const [departmentData, setDepartmentData] = useState({ subjects: [], rooms: [], batches: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for forms and modals
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'add-subject', 'edit-room', etc.
    const [formData, setFormData] = useState({});

    // State for the delete confirmation modal
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'subject', id: 123 }


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getDataForMyDepartment();
            setDepartmentData(data);
        } catch (err) {
            setError('Failed to fetch department data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 4000); // Hide after 4 seconds
    };

    const openModal = (type, data = {}) => {
        setModalState({ type, data });
        // For editing a batch, ensure subjects are pre-selected correctly
        if (type === 'edit-batch' && data.subjects) {
            setFormData({...data, subjects: data.subjects.map(String) });
        } else {
            setFormData(data || {});
        }
        setError(''); // Clear previous errors
    };

    const closeModal = () => {
        setModalState({ type: null, data: null });
        setFormData({});
        setDeleteTarget(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMultiSelectChange = (e, field) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, [field]: values }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { type, data } = modalState;

            if (type.startsWith('add')) {
                if (type === 'add-subject') await addSubject(formData);
                if (type === 'add-room') await addRoom(formData);
                if (type === 'add-batch') await addBatch(formData);
            } else if (type.startsWith('edit')) {
                if (type === 'edit-subject') await updateSubject(data.id, formData);
                if (type === 'edit-room') await updateRoom(data.id, formData);
                if (type === 'edit-batch') await updateBatch(data.id, formData);
            }
            showSuccessMessage(`Successfully saved ${type.split('-')[1]}.`);
            closeModal();
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.message || `Failed to save ${modalState.type.split('-')[1]}.`);
        }
    };

    const handleDelete = (type, id) => {
        setDeleteTarget({ type, id });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { type, id } = deleteTarget;
        try {
            if (type === 'subject') await deleteSubject(id);
            if (type === 'room') await deleteRoom(id);
            if (type === 'batch') await deleteBatch(id);
            showSuccessMessage(`Successfully deleted ${type}.`);
            fetchData();
        } catch (err) {
            setError(err.message || `Failed to delete ${type}.`);
        } finally {
            setDeleteTarget(null); // Close the confirmation modal
        }
    };

    if (isLoading) {
        return <Spinner message="Loading your department's data..." />;
    }

    const renderActionButtons = (type, item) => (
        <td>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal(`edit-${type}`, item)}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(type, item.id)}>Delete</button>
        </td>
    );

    return (
        <div>
            <h1 className="h2">Manage Course Data</h1>
            <p>As a teacher in the <strong>{user.department_name}</strong> department, you can manage subjects, rooms, and batches.</p>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && <div className="alert alert-success" role="alert">{success}</div>}

            <ul className="nav nav-tabs mt-4">
                <li className="nav-item"><button className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>Subjects</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms & Labs</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`} onClick={() => setActiveTab('batches')}>Batches</button></li>
            </ul>

            <div className="tab-content p-3 border border-top-0">
                {activeTab === 'subjects' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => openModal('add-subject', { type: 'Theory', credits: 3 })}>Add New Subject</button>
                        <table className="table table-striped table-hover">
                            <thead><tr><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>{departmentData.subjects.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.credits}</td><td>{s.type}</td>{renderActionButtons('subject', s)}</tr>)}</tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'rooms' && (
                     <div>
                        <button className="btn btn-primary mb-3" onClick={() => openModal('add-room', { type: 'Theory', capacity: 60 })}>Add New Room/Lab</button>
                        <table className="table table-striped table-hover">
                            <thead><tr><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>{departmentData.rooms.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.capacity}</td><td>{r.type}</td>{renderActionButtons('room', r)}</tr>)}</tbody>
                        </table>
                    </div>
                )}
                 {activeTab === 'batches' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => openModal('add-batch', { subjects: [] })}>Add New Batch</button>
                         <table className="table table-striped table-hover">
                            <thead><tr><th>Name</th><th>Strength</th><th>Subjects (IDs)</th><th>Actions</th></tr></thead>
                            <tbody>{departmentData.batches.map(b => <tr key={b.id}><td>{b.name}</td><td>{b.strength}</td><td style={{maxWidth: '300px'}}>{b.subjects.join(', ')}</td>{renderActionButtons('batch', b)}</tr>)}</tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal show={modalState.type === 'add-subject' || modalState.type === 'edit-subject'} handleClose={closeModal} title={modalState.type?.startsWith('add') ? "Add New Subject" : "Edit Subject"}>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Credits</label><input type="number" name="credits" className="form-control" value={formData.credits || ''} onChange={handleInputChange} required min="1" /></div>
                    <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" value={formData.type || 'Theory'} onChange={handleInputChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></select></div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </Modal>

            <Modal show={modalState.type === 'add-room' || modalState.type === 'edit-room'} handleClose={closeModal} title={modalState.type?.startsWith('add') ? "Add New Room/Lab" : "Edit Room/Lab"}>
                 <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Capacity</label><input type="number" name="capacity" className="form-control" value={formData.capacity || ''} onChange={handleInputChange} required min="1"/></div>
                    <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" value={formData.type || 'Theory'} onChange={handleInputChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></select></div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </Modal>

            <Modal show={modalState.type === 'add-batch' || modalState.type === 'edit-batch'} handleClose={closeModal} title={modalState.type?.startsWith('add') ? "Add New Batch" : "Edit Batch"}>
                 <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Strength</label><input type="number" name="strength" className="form-control" value={formData.strength || ''} onChange={handleInputChange} required min="1"/></div>
                    <div className="mb-3">
                        <label className="form-label">Subjects</label>
                        <select multiple className="form-select" style={{ height: '150px' }} value={formData.subjects || []} onChange={e => handleMultiSelectChange(e, 'subjects')} required>
                            {departmentData?.subjects?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                        </select>
                        <div className="form-text">Hold Ctrl (or Cmd on Mac) to select multiple subjects.</div>
                    </div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </Modal>

            <Modal
                show={!!deleteTarget}
                handleClose={() => setDeleteTarget(null)}
                title={`Delete ${deleteTarget?.type}?`}
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={confirmDelete}>Confirm Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default ManageCourseData;