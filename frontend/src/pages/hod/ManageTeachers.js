import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getDataForMyDepartment } from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * ManageTeachers Component (View-Only for HOD)
 *
 * This component now serves as a read-only list of teachers
 * in the Head of Department's (HOD) specific department.
 * The creation of teachers is now centralized in the Admin's
 * 'Manage Users' panel to reduce redundancy.
 */
const ManageTeachers = () => {
    const { user } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetches all relevant data for the HOD's department, including faculty
                const deptData = await getDataForMyDepartment();
                setTeachers(deptData.faculty);
            } catch (err) {
                setError('Failed to fetch department faculty data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <Spinner message="Loading department faculty..." />;
    }

    return (
        <div>
            <h1 className="h2">View Teachers</h1>
            <p>
                Below is a list of all teachers in the <strong>{user.department_name}</strong> department.
                Teacher accounts are created by the Admin in the "Manage Users" section.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">Department Faculty</h5>
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