import React from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable loading spinner component.
 *
 * @param {object} props - The component's props.
 * @param {string} [props.message='Loading...'] - The message to display below the spinner.
 * @param {string} [props.size] - The size of the spinner ('sm' or 'lg').
 */
const Spinner = ({ message, size }) => {
  // Conditionally apply Bootstrap's size class if the 'size' prop is provided
  const sizeClass = size ? `spinner-border-${size}` : '';

  return (
    <div className="d-flex flex-column justify-content-center align-items-center my-5">
      <div 
        className={`spinner-border text-primary ${sizeClass}`} 
        role="status"
        style={{ width: '3rem', height: '3rem' }} // A slightly larger default size
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 fw-bold">{message}</p>}
    </div>
  );
};

// Define default props for the component
Spinner.defaultProps = {
  message: 'Loading...',
  size: null, // Default to standard size
};

// Define prop types for type checking and better component documentation
Spinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'lg']),
};

export default Spinner;