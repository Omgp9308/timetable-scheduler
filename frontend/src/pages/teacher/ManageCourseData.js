import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    getDataForMyDepartment, 
    addSubject, addRoom, addBatch,
    updateSubject, updateRoom, updateBatch,
    deleteSubject, deleteRoom, deleteBatch
} from '../../services/api';
import Spinner from '../../components/Spinner';

// A reusable modal component for our forms
const FormModal = ({ show, handleClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


const ManageCourseData = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('subjects');
    const [departmentData, setDepartmentData] = useState({ subjects: [], rooms: [], batches: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for modals
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'add-subject', 'edit-room', etc.
    const [formData, setFormData] = useState({});

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

    const openModal = (type, data = {}) => {
        setModalState({ type, data });
        setFormData(data || {});
        setError(''); // Clear previous errors
    };

    const closeModal = () => {
        setModalState({ type: null, data: null });
        setFormData({});
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { type, data } = modalState;
            let subjectsArray = formData.subjects;
            if (typeof subjectsArray === 'string') {
                subjectsArray = subjectsArray.split(',').map(s => s.trim());
            }

            if (type.startsWith('add')) {
                if (type === 'add-subject') await addSubject(formData);
                if (type === 'add-room') await addRoom(formData);
                if (type === 'add-batch') await addBatch({ ...formData, subjects: subjectsArray });
            } else if (type.startsWith('edit')) {
                if (type === 'edit-subject') await updateSubject(data.id, formData);
                if (type === 'edit-room') await updateRoom(data.id, formData);
                if (type === 'edit-batch') await updateBatch(data.id, { ...formData, subjects: subjectsArray });
            }
            closeModal();
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.message || `Failed to save ${modalState.type.split('-')[1]}.`);
        }
    };

    const handleDelete = async (type, id) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                if (type === 'subject') await deleteSubject(id);
                if (type === 'room') await deleteRoom(id);
                if (type === 'batch') await deleteBatch(id);
                fetchData();
            } catch (err) {
                setError(err.message || `Failed to delete ${type}.`);
            }
        }
    };

    if (isLoading) {
        return <Spinner message="Loading your department's data..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Course Data</h1>
            <p>As a teacher in the <strong>{user.department_name}</strong> department, you can manage subjects, rooms, and batches.</p>
            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mt-4">
                <li className="nav-item"><button className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>Subjects</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms & Labs</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`} onClick={() => setActiveTab('batches')}>Batches</button></li>
            </ul>

            <div className="tab-content p-3 border border-top-0">
                {activeTab === 'subjects' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => openModal('add-subject', { type: 'Theory' })}>Add New Subject</button>
                        <table className="table table-striped">
                            <thead><tr><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>{departmentData.subjects.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.credits}</td><td>{s.type}</td><td><button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('edit-subject', s)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('subject', s.id)}>Delete</button></td></tr>)}</tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'rooms' && (
                     <div>
                        <button className="btn btn-primary mb-3" onClick={() => openModal('add-room', { type: 'Theory' })}>Add New Room/Lab</button>
                        <table className="table table-striped">
                            <thead><tr><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>{departmentData.rooms.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.capacity}</td><td>{r.type}</td><td><button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('edit-room', r)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('room', r.id)}>Delete</button></td></tr>)}</tbody>
                        </table>
                    </div>
                )}
                 {activeTab === 'batches' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => openModal('add-batch')}>Add New Batch</button>
                         <table className="table table-striped">
                            <thead><tr><th>Name</th><th>Strength</th><th>Subjects</th><th>Actions</th></tr></thead>
                            <tbody>{departmentData.batches.map(b => <tr key={b.id}><td>{b.name}</td><td>{b.strength}</td><td>{b.subjects.join(', ')}</td><td><button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('edit-batch', { ...b, subjects: b.subjects.join(', ') })}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('batch', b.id)}>Delete</button></td></tr>)}</tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals for Adding/Editing Data */}
            <FormModal show={modalState.type === 'add-subject' || modalState.type === 'edit-subject'} handleClose={closeModal} title={modalState.type === 'add-subject' ? "Add New Subject" : "Edit Subject"}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Credits</label><input type="number" name="credits" className="form-control" value={formData.credits || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" value={formData.type || 'Theory'} onChange={handleInputChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></select></div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </FormModal>

            <FormModal show={modalState.type === 'add-room' || modalState.type === 'edit-room'} handleClose={closeModal} title={modalState.type === 'add-room' ? "Add New Room/Lab" : "Edit Room/Lab"}>
                 <form onSubmit={handleSubmit}>
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Capacity</label><input type="number" name="capacity" className="form-control" value={formData.capacity || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" value={formData.type || 'Theory'} onChange={handleInputChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></select></div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </FormModal>

            <FormModal show={modalState.type === 'add-batch' || modalState.type === 'edit-batch'} handleClose={closeModal} title={modalState.type === 'add-batch' ? "Add New Batch" : "Edit Batch"}>
                 <form onSubmit={handleSubmit}>
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Strength</label><input type="number" name="strength" className="form-control" value={formData.strength || ''} onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Subject IDs (comma-separated)</label><input type="text" name="subjects" className="form-control" value={formData.subjects || ''} onChange={handleInputChange} required /></div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
            </FormModal>
        </div>
    );
};

export default ManageCourseData;

