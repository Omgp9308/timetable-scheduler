import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDataForMyDepartment, getPendingTimetables } from '../../services/api';
import Spinner from '../../components/Spinner';

const StatCard = ({ title, value, icon, color, linkTo }) => (
    <div className="col-md-6 mb-4">
        <div className={`card shadow-sm h-100 border-start border-${color} border-4`}>
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col me-2">
                        <div className={`text-xs fw-bold text-${color} text-uppercase mb-1`}>{title}</div>
                        <div className="h5 mb-0 fw-bold text-gray-800">{value}</div>
                    </div>
                    <div className="col-auto">
                        <i className={`bi ${icon} fs-2 text-gray-300`}></i>
                    </div>
                </div>
            </div>
            {linkTo && (
                 <Link to={linkTo} className="card-footer text-decoration-none">
                    <span className="text-muted">View Details <i className="bi bi-arrow-right-circle"></i></span>
                </Link>
            )}
        </div>
    </div>
);


const HodDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch both sets of data in parallel for efficiency
                const [deptData, pendingData] = await Promise.all([
                    getDataForMyDepartment(),
                    getPendingTimetables()
                ]);
                
                setStats({
                    subjects: deptData.subjects.length,
                    faculty: deptData.faculty.length,
                    rooms: deptData.rooms.length,
                    batches: deptData.batches.length,
                    pending: pendingData.length
                });
            } catch (err) {
                setError('Failed to load dashboard data. Please try refreshing the page.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <Spinner message="Loading HOD dashboard..." />;
    }

    return (
        <div>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                 <h1 className="h2">HOD Dashboard</h1>
                 <div className="btn-toolbar mb-2 mb-md-0">
                    <span className="text-muted">
                        <strong>Department:</strong> {user.department_name}
                    </span>
                 </div>
            </div>
            <p className="lead">
                Welcome, <strong>{user.username}</strong>! Here's an overview of your department.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Stats Cards */}
            <div className="row mt-4">
                <StatCard title="Timetables Pending Approval" value={stats?.pending} icon="bi-hourglass-split" color="danger" linkTo="/hod/approvals" />
                <StatCard title="Teachers in Department" value={stats?.faculty} icon="bi-person-badge" color="primary" linkTo="/hod/teachers" />
                <StatCard title="Total Subjects" value={stats?.subjects} icon="bi-book" color="info" />
                <StatCard title="Total Batches" value={stats?.batches} icon="bi-people" color="success" />
            </div>
            
            {/* Quick Actions Re-imagined as a single "Getting Started" card */}
            <div className="row mt-4">
                <div className="col">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                             <p className="card-text">Quickly access the most common HOD tasks.</p>
                             <Link to="/hod/approvals" className="btn btn-primary me-2">
                                Review Pending Timetables
                                {stats?.pending > 0 && <span className="badge bg-danger ms-2">{stats.pending}</span>}
                            </Link>
                             <Link to="/hod/teachers" className="btn btn-outline-secondary">
                                Manage Department Teachers
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HodDashboard;
