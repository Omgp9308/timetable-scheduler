import React, { useState } from 'react';
import { generateTimetable as apiGenerateTimetable, publishTimetable as apiPublishTimetable } from '../../services/api';
import Spinner from '../../components/Spinner';
import TimetableView from '../../components/TimetableView';

/**
 * Page for administrators to generate and publish a new timetable.
 */
const GenerateTimetable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedTimetable, setGeneratedTimetable] = useState(null);

  /**
   * Handles the click event of the 'Generate Timetable' button.
   */
  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedTimetable(null);

    try {
      const response = await apiGenerateTimetable();
      if (response && response.status === 'success') {
        setGeneratedTimetable(response.timetable);
      } else {
        setError(response.message || 'The solver could not find a valid timetable.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during generation.');
      console.error('Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the click event of the 'Save and Publish' button.
   */
  const handlePublishClick = async () => {
    if (!generatedTimetable) {
        alert("Please generate a timetable first.");
        return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiPublishTimetable(generatedTimetable);
      setSuccess(response.message || "Timetable published successfully!");
    } catch (err) {
       setError(err.message || 'An unexpected error occurred during publishing.');
       console.error('Publishing failed:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <h1 className="h2">Generate New Timetable</h1>
      <p>
        Click the button below to start the automatic generation process. This may take a few moments.
      </p>

      <div className="card shadow-sm mt-4">
        <div className="card-body text-center">
          <h5 className="card-title">Start the Optimization Engine</h5>
          <button
            className="btn btn-primary btn-lg px-5"
            onClick={handleGenerateClick}
            disabled={isLoading || isPublishing}
          >
            {isLoading ? 'Generating...' : 'Start Generation'}
          </button>
        </div>
      </div>

      {/* --- Results Section --- */}
      <div className="mt-4">
        {isLoading && <Spinner message="The optimization engine is running... Please wait." />}
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {generatedTimetable && (
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Timetable Generated Successfully!</h4>
            </div>
            <div className="card-body">
              <p>Review the generated timetable below. If it meets the requirements, publish it to make it live.</p>
              <TimetableView data={generatedTimetable} />
              <div className="text-end mt-3">
                 <button className="btn btn-info me-2" disabled>Save as Draft (Not Implemented)</button>
                 <button 
                    className="btn btn-success"
                    onClick={handlePublishClick}
                    disabled={isPublishing || isLoading}
                >
                    {isPublishing ? 'Publishing...' : 'Save and Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateTimetable;
