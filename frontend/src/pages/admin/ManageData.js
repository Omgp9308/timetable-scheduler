import React, { useState, useEffect } from 'react';
import { 
  getAllAdminData,
  addSubject, addFaculty, addRoom, addBatch,
  deleteSubject, deleteFaculty, deleteRoom, deleteBatch
} from '../../services/api';
import Spinner from '../../components/Spinner';

const ManageData = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchData = async () => {
    try {
      const response = await getAllAdminData();
      setData(response);
    } catch (err) {
      setError('Failed to fetch system data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleShowNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000); // Hide after 3 seconds
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For comma-separated lists, convert to array
    if (name === 'expertise' || name === 'subjects') {
      setFormData({ ...formData, [name]: value.split(',').map(item => item.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      switch (activeTab) {
        case 'subjects':
          response = await addSubject(formData);
          break;
        case 'faculty':
          response = await addFaculty(formData);
          break;
        case 'rooms':
          response = await addRoom(formData);
          break;
        case 'batches':
          response = await addBatch(formData);
          break;
        default:
          throw new Error('Invalid data type');
      }
      // Add the new item to the local state to re-render the list
      setData(prevData => ({
        ...prevData,
        [activeTab]: [...prevData[activeTab], response]
      }));
      handleShowNotification('success', `${activeTab.slice(0, -1)} added successfully!`);
      setShowModal(false);
      setFormData({});
    } catch (err) {
      handleShowNotification('danger', err.message || `Failed to add ${activeTab.slice(0, -1)}.`);
      console.error(err);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
        try {
            switch (type) {
                case 'subjects':
                    await deleteSubject(id);
                    break;
                case 'faculty':
                    await deleteFaculty(id);
                    break;
                case 'rooms':
                    await deleteRoom(id);
                    break;
                case 'batches':
                    await deleteBatch(id);
                    break;
                default:
                    throw new Error('Invalid data type for deletion');
            }
            // Remove the deleted item from local state
            setData(prevData => ({
                ...prevData,
                [type]: prevData[type].filter(item => item.id !== id)
            }));
            handleShowNotification('success', `${type.slice(0, -1)} deleted successfully!`);
        } catch (err) {
            handleShowNotification('danger', err.message || `Failed to delete ${type.slice(0, -1)}.`);
            console.error(err);
        }
    }
  };

  const openAddModal = () => {
    setFormData({});
    setShowModal(true);
  };

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
    
    let formFields;
    switch (activeTab) {
        case 'subjects':
            formFields = <>
                <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Credits</label><input type="number" name="credits" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" onChange={handleInputChange} defaultValue=""><option value="" disabled>Select type</option><option>Theory</option><option>Lab</option></select></div>
            </>;
            break;
        case 'faculty':
            formFields = <>
                <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Expertise (Subject IDs, comma-separated)</label><input type="text" name="expertise" className="form-control" onChange={handleInputChange} required /></div>
            </>;
            break;
        case 'rooms':
            formFields = <>
                <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Capacity</label><input type="number" name="capacity" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Type</label><select name="type" className="form-select" onChange={handleInputChange} defaultValue=""><option value="" disabled>Select type</option><option>Theory</option><option>Lab</option></select></div>
            </>;
            break;
        case 'batches':
            formFields = <>
                <div className="mb-3"><label className="form-label">Name</label><input type="text" name="name" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Strength</label><input type="number" name="strength" className="form-control" onChange={handleInputChange} required /></div>
                <div className="mb-3"><label className="form-label">Subjects (Subject IDs, comma-separated)</label><input type="text" name="subjects" className="form-control" onChange={handleInputChange} required /></div>
            </>;
            break;
        default: formFields = null;
    }

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add New {activeTab.slice(0, -1)}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                        <div className="modal-body">{formFields}</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            <button type="submit" className="btn btn-primary">Save changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
  };


  if (loading) return <Spinner message="Loading all system data..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h1 className="h2">Manage Core Data</h1>
      <p>Here you can view, add, edit, or delete the core entities of the scheduling system.</p>
      
      {notification.message && (
        <div className={`alert alert-${notification.type}`} role="alert">
            {notification.message}
        </div>
      )}

      {renderModal()}
      
      <div className="d-flex justify-content-between align-items-center mt-4">
        <ul className="nav nav-tabs" id="dataTabs" role="tablist">
            {renderTab('subjects', 'Subjects')}
            {renderTab('faculty', 'Faculty')}
            {renderTab('rooms', 'Rooms & Labs')}
            {renderTab('batches', 'Student Batches')}
        </ul>
        <button className="btn btn-primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2"></i>Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="tab-content p-3 border border-top-0" id="dataTabsContent">
        <div className={`tab-pane fade ${activeTab === 'subjects' ? 'show active' : ''}`} role="tabpanel">
          <table className="table table-striped table-hover">
            <thead><tr><th>ID</th><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.subjects?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.credits}</td><td>{item.type}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('subjects', item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`tab-pane fade ${activeTab === 'faculty' ? 'show active' : ''}`} role="tabpanel">
          <table className="table table-striped table-hover">
             <thead><tr><th>ID</th><th>Name</th><th>Expertise</th><th>Actions</th></tr></thead>
             <tbody>
              {data?.faculty?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{Array.isArray(item.expertise) ? item.expertise.join(', ') : item.expertise}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('faculty', item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`tab-pane fade ${activeTab === 'rooms' ? 'show active' : ''}`} role="tabpanel">
           <table className="table table-striped table-hover">
             <thead><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr></thead>
             <tbody>
              {data?.rooms?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.capacity}</td><td>{item.type}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('rooms', item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`tab-pane fade ${activeTab === 'batches' ? 'show active' : ''}`} role="tabpanel">
           <table className="table table-striped table-hover">
             <thead><tr><th>ID</th><th>Name</th><th>Strength</th><th>Subjects</th><th>Actions</th></tr></thead>
             <tbody>
              {data?.batches?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.strength}</td>
                  <td className="w-50">{Array.isArray(item.subjects) ? item.subjects.join(', ') : item.subjects}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('batches', item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageData;

