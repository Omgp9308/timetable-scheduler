import React, { useState, useEffect } from 'react';
import TimetableView from '../components/TimetableView';
import Spinner from '../components/Spinner';
import { getPublicFilters, getPublicTimetable } from '../services/api';

/**
 * The main public-facing page of the application.
 * The Header is now handled by the persistent MainLayout.
 */
const HomePage = () => {
  // State for storing the options for our dropdown filters
  const [filters, setFilters] = useState({ batches: [], faculty: [], rooms: [] });
  // State for the user's current selection
  const [selection, setSelection] = useState({ type: 'batch', value: '' });
  // State for the fetched timetable data to display
  const [timetableData, setTimetableData] = useState(null);
  
  // Separate loading states for initial filter load vs. fetching a timetable
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isFetchingTimetable, setIsFetchingTimetable] = useState(false);
  
  const [error, setError] = useState('');

  // Effect to fetch the filter data (batches, faculty, rooms) once on component mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await getPublicFilters();
        setFilters(data);
      } catch (err) {
        setError('Could not load filter options. The server may be unavailable.');
        console.error(err);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    loadFilters();
  }, []);

  // Handler for the "Fetch Timetable" button click
  const handleFetchTimetable = async () => {
    if (!selection.value) {
      alert('Please select an option from the dropdown.');
      return;
    }
    
    setIsFetchingTimetable(true);
    setTimetableData(null); // Clear previous results
    setError('');

    try {
      const data = await getPublicTimetable(selection.type, selection.value);
      setTimetableData(data);
    } catch (err) { // FIXED: Added the missing curly braces here
      setError('Failed to fetch the timetable. Please try again.');
      console.error(err);
    } finally {
      setIsFetchingTimetable(false);
    }
  };
  
  // Dynamically get the list of options for the second dropdown
  const getOptionsForType = () => {
    switch (selection.type) {
      case 'faculty':
        return filters.faculty;
      case 'room':
        return filters.rooms;
      case 'batch':
      default:
        return filters.batches;
    }
  };

  return (
    <div className="container my-4">
      <div className="text-center p-md-5 p-3 mb-4 bg-light rounded-3 shadow-sm">
        <h1 className="display-4 fw-bold">University Timetable Viewer</h1>
        <p className="col-lg-8 mx-auto fs-5 text-muted">
          Select a batch, faculty member, or room to instantly view the weekly schedule.
        </p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center justify-content-center">
            <div className="col-md-3">
              <select 
                className="form-select"
                value={selection.type}
                onChange={e => setSelection({ type: e.target.value, value: '' })}
              >
                <option value="batch">View by Batch</option>
                <option value="faculty">View by Faculty</option>
                <option value="room">View by Room</option>
              </select>
            </div>

            <div className="col-md-5">
              <select 
                className="form-select"
                value={selection.value}
                onChange={e => setSelection({ ...selection, value: e.target.value })}
                disabled={isLoadingFilters}
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
                {isFetchingTimetable ? 'Fetching...' : 'Fetch Timetable'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mt-4">
        {isFetchingTimetable && <Spinner message="Fetching schedule..." />}
        {error && <div className="alert alert-danger">{error}</div>}
        
        {timetableData !== null && (
           <TimetableView 
              data={timetableData} 
              message="No schedule found for the selected option." 
           />
        )}
      </div>
    </div>
  );
};

export default HomePage;

