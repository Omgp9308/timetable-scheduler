import React, { useState, useEffect } from 'react';
import { getPendingTimetables, approveTimetable, rejectTimetable } from '../../services/api';
import Spinner from '../../components/Spinner';
import TimetableView from '../../components/TimetableView';

const ApproveTimetables = () => {
    const [pending, setPending] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedTimetable, setSelectedTimetable] = useState(null);

    const fetchPending = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingTimetables();
            setPending(data);
        } catch (err) {
            setError('Failed to fetch timetables for approval.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (action, id) => {
        setError('');
        setSuccess('');
        try {
            if (action === 'approve') {
                await approveTimetable(id);
                setSuccess('Timetable has been approved and published successfully.');
            } else if (action === 'reject') {
                await rejectTimetable(id);
                setSuccess('Timetable has been rejected.');
            }
            setSelectedTimetable(null); // Hide the preview after an action
            fetchPending(); // Refresh the list of pending timetables
        } catch (err) {
            setError(err.message || `Failed to ${action} timetable.`);
        }
    };

    if (isLoading) {
        return <Spinner message="Loading timetables pending approval..." />;
    }

    return (
        <div>
            <h1 className="h2">Approve Timetables</h1>
            <p>Review the timetables submitted by teachers in your department and approve or reject them.</p>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && <div className="alert alert-success mt-3">{success}</div>}

            <div className="card shadow-sm mt-4">
                <div className="card-header"><h5 className="mb-0">Timetables Pending Approval</h5></div>
                <div className="card-body">
                    {pending.length > 0 ? (
                        <ul className="list-group">
                            {pending.map(tt => (
                                <li key={tt.id} className="list-group-item d-flex flex-wrap justify-content-between align-items-center">
                                    <div className="mb-2 mb-md-0">
                                        <strong>{tt.name}</strong>
                                        <br />
                                        <small className="text-muted">Created: {new Date(tt.created_at).toLocaleString()}</small>
                                    </div>
                                    <div className="mt-2 mt-md-0">
                                        <button className="btn btn-info btn-sm me-2" onClick={() => setSelectedTimetable(tt)}>
                                            View
                                        </button>
                                        <button className="btn btn-success btn-sm me-2" onClick={() => handleAction('approve', tt.id)}>
                                            <i className="bi bi-check-lg"></i> Approve
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleAction('reject', tt.id)}>
                                            <i className="bi bi-x-lg"></i> Reject
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">There are no timetables pending approval in your department.</p>
                    )}
                </div>
            </div>

            {selectedTimetable && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Preview: {selectedTimetable.name}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedTimetable(null)}></button>
                            </div>
                            <div className="modal-body">
                                <TimetableView data={selectedTimetable.data} />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setSelectedTimetable(null)}>Close Preview</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveTimetables;

