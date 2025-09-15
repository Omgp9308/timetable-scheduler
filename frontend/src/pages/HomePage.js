import React, { useState, useEffect, useRef } from 'react';
import TimetableView from '../components/TimetableView';
import Spinner from '../components/Spinner';
import { getPublicDepartments, getPublicFilters, getPublicTimetable } from '../services/api';

/**
 * The main public-facing page of the application.
 */
const HomePage = () => {
  // State for department selection
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');

  // State for storing the options for our dropdown filters
  const [filters, setFilters] = useState({ batches: [], faculty: [], rooms: [] });
  // State for the user's current selection
  const [selection, setSelection] = useState({ type: 'batch', value: '' });
  // State for the fetched timetable data to display
  const [timetableData, setTimetableData] = useState(null);
  
  // Separate loading states for different stages
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isFetchingTimetable, setIsFetchingTimetable] = useState(false);
  
  const [error, setError] = useState('');
  const printRef = useRef();

  // Effect 1: Fetch the list of departments on initial component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getPublicDepartments();
        setDepartments(data);
      } catch (err) {
        setError('Could not load departments. The server may be unavailable.');
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    loadDepartments();
  }, []);

  // Effect 2: Fetch filters whenever a new department is selected
  useEffect(() => {
    if (!selectedDepartment) {
      setFilters({ batches: [], faculty: [], rooms: [] });
      setSelection({ type: 'batch', value: '' });
      setSelectedDepartmentName('');
      return;
    }

    const dept = departments.find(d => d.id === parseInt(selectedDepartment));
    if (dept) {
        setSelectedDepartmentName(dept.name);
    }

    const loadFilters = async () => {
      setIsLoadingFilters(true);
      setError('');
      try {
        const data = await getPublicFilters(selectedDepartment);
        setFilters(data);
      } catch (err) {
        setError('Could not load filter options for the selected department.');
      } finally {
        setIsLoadingFilters(false);
      }
    };
    loadFilters();
  }, [selectedDepartment, departments]);

  // Handler for the "Fetch Timetable" button click
  const handleFetchTimetable = async () => {
    if (!selection.value) {
      setError('Please select an option from the dropdown.');
      return;
    }
    
    setIsFetchingTimetable(true);
    setTimetableData(null);
    setError('');

    try {
      const data = await getPublicTimetable(selectedDepartment, selection.type, selection.value);
      setTimetableData(data);
    } catch (err) {
      setError('Failed to fetch the timetable. Please try again.');
    } finally {
      setIsFetchingTimetable(false);
    }
  };

  // Handler for the print button
  const handlePrint = () => {
    window.print();
  };
  
  // Dynamically get the list of options for the third dropdown based on the selected type
  const getOptionsForType = () => {
    switch (selection.type) {
      case 'faculty': return filters.faculty;
      case 'room': return filters.rooms;
      case 'batch':
      default: return filters.batches;
    }
  };

  return (
    <div className="container my-4">
      <div className="text-center p-md-5 p-3 mb-4 bg-light rounded-3 shadow-sm no-print">
        <h1 className="display-4 fw-bold">University Timetable Viewer</h1>
        <p className="col-lg-8 mx-auto fs-5 text-muted">
          First, select a department. Then, choose a batch, faculty member, or room to instantly view the weekly schedule.
        </p>
      </div>

      <div className="card shadow-sm no-print">
        <div className="card-body">
          <div className="row g-3 align-items-end justify-content-center">
            
            <div className="col-md-3">
              <label className="form-label">1. Select Department</label>
              <select 
                className="form-select"
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                disabled={isLoadingDepartments}
              >
                <option value="" disabled>{isLoadingDepartments ? 'Loading...' : 'Choose Department'}</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">2. Filter By</label>
              <select 
                className="form-select"
                value={selection.type}
                onChange={e => setSelection({ type: e.target.value, value: '' })}
                disabled={!selectedDepartment}
              >
                <option value="batch">Batch</option>
                <option value="faculty">Faculty</option>
                <option value="room">Room</option>
              </select>
            </div>

            <div className="col-md-4">
               <label className="form-label">3. Select Option</label>
              <select 
                className="form-select"
                value={selection.value}
                onChange={e => setSelection({ ...selection, value: e.target.value })}
                disabled={!selectedDepartment || isLoadingFilters}
              >
                <option value="" disabled>
                  {isLoadingFilters ? 'Loading...' : `--- Select a ${selection.type} ---`}
                </option>
                {getOptionsForType().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2 d-grid">
              <button 
                className="btn btn-primary" 
                onClick={handleFetchTimetable}
                disabled={isFetchingTimetable || !selection.value}
              >
                {isFetchingTimetable ? 'Fetching...' : 'View Timetable'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mt-4">
        {isFetchingTimetable && <Spinner message="Fetching schedule..." />}
        {error && <div className="alert alert-danger no-print">{error}</div>}
        
        {timetableData && (
          <div className="d-flex justify-content-end mb-2 no-print">
            <button className="btn btn-secondary" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-2"></i>
              Print Timetable
            </button>
          </div>
        )}

        <div id="printableArea" ref={printRef}>
          {timetableData && (
            <div className="print-header">
              <h2>Timetable for {selection.value}</h2>
              <p>{selectedDepartmentName}</p>
            </div>
          )}
          <TimetableView 
              data={timetableData} 
              message="Please make a selection to view the timetable." 
           />
        </div>
      </div>
    </div>
  );
};

export default HomePage;