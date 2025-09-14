import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDataForMyDepartment, getPendingTimetables } from '../../services/api';
import Spinner from '../../components/Spinner';

const StatCard = ({ title, value, icon, color }) => (
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
                // Fetch both sets of data in parallel
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
                setError('Failed to load dashboard data.');
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
            <h1 className="h2">HOD Dashboard</h1>
            <p className="lead">
                Welcome, <strong>{user.username}</strong>! You are the HOD of the <strong>{user.department_name}</strong> department.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Stats Cards */}
            <div className="row mt-4">
                <StatCard title="Teachers in Department" value={stats?.faculty} icon="bi-person-badge" color="primary" />
                <StatCard title="Total Subjects" value={stats?.subjects} icon="bi-book" color="info" />
                 <StatCard title="Timetables Pending Approval" value={stats?.pending} icon="bi-hourglass-split" color="danger" />
                <StatCard title="Total Batches" value={stats?.batches} icon="bi-people" color="success" />
            </div>
            
            {/* Quick Actions */}
            <div className="row mt-4">
                 <div className="col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title">Manage Teachers</h5>
                            <p className="card-text">Add new teacher accounts and assign them to your department.</p>
                            <Link to="/hod/teachers" className="btn btn-secondary">
                                Go to Teacher Management
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                     <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title">Approve Timetables</h5>
                            <p className="card-text">Review and approve or reject timetable drafts submitted by teachers.</p>
                            <Link to="/hod/approvals" className="btn btn-primary">
                               Go to Approvals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HodDashboard;
