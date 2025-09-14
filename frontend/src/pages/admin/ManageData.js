import React, { useState, useEffect } from 'react';
import { 
    getAllAdminData, 
    addSubject, addFaculty, addRoom, addBatch,
    deleteSubject, deleteFaculty, deleteRoom, deleteBatch,
    updateSubject, updateFaculty, updateRoom, updateBatch
} from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * The ManageData page allows administrators to view and manage core system data.
 * It fetches all data types and displays them in a tabbed interface.
 */
const ManageData = () => {
    // State for managing the active tab
    const [activeTab, setActiveTab] = useState('subjects');
    
    // State for data, loading, and errors
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    // State for modals
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'addSubject', 'editSubject', etc.
    const [formData, setFormData] = useState({});
    const [editData, setEditData] = useState(null); // Holds the item being edited

    const fetchData = async () => {
        try {
            const response = await getAllAdminData();
            setData(response);
        } catch (err)
 {
            setError('Failed to fetch system data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to show a success message that fades away
    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setError(null);
        if (item) {
            // For editing, pre-fill the form data
            setEditData(item);
            setFormData(item);
        } else {
            // For adding, clear the form data
            setEditData(null);
            setFormData({});
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
        setFormData({});
        setEditData(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e, field) => {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => option.value);
        setFormData(prev => ({ ...prev, [field]: values }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            switch (modalType) {
                case 'addSubject':
                    response = await addSubject(formData);
                    break;
                case 'addFaculty':
                    response = await addFaculty(formData);
                    break;
                case 'addRoom':
                    response = await addRoom(formData);
                    break;
                case 'addBatch':
                    response = await addBatch(formData);
                    break;
                case 'editSubject':
                    response = await updateSubject(editData.id, formData);
                    break;
                case 'editFaculty':
                    response = await updateFaculty(editData.id, formData);
                    break;
                case 'editRoom':
                    response = await updateRoom(editData.id, formData);
                    break;
                case 'editBatch':
                    response = await updateBatch(editData.id, formData);
                    break;
                default:
                    throw new Error("Invalid modal type");
            }
            showSuccessMessage(response.message || "Operation successful!");
            handleCloseModal();
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        }
    };

    const handleDelete = async (type, id) => {
        if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
            try {
                let response;
                switch (type) {
                    case 'subject':
                        response = await deleteSubject(id);
                        break;
                    case 'faculty':
                        response = await deleteFaculty(id);
                        break;
                    case 'room':
                        response = await deleteRoom(id);
                        break;
                    case 'batch':
                        response = await deleteBatch(id);
                        break;
                    default:
                        throw new Error("Invalid delete type");
                }
                showSuccessMessage(response.message || "Item deleted successfully!");
                fetchData(); // Refresh data
            } catch (err) {
                setError(err.message || "Failed to delete the item.");
            }
        }
    };

    // Render a loading spinner while data is being fetched
    if (loading) {
        return <Spinner message="Loading all system data..." />;
    }

    const renderTab = (key, name) => (
        <li className="nav-item" role="presentation">
            <button
                className={`nav-link ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                type="button"
                role="tab"
            >
                {name}
            </button>
        </li>
    );

    const renderModal = () => {
        if (!showModal) return null;

        const title = modalType.includes('add') ? `Add New ${modalType.replace('add', '')}` : `Edit ${modalType.replace('edit', '')}`;

        return (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                {/********** SUBJECT FORM **********/}
                                {(modalType === 'addSubject' || modalType === 'editSubject') && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Credits</label>
                                            <input type="number" name="credits" className="form-control" value={formData.credits || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type</label>
                                            <select name="type" className="form-select" value={formData.type || 'Theory'} onChange={handleInputChange} required>
                                                <option value="Theory">Theory</option>
                                                <option value="Lab">Lab</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {/********** FACULTY FORM **********/}
                                {(modalType === 'addFaculty' || modalType === 'editFaculty') && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Expertise (Select subjects)</label>
                                            <select multiple className="form-select" style={{ height: '150px' }} value={formData.expertise || []} onChange={e => handleMultiSelectChange(e, 'expertise')} required>
                                                {data?.subjects?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                {/********** ROOM FORM **********/}
                                {(modalType === 'addRoom' || modalType === 'editRoom') && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Capacity</label>
                                            <input type="number" name="capacity" className="form-control" value={formData.capacity || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type</label>
                                            <select name="type" className="form-select" value={formData.type || 'Theory'} onChange={handleInputChange} required>
                                                <option value="Theory">Theory</option>
                                                <option value="Lab">Lab</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {/********** BATCH FORM **********/}
                                {(modalType === 'addBatch' || modalType === 'editBatch') && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Strength</label>
                                            <input type="number" name="strength" className="form-control" value={formData.strength || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subjects (Select subjects)</label>
                                            <select multiple className="form-select" style={{ height: '150px' }} value={formData.subjects || []} onChange={e => handleMultiSelectChange(e, 'subjects')} required>
                                                {data?.subjects?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1 className="h2">Manage Core Data</h1>
            <p>Here you can view, add, edit, or delete the core entities of the scheduling system.</p>
            
            {success && <div className="alert alert-success">{success}</div>}
            {error && !showModal && <div className="alert alert-danger">{error}</div>}


            {/* Tab Navigation */}
            <ul className="nav nav-tabs mt-4" id="dataTabs" role="tablist">
                {renderTab('subjects', 'Subjects')}
                {renderTab('faculty', 'Faculty')}
                {renderTab('rooms', 'Rooms & Labs')}
                {renderTab('batches', 'Student Batches')}
            </ul>

            {/* Tab Content */}
            <div className="tab-content p-3 border border-top-0" id="dataTabsContent">
                {/* Subjects Tab */}
                <div className={`tab-pane fade ${activeTab === 'subjects' ? 'show active' : ''}`} role="tabpanel">
                    <button className="btn btn-primary mb-3" onClick={() => handleOpenModal('addSubject')}>Add New Subject</button>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {data?.subjects?.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td><td>{item.name}</td><td>{item.credits}</td><td>{item.type}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal('editSubject', item)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('subject', item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Faculty Tab */}
                <div className={`tab-pane fade ${activeTab === 'faculty' ? 'show active' : ''}`} role="tabpanel">
                    <button className="btn btn-primary mb-3" onClick={() => handleOpenModal('addFaculty')}>Add New Faculty</button>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Expertise</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {data?.faculty?.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td><td>{item.name}</td><td>{item.expertise.join(', ')}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal('editFaculty', item)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('faculty', item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Rooms Tab */}
                <div className={`tab-pane fade ${activeTab === 'rooms' ? 'show active' : ''}`} role="tabpanel">
                    <button className="btn btn-primary mb-3" onClick={() => handleOpenModal('addRoom')}>Add New Room/Lab</button>
                    
                    <h4 className="mt-4">Theory Rooms</h4>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {data?.rooms?.filter(r => r.type === 'Theory').map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td><td>{item.name}</td><td>{item.capacity}</td><td>{item.type}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal('editRoom', item)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('room', item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h4 className="mt-4">Labs</h4>
                     <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {data?.rooms?.filter(r => r.type === 'Lab').map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td><td>{item.name}</td><td>{item.capacity}</td><td>{item.type}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal('editRoom', item)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('room', item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Batches Tab */}
                <div className={`tab-pane fade ${activeTab === 'batches' ? 'show active' : ''}`} role="tabpanel">
                    <button className="btn btn-primary mb-3" onClick={() => handleOpenModal('addBatch')}>Add New Batch</button>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Strength</th><th>Subjects</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {data?.batches?.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td><td>{item.name}</td><td>{item.strength}</td>
                                    <td className="w-50">{item.subjects.join(', ')}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal('editBatch', item)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('batch', item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {renderModal()}
        </div>
    );
};

export default ManageData;

