import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/api'; // Assuming this API function exists
import Spinner from '../../components/Spinner';

/**
 * The main dashboard page for logged-in administrators.
 * It provides a welcome message, a summary of system data, and quick action links.
 */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard statistics when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Spinner message="Loading dashboard..." />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="h2">Dashboard</h1>
      <p className="lead">
        Welcome back, <strong>{user?.username}</strong>! Here's an overview of the system.
      </p>

      <div className="row mt-4">
        {/* System Overview Card */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="bi bi-bar-chart-line-fill me-2"></i>
              System Overview
            </div>
            <div className="card-body">
              {stats ? (
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Total Subjects
                    <span className="badge bg-primary rounded-pill">{stats.subjects}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Total Faculty Members
                    <span className="badge bg-info rounded-pill">{stats.faculty}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Total Student Batches
                    <span className="badge bg-success rounded-pill">{stats.batches}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Available Rooms & Labs
                    <span className="badge bg-secondary rounded-pill">{stats.rooms}</span>
                  </li>
                </ul>
              ) : (
                <p>Could not load system statistics.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="bi bi-lightning-charge-fill me-2"></i>
              Quick Actions
            </div>
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <p>Ready to get started?</p>
              <div className="d-grid gap-3 col-10 mx-auto">
                <Link to="/admin/generate" className="btn btn-primary btn-lg">
                  <i className="bi bi-calendar2-plus me-2"></i>
                  Generate New Timetable
                </Link>
                <Link to="/admin/manage-data" className="btn btn-outline-secondary btn-lg">
                  <i className="bi bi-pencil-square me-2"></i>
                  Manage Core Data
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;