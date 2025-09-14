import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getDataForMyDepartment, addSubject, addRoom, addBatch } from '../../services/api';
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
    const [showModal, setShowModal] = useState(null); // null, 'subject', 'room', 'batch'
    const [formData, setFormData] = useState({});

    const fetchData = async () => {
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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let apiCall;
            if (showModal === 'subject') apiCall = addSubject(formData);
            if (showModal === 'room') apiCall = addRoom(formData);
            if (showModal === 'batch') apiCall = addBatch({ ...formData, subjects: formData.subjects.split(',') });
            
            await apiCall;
            setShowModal(null);
            setFormData({});
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.message || `Failed to add ${showModal}.`);
        }
    };

    if (isLoading) {
        return <Spinner message="Loading your department's data..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Course Data</h1>
            <p>
                As a teacher in the <strong>{user.department_name}</strong> department, you can manage subjects, rooms, and batches.
            </p>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mt-4">
                <li className="nav-item"><button className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>Subjects</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms & Labs</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`} onClick={() => setActiveTab('batches')}>Batches</button></li>
            </ul>

            <div className="tab-content p-3 border border-top-0">
                {/* Subjects Tab */}
                {activeTab === 'subjects' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => { setFormData({type: 'Theory'}); setShowModal('subject'); }}>Add New Subject</button>
                        <table className="table table-striped">
                            <thead><tr><th>Name</th><th>Credits</th><th>Type</th></tr></thead>
                            <tbody>
                                {departmentData.subjects.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.credits}</td><td>{s.type}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => { setFormData({type: 'Theory'}); setShowModal('room'); }}>Add New Room/Lab</button>
                        <table className="table table-striped">
                            <thead><tr><th>Name</th><th>Capacity</th><th>Type</th></tr></thead>
                            <tbody>
                                {departmentData.rooms.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.capacity}</td><td>{r.type}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Batches Tab */}
                {activeTab === 'batches' && (
                    <div>
                        <button className="btn btn-primary mb-3" onClick={() => setShowModal('batch')}>Add New Batch</button>
                         <table className="table table-striped">
                            <thead><tr><th>Name</th><th>Strength</th><th>Subjects</th></tr></thead>
                            <tbody>
                                {departmentData.batches.map(b => <tr key={b.id}><td>{b.name}</td><td>{b.strength}</td><td>{b.subjects.join(', ')}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals for Adding Data */}
            <FormModal show={showModal === 'subject'} handleClose={() => setShowModal(null)} title="Add New Subject">
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Credits</label><input type="number" name="credits" className="form-control" onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" value={formData.type} onChange={handleInputChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></select></div>
                    <button type="submit" className="btn btn-primary">Save Subject</button>
                </form>
            </FormModal>

            <FormModal show={showModal === 'room'} handleClose={() => setShowModal(null)} title="Add New Room/Lab">
                 <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Capacity</label><input type="number" name="capacity" className="form-control" onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" value={formData.type} onChange={handleInputChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></select></div>
                    <button type="submit" className="btn btn-primary">Save Room</button>
                </form>
            </FormModal>

            <FormModal show={showModal === 'batch'} handleClose={() => setShowModal(null)} title="Add New Batch">
                 <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Strength</label><input type="number" name="strength" className="form-control" onChange={handleInputChange} required /></div>
                    <div className="mb-3"><label className="form-label">Subject IDs (comma-separated)</label><input type="text" name="subjects" className="form-control" onChange={handleInputChange} required /></div>
                    <button type="submit" className="btn btn-primary">Save Batch</button>
                </form>
            </FormModal>
        </div>
    );
};

export default ManageCourseData;
