import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
// We will add/use these functions in the api service
import { addFaculty, getDataForMyDepartment } from '../../services/api';
import Spinner from '../../components/Spinner';

const ManageTeachers = () => {
    const { user } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for the new teacher form
    const [newName, setNewName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedExpertise, setSelectedExpertise] = useState([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // This single API call fetches all data for the HOD's department
            const deptData = await getDataForMyDepartment();
            setTeachers(deptData.faculty);
            setSubjects(deptData.subjects);
        } catch (err) {
            setError('Failed to fetch department data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000); // Hide after 3 seconds
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newName.trim() || !newUsername.trim() || !newPassword.trim() || selectedExpertise.length === 0) {
            setError('All fields are required.');
            return;
        }
        try {
            const newTeacherPayload = {
                name: newName,
                username: newUsername,
                password: newPassword,
                expertise: selectedExpertise
            };
            const newTeacher = await addFaculty(newTeacherPayload);
            // After adding, we should refetch the data to get the complete teacher object
            // including the username which is set on the backend.
            fetchData();

            // Reset form
            setNewName('');
            setNewUsername('');
            setNewPassword('');
            setSelectedExpertise([]);
            showSuccessMessage(`Teacher "${newTeacher.name}" created successfully.`);
        } catch (err) {
            setError(err.message || 'Failed to add teacher. The username or name may already exist.');
        }
    };

    if (isLoading) {
        return <Spinner message="Loading department data..." />;
    }

    return (
        <div>
            <h1 className="h2">Manage Teachers</h1>
            <p>As HOD of the <strong>{user.department_name}</strong> department, you can add new teachers here.</p>

            {/* Add Teacher Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Add New Teacher</h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleAddTeacher}>
                        <div className="row g-3">
                            <div className="col-md-12">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text" placeholder="e.g., Dr. Alan Turing"
                                    className="form-control"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Login Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    required
                                />
                            </div>
                             <div className="col-md-6">
                                <label className="form-label">Initial Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label">Subject Expertise (Select multiple)</label>
                                <select
                                    multiple
                                    className="form-select"
                                    value={selectedExpertise}
                                    onChange={(e) => setSelectedExpertise(Array.from(e.target.selectedOptions, option => option.value))}
                                    style={{ height: '150px' }}
                                    required
                                >
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                                <div className="form-text">Hold Ctrl (or Cmd on Mac) to select multiple subjects.</div>
                            </div>
                        </div>
                        <button className="btn btn-primary mt-3" type="submit">
                            <i className="bi bi-person-plus-fill me-2"></i>
                            Create Teacher Account
                        </button>
                    </form>
                </div>
            </div>

            {/* Teachers List */}
            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">Existing Teachers in Your Department</h5>
                </div>
                <div className="card-body">
                     {teachers.length > 0 ? (
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Login Username</th>
                                    <th>Expertise (Subject IDs)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.username || 'N/A'}</td>
                                        <td>{teacher.expertise.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">No teachers have been added to this department yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTeachers;

