import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDataForMyDepartment } from '../../services/api';
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

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDataForMyDepartment();
                setStats({
                    subjects: data.subjects.length,
                    faculty: data.faculty.length,
                    rooms: data.rooms.length,
                    batches: data.batches.length,
                });
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return <Spinner message="Loading dashboard..." />;
    }

    return (
        <div>
            <h1 className="h2">Teacher Dashboard</h1>
            <p className="lead">
                Welcome, <strong>{user.username}</strong>! You are a teacher in the <strong>{user.department_name}</strong> department.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Stats Cards */}
            <div className="row mt-4">
                <StatCard title="Total Subjects" value={stats?.subjects} icon="bi-book" color="primary" />
                <StatCard title="Total Rooms & Labs" value={stats?.rooms} icon="bi-door-open" color="info" />
                <StatCard title="Total Batches" value={stats?.batches} icon="bi-people" color="success" />
                <StatCard title="Total Teachers" value={stats?.faculty} icon="bi-person-badge" color="warning" />
            </div>
            
            {/* Quick Actions */}
            <div className="row mt-4">
                 <div className="col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title">Manage Course Data</h5>
                            <p className="card-text">Add, edit, or delete subjects, rooms, and student batches for your department.</p>
                            <Link to="/teacher/manage-data" className="btn btn-secondary">
                                Go to Data Management
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                     <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title">Generate Timetables</h5>
                            <p className="card-text">Use the optimization engine to generate new timetable drafts and submit them for approval.</p>
                            <Link to="/teacher/generate" className="btn btn-primary">
                               Go to Timetable Generation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
