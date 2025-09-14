import React, { useState, useEffect } from 'react';
import { getAllAdminData } from '../../services/api'; // Assumes this API function exists
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

  useEffect(() => {
    // Fetch all core data when the component mounts
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

    fetchData();
  }, []);

  // Render a loading spinner while data is being fetched
  if (loading) {
    return <Spinner message="Loading all system data..." />;
  }

  // Render an error message if the API call fails
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Helper to create a tab button
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

  return (
    <div>
      <h1 className="h2">Manage Core Data</h1>
      <p>Here you can view, add, edit, or delete the core entities of the scheduling system.</p>

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
          <table className="table table-striped table-hover">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Credits</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data?.subjects?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.credits}</td><td>{item.type}</td>
                  <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Faculty Tab */}
        <div className={`tab-pane fade ${activeTab === 'faculty' ? 'show active' : ''}`} role="tabpanel">
          <table className="table table-striped table-hover">
             <thead>
              <tr><th>ID</th><th>Name</th><th>Expertise</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data?.faculty?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.expertise.join(', ')}</td>
                  <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rooms Tab */}
        <div className={`tab-pane fade ${activeTab === 'rooms' ? 'show active' : ''}`} role="tabpanel">
           <table className="table table-striped table-hover">
             <thead>
              <tr><th>ID</th><th>Name</th><th>Capacity</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data?.rooms?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.capacity}</td><td>{item.type}</td>
                  <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Batches Tab */}
        <div className={`tab-pane fade ${activeTab === 'batches' ? 'show active' : ''}`} role="tabpanel">
           <table className="table table-striped table-hover">
             <thead>
              <tr><th>ID</th><th>Name</th><th>Strength</th><th>Subjects</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data?.batches?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.name}</td><td>{item.strength}</td>
                  <td className="w-50">{item.subjects.join(', ')}</td>
                  <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
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