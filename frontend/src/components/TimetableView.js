import React from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable component to display timetable data in a grid format.
 * It transforms a flat list of schedule entries into a structured table.
 */
const TimetableView = ({ data, message }) => {
  // Define the structure of the timetable grid
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TIMESLOTS = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00', // Lunch
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
  ];

  // If there's no data, display the provided message.
  if (!data || data.length === 0) {
    return (
      <div className="text-center my-5 p-4 bg-light rounded shadow-sm">
        <p className="lead text-muted">{message}</p>
      </div>
    );
  }

  // Pre-process the flat data array into a Map for quick lookups.
  // The key will be a string like "Monday-09:00-10:00".
  const scheduleMap = new Map();
  data.forEach(item => {
    scheduleMap.set(`${item.day}-${item.timeslot}`, item);
  });

  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-bordered table-hover text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th style={{ width: '10%' }}>Time / Day</th>
            {DAYS.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIMESLOTS.map(slot => (
            <tr key={slot}>
              <td className="fw-bold">{slot}</td>
              {DAYS.map(day => {
                // For each cell, look up the corresponding event in our map
                const event = scheduleMap.get(`${day}-${slot}`);
                
                if (slot === '12:00-13:00') {
                  // A special case for the lunch break
                  return (
                    <td key={`${day}-${slot}`} className="table-secondary fw-bold">
                      LUNCH
                    </td>
                  );
                }
                
                return (
                  <td key={`${day}-${slot}`}>
                    {event ? (
                      // If an event exists, display its details
                      <div>
                        <strong className="text-primary">{event.subject}</strong>
                        <br />
                        <small className="text-muted">{event.faculty}</small>
                        <br />
                        <small><em>({event.room})</em></small>
                      </div>
                    ) : (
                      // Render an empty cell if no event is scheduled
                      ''
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Define prop types for the component for better maintainability and error checking.
TimetableView.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      timeslot: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      faculty: PropTypes.string.isRequired,
      room: PropTypes.string.isRequired,
    })
  ),
  message: PropTypes.string,
};

// Set default props
TimetableView.defaultProps = {
  data: [],
  message: 'Please make a selection to view the timetable.',
};

export default TimetableView;