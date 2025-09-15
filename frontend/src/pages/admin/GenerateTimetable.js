import React, { useState } from 'react';
import { generateAndSaveTimetable, getDraftTimetables, submitTimetableForApproval } from '../../services/api';
import Spinner from '../../components/Spinner';
import TimetableView from '../../components/TimetableView';

const GenerateTimetable = () => {
    const [drafts, setDrafts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newTimetableName, setNewTimetableName] = useState('');
    const [generatedData, setGeneratedData] = useState(null);

    const fetchDrafts = async () => {
        try {
            const data = await getDraftTimetables();
            setDrafts(data);
        } catch (err) {
            setError('Failed to fetch draft timetables.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!newTimetableName.trim()) {
            setError('Please provide a name for the timetable draft.');
            return;
        }
        setIsGenerating(true);
        setError('');
        setSuccess('');
        setGeneratedData(null);
        try {
            const response = await generateAndSaveTimetable(newTimetableName);
            setSuccess(response.message);
            setGeneratedData(response.draft.data); // Show the newly generated timetable
            fetchDrafts(); // Refresh the list of drafts
        } catch (err) {
            setError(err.message || 'Failed to generate timetable.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitForApproval = async (id) => {
        try {
            await submitTimetableForApproval(id);
            setSuccess('Timetable submitted for approval!');
            fetchDrafts(); // Refresh list
        } catch (err) {
            setError(err.message || 'Failed to submit timetable.');
        }
    };

    if (isLoading) {
        return <Spinner message="Loading drafts..." />;
    }

    return (
        <div>
            <h1 className="h2">Generate & Manage Timetables</h1>
            <p>Generate a new timetable for your department and submit it for approval.</p>

            {/* Generation Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">1. Generate a New Timetable Draft</h5>
                    <form onSubmit={handleGenerate}>
                         <div className="mb-3">
                            <label className="form-label">Draft Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., Fall Semester 2025 Draft 1"
                                value={newTimetableName}
                                onChange={(e) => setNewTimetableName(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate & Save Draft'}
                        </button>
                    </form>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Display newly generated timetable */}
            {generatedData && (
                <div className="mb-4">
                    <h3 className="h4">Newly Generated Timetable:</h3>
                    <TimetableView data={generatedData} />
                </div>
            )}


            {/* Drafts List */}
            <div className="card shadow-sm">
                <div className="card-header"><h5 className="mb-0">2. Your Draft Timetables</h5></div>
                <div className="card-body">
                    {drafts.length > 0 ? (
                        <ul className="list-group">
                            {drafts.map(draft => (
                                <li key={draft.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{draft.name}</strong>
                                        <br />
                                        <small className="text-muted">Created: {new Date(draft.created_at).toLocaleString()}</small>
                                    </div>
                                    <button className="btn btn-success" onClick={() => handleSubmitForApproval(draft.id)}>
                                        Submit for Approval
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">You have no draft timetables.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateTimetable;