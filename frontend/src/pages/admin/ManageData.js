import React, { useState, useEffect } from 'react';
import {
    getAllAdminData,
    addSubject, addFaculty, addRoom, addBatch,
    deleteSubject, deleteFaculty, deleteRoom, deleteBatch,
    updateSubject, updateFaculty, updateRoom, updateBatch
} from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * The ManageData page allows administrators to perform full CRUD operations
 * on all core system data.
 */
const ManageData = () => {
  // State for managing the active tab
  const [activeTab, setActiveTab] = useState('subjects');

  // State for data, loading, and errors
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for managing modals (add and edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({});

  // Fetch all core data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllAdminData();
      setData(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal and Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const model = showEditModal ? editingItem : newItem;
    const setModel = showEditModal ? setEditingItem : setNewItem;
    
    // Handle array inputs for expertise/subjects
    if (name === 'expertise' || name === 'subjects') {
        setModel({ ...model, [name]: value.split(',').map(s => s.trim()) });
    } else {
        setModel({ ...model, [name]: value });
    }
  };

  const handleShowAddModal = () => {
    setNewItem({});
    setShowAddModal(true);
  };

  const handleShowEditModal = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setNewItem({});
    setEditingItem(null);
  };

  // --- API Call Handlers (Create, Update, Delete) ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
        switch (activeTab) {
            case 'subjects': await addSubject(newItem); break;
            case 'faculty': await addFaculty(newItem); break;
            case 'rooms': await addRoom(newItem); break;
            case 'batches': await addBatch(newItem); break;
            default: break;
        }
        fetchData(); // Refresh data
        handleCloseModals();
    } catch (err) {
        alert(`Error adding item: ${err.message}`);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
        switch (activeTab) {
            case 'subjects': await updateSubject(editingItem.id, editingItem); break;
            case 'faculty': await updateFaculty(editingItem.id, editingItem); break;
            case 'rooms': await updateRoom(editingItem.id, editingItem); break;
            case 'batches': await updateBatch(editingItem.id, editingItem); break;
            default: break;
        }
        fetchData(); // Refresh data
        handleCloseModals();
    } catch (err) {
        alert(`Error updating item: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        switch (activeTab) {
          case 'subjects': await deleteSubject(id); break;
          case 'faculty': await deleteFaculty(id); break;
          case 'rooms': await deleteRoom(id); break;
          case 'batches': await deleteBatch(id); break;
          default: break;
        }
        fetchData(); // Refresh data
      } catch (err) {
        alert(`Error deleting item: ${err.message}`);
      }
    }
  };
  
  // --- Render Functions ---
  if (loading) return <Spinner message="Loading all system data..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const renderTab = (key, name) => (
    <li className="nav-item" role="presentation">
      <button className={`nav-link ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)} type="button">
        {name}
      </button>
    </li>
  );

  const renderFormFields = () => {
    const item = showEditModal ? editingItem : newItem;
    const commonFields = (
        <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-control" id="name" name="name" value={item?.name || ''} onChange={handleInputChange} required />
        </div>
    );

    switch(activeTab) {
        case 'subjects': return (
            <>
                {commonFields}
                <div className="mb-3">
                    <label htmlFor="credits" className="form-label">Credits</label>
                    <input type="number" className="form-control" id="credits" name="credits" value={item?.credits || ''} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type (Theory/Lab)</label>
                    <input type="text" className="form-control" id="type" name="type" value={item?.type || ''} onChange={handleInputChange} required />
                </div>
            </>
        );
        case 'faculty': return (
            <>
                {commonFields}
                <div className="mb-3">
                    <label htmlFor="expertise" className="form-label">Expertise (comma-separated IDs)</label>
                    <input type="text" className="form-control" id="expertise" name="expertise" value={Array.isArray(item?.expertise) ? item.expertise.join(', ') : ''} onChange={handleInputChange} />
                </div>
            </>
        );
        case 'rooms': return (
            <>
                {commonFields}
                <div className="mb-3">
                    <label htmlFor="capacity" className="form-label">Capacity</label>
                    <input type="number" className="form-control" id="capacity" name="capacity" value={item?.capacity || ''} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type (Theory/Lab)</label>
                    <input type="text" className="form-control" id="type" name="type" value={item?.type || ''} onChange={handleInputChange} required />
                </div>
            </>
        );
        case 'batches': return (
            <>
                {commonFields}
                <div className="mb-3">
                    <label htmlFor="strength" className="form-label">Strength</label>
                    <input type="number" className="form-control" id="strength" name="strength" value={item?.strength || ''} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="subjects" className="form-label">Subjects (comma-separated IDs)</label>
                    <input type="text" className="form-control" id="subjects" name="subjects" value={Array.isArray(item?.subjects) ? item.subjects.join(', ') : ''} onChange={handleInputChange} />
                </div>
            </>
        );
        default: return null;
    }
  };

  const renderModal = () => {
    const isEdit = showEditModal;
    const show = showAddModal || showEditModal;
    if (!show) return null;

    return (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={isEdit ? handleUpdateItem : handleAddItem}>
                        <div className="modal-header">
                            <h5 className="modal-title">{isEdit ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModals}></button>
                        </div>
                        <div className="modal-body">
                            {renderFormFields()}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Close</button>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
  };


  return (
    <div>
      <h1 className="h2">Manage Core Data</h1>
      <p>Here you can view, add, edit, or delete the core entities of the scheduling system.</p>

      <ul className="nav nav-tabs mt-4" id="dataTabs" role="tablist">
        {renderTab('subjects', 'Subjects')}
        {renderTab('faculty', 'Faculty')}
        {renderTab('rooms', 'Rooms & Labs')}
        {renderTab('batches', 'Student Batches')}
      </ul>

      <div className="tab-content p-3 border border-top-0" id="dataTabsContent">
        <div className="text-end mb-3">
            <button className="btn btn-primary" onClick={handleShowAddModal}>
                <i className="bi bi-plus-circle me-2"></i>
                Add New {activeTab.slice(0, -1)}
            </button>
        </div>
        {/* Subjects Tab */}
        <div className={`tab-pane fade ${activeTab === 'subjects' ? 'show active' : ''}`}>
          <table className="table table-striped table-hover">
            <thead><tr><th>ID</th><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.subjects?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.credits}</td><td>{item.type}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShowEditModal(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Faculty Tab */}
        <div className={`tab-pane fade ${activeTab === 'faculty' ? 'show active' : ''}`}>
          <table className="table table-striped table-hover">
             <thead><tr><th>ID</th><th>Name</th><th>Expertise</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.faculty?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.expertise.join(', ')}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShowEditModal(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Rooms Tab */}
        <div className={`tab-pane fade ${activeTab === 'rooms' ? 'show active' : ''}`}>
           <table className="table table-striped table-hover">
             <thead><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.rooms?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.capacity}</td><td>{item.type}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShowEditModal(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Batches Tab */}
        <div className={`tab-pane fade ${activeTab === 'batches' ? 'show active' : ''}`}>
           <table className="table table-striped table-hover">
             <thead><tr><th>ID</th><th>Name</th><th>Strength</th><th>Subjects</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.batches?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.strength}</td>
                  <td className="w-50">{item.subjects.join(', ')}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShowEditModal(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
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

