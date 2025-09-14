import React, { useState, useEffect } from 'react';
import { getAllAdminData, addSubject, addFaculty, addRoom, addBatch } from '../../services/api';
import Spinner from '../../components/Spinner';
import { Modal, Button, Form } from 'react-bootstrap'; // We'll use react-bootstrap for modals

/**
 * The ManageData page allows administrators to view and manage core system data.
 * It fetches all data types and displays them in a tabbed interface with add functionality.
 */
const ManageData = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // State for controlling modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // e.g., 'subject', 'faculty'
  const [formData, setFormData] = useState({});

  // Fetch all data on component mount and when 'data' state changes
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
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleShowModal = (type) => {
    setModalType(type);
    setFormData({}); // Reset form data
    setShowModal(true);
    setSuccess('');
    setError('');
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
        let response;
        switch (modalType) {
            case 'subject':
                formData.credits = parseInt(formData.credits); // Ensure credits is a number
                response = await addSubject(formData);
                break;
            case 'faculty':
                // Convert comma-separated string to array
                formData.expertise = formData.expertise.split(',').map(s => s.trim());
                response = await addFaculty(formData);
                break;
            case 'room':
                formData.capacity = parseInt(formData.capacity); // Ensure capacity is a number
                response = await addRoom(formData);
                break;
            case 'batch':
                formData.strength = parseInt(formData.strength); // Ensure strength is a number
                formData.subjects = formData.subjects.split(',').map(s => s.trim());
                response = await addBatch(formData);
                break;
            default:
                throw new Error('Invalid modal type');
        }
        setSuccess(`Successfully added new ${modalType}!`);
        handleCloseModal();
        fetchData(); // Refresh data in the table
    } catch (err) {
        setError(`Failed to add ${modalType}. ${err.message}`);
        console.error(err);
    }
  };

  if (loading && !data) {
    return <Spinner message="Loading all system data..." />;
  }

  // Helper to render the header for each tab with an "Add New" button
  const renderTabHeader = (title, type) => (
    <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{title}</h4>
        <Button variant="primary" size="sm" onClick={() => handleShowModal(type)}>
            <i className="bi bi-plus-lg me-1"></i> Add New {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
    </div>
  );
  
  return (
    <div>
      <h1 className="h2">Manage Core Data</h1>
      <p>Here you can view, add, edit, or delete the core entities of the scheduling system.</p>
      
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="nav nav-tabs mt-4">
        {['subjects', 'faculty', 'rooms', 'batches'].map(tab => (
            <li className="nav-item" key={tab}>
                <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            </li>
        ))}
      </ul>

      <div className="tab-content p-3 border border-top-0">
        {activeTab === 'subjects' && (
            <div>
                {renderTabHeader('Subjects', 'subject')}
                <table className="table table-striped table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead>
                    <tbody>{data?.subjects?.map(item => (<tr key={item.id}><td>{item.id}</td><td>{item.name}</td><td>{item.credits}</td><td>{item.type}</td><td><button className="btn btn-sm btn-outline-primary">Edit</button></td></tr>))}</tbody>
                </table>
            </div>
        )}
        {activeTab === 'faculty' && (
             <div>
                {renderTabHeader('Faculty', 'faculty')}
                <table className="table table-striped table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Expertise</th><th>Actions</th></tr></thead>
                    <tbody>{data?.faculty?.map(item => (<tr key={item.id}><td>{item.id}</td><td>{item.name}</td><td>{item.expertise.join(', ')}</td><td><button className="btn btn-sm btn-outline-primary">Edit</button></td></tr>))}</tbody>
                </table>
            </div>
        )}
        {activeTab === 'rooms' && (
             <div>
                {renderTabHeader('Rooms & Labs', 'room')}
                <table className="table table-striped table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr></thead>
                    <tbody>{data?.rooms?.map(item => (<tr key={item.id}><td>{item.id}</td><td>{item.name}</td><td>{item.capacity}</td><td>{item.type}</td><td><button className="btn btn-sm btn-outline-primary">Edit</button></td></tr>))}</tbody>
                </table>
            </div>
        )}
         {activeTab === 'batches' && (
             <div>
                {renderTabHeader('Student Batches', 'batch')}
                <table className="table table-striped table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Strength</th><th>Subjects</th><th>Actions</th></tr></thead>
                    <tbody>{data?.batches?.map(item => (<tr key={item.id}><td>{item.id}</td><td>{item.name}</td><td>{item.strength}</td><td className="w-50">{item.subjects.join(', ')}</td><td><button className="btn btn-sm btn-outline-primary">Edit</button></td></tr>))}</tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- Generic Add Modal --- */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {modalType === 'subject' && <>
              <Form.Group className="mb-3"><Form.Label>Subject Name</Form.Label><Form.Control type="text" name="name" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Credits</Form.Label><Form.Control type="number" name="credits" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Type</Form.Label><Form.Select name="type" onChange={handleFormChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></Form.Select></Form.Group>
            </>}
            {modalType === 'faculty' && <>
              <Form.Group className="mb-3"><Form.Label>Faculty Name</Form.Label><Form.Control type="text" name="name" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Expertise (Subject IDs, comma-separated)</Form.Label><Form.Control type="text" name="expertise" onChange={handleFormChange} required /></Form.Group>
            </>}
             {modalType === 'room' && <>
              <Form.Group className="mb-3"><Form.Label>Room Name</Form.Label><Form.Control type="text" name="name" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Capacity</Form.Label><Form.Control type="number" name="capacity" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Type</Form.Label><Form.Select name="type" onChange={handleFormChange}><option value="Theory">Theory</option><option value="Lab">Lab</option></Form.Select></Form.Group>
            </>}
             {modalType === 'batch' && <>
              <Form.Group className="mb-3"><Form.Label>Batch Name</Form.Label><Form.Control type="text" name="name" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Strength</Form.Label><Form.Control type="number" name="strength" onChange={handleFormChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Subjects (IDs, comma-separated)</Form.Label><Form.Control type="text" name="subjects" onChange={handleFormChange} required /></Form.Group>
            </>}
            <hr />
            <div className="text-end">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancel</Button>
                <Button variant="primary" type="submit">Add {modalType}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageData;

