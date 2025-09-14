import React, { useState } from 'react';
import { generateTimetable as apiGenerateTimetable } from '../../services/api';
import Spinner from '../../components/Spinner';
import TimetableView from '../../components/TimetableView';

/**
 * Page for administrators to generate a new timetable.
 * It provides a button to trigger the process and displays the result.
 */
const GenerateTimetable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTimetable, setGeneratedTimetable] = useState(null);

  /**
   * Handles the click event of the 'Generate Timetable' button.
   * It calls the API and manages the component's state.
   */
  const handleGenerateClick = async () => {
    // Reset previous states before starting
    setIsLoading(true);
    setError(null);
    setGeneratedTimetable(null);

    try {
      const response = await apiGenerateTimetable();
      if (response && response.status === 'success') {
        setGeneratedTimetable(response.timetable);
      } else {
        // Handle cases where the API returns a failure status (e.g., no solution found)
        setError(response.message || 'The solver could not find a valid timetable.');
      }
    } catch (err) {
      // Handle network errors or server exceptions
      const errorMessage = err.response?.data?.message || 'A network error occurred. Please try again.';
      setError(errorMessage);
      console.error('Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="h2">Generate New Timetable</h1>
      <p>
        Click the button below to start the automatic generation process. The system will attempt to create an optimized, clash-free timetable based on all available data and constraints.
      </p>

      <div className="card shadow-sm mt-4">
        <div className="card-body text-center">
          <h5 className="card-title">Start the Optimization Engine</h5>
          <p className="card-text text-muted">This process may take a few moments to complete.</p>
          <button
            className="btn btn-primary btn-lg px-5"
            onClick={handleGenerateClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : (
              <>
                <i className="bi bi-play-circle-fill me-2"></i>
                Start Generation
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Results Section --- */}
      <div className="mt-4">
        {isLoading && <Spinner message="The optimization engine is running... Please wait." />}
        
        {error && (
          <div className="alert alert-danger">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Generation Failed
            </h4>
            <p>{error}</p>
          </div>
        )}

        {generatedTimetable && (
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-check-circle-fill me-2"></i>
                Timetable Generated Successfully!
              </h4>
            </div>
            <div className="card-body">
              <p>Review the generated timetable below. If it meets the requirements, you can save and publish it.</p>
              <TimetableView data={generatedTimetable} />
              <div className="text-end mt-3">
                 <button className="btn btn-info me-2">Save as Draft</button>
                 <button className="btn btn-success">Save and Publish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateTimetable;