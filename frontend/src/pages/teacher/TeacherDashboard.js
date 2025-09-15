import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDataForMyDepartment, getDraftTimetables } from '../../services/api';
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
                 <Link to={linkTo} className="card-footer text-decoration-none bg-light">
                    <span className="text-muted small">Manage <i className="bi bi-arrow-right-circle"></i></span>
                </Link>
            )}
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
                // Fetch all necessary data in parallel
                const [deptData, draftsData] = await Promise.all([
                    getDataForMyDepartment(),
                    getDraftTimetables()
                ]);

                setStats({
                    subjects: deptData.subjects.length,
                    rooms: deptData.rooms.length,
                    batches: deptData.batches.length,
                    drafts: draftsData.length,
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
             <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                 <h1 className="h2">Teacher Dashboard</h1>
                 <div className="btn-toolbar mb-2 mb-md-0">
                    <span className="text-muted">
                        <strong>Department:</strong> {user.department_name}
                    </span>
                 </div>
            </div>

            <p className="lead">
                Welcome, <strong>{user.username}</strong>! Manage your course data and generate timetables.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Stats Cards */}
            <div className="row mt-4">
                <StatCard title="Total Subjects" value={stats?.subjects} icon="bi-book" color="primary" linkTo="/teacher/manage-courses"/>
                <StatCard title="Total Rooms & Labs" value={stats?.rooms} icon="bi-door-open" color="info" linkTo="/teacher/manage-courses"/>
                <StatCard title="Total Batches" value={stats?.batches} icon="bi-people" color="success" linkTo="/teacher/manage-courses"/>
                <StatCard title="Draft Timetables" value={stats?.drafts} icon="bi-journal-check" color="warning" linkTo="/teacher/generate-timetable"/>
            </div>
            
            {/* Quick Actions */}
            <div className="row mt-4">
                 <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-pencil-square fs-1 text-primary"></i>
                            <h5 className="card-title mt-3">Manage Course Data</h5>
                            <p className="card-text">Add, edit, or delete subjects, rooms, and student batches for your department.</p>
                            <Link to="/teacher/manage-courses" className="btn btn-primary">
                                Go to Data Management
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 mb-4">
                     <div className="card shadow-sm">
                        <div className="card-body text-center">
                             <i className="bi bi-calendar2-plus fs-1 text-success"></i>
                            <h5 className="card-title mt-3">Generate Timetables</h5>
                            <p className="card-text">Use the engine to generate new timetable drafts and submit them for HOD approval.</p>
                            <Link to="/teacher/generate-timetable" className="btn btn-success">
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