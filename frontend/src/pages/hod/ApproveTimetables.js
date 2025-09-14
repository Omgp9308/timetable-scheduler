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

    const handleApprove = async (id) => {
        try {
            await approveTimetable(id);
            setSuccess('Timetable has been approved and published.');
            setSelectedTimetable(null); // Hide the view after action
            fetchPending(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to approve timetable.');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectTimetable(id);
            setSuccess('Timetable has been rejected.');
            setSelectedTimetable(null);
            fetchPending();
        } catch (err) {
            setError(err.message || 'Failed to reject timetable.');
        }
    };

    if (isLoading) {
        return <Spinner message="Loading timetables pending approval..." />;
    }

    return (
        <div>
            <h1 className="h2">Approve Timetables</h1>
            <p>Review the timetables submitted by teachers in your department and approve or reject them.</p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card shadow-sm">
                <div className="card-header"><h5 className="mb-0">Pending Approval</h5></div>
                <div className="card-body">
                    {pending.length > 0 ? (
                        <ul className="list-group">
                            {pending.map(tt => (
                                <li key={tt.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{tt.name}</strong>
                                        <br />
                                        <small className="text-muted">Created: {new Date(tt.created_at).toLocaleString()}</small>
                                    </div>
                                    <div>
                                        <button className="btn btn-info btn-sm me-2" onClick={() => setSelectedTimetable(tt.data)}>
                                            View
                                        </button>
                                        <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(tt.id)}>
                                            Approve
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(tt.id)}>
                                            Reject
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
                <div className="mt-4">
                    <h3 className="h4">Timetable Preview</h3>
                    <TimetableView data={selectedTimetable} />
                    <button className="btn btn-secondary mt-2" onClick={() => setSelectedTimetable(null)}>Close Preview</button>
                </div>
            )}
        </div>
    );
};

export default ApproveTimetables;
