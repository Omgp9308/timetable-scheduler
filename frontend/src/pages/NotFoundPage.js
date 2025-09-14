import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A standard 404 "Not Found" page.
 */
const NotFoundPage = () => {
  return (
    <div className="container text-center mt-5 pt-5">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <p className="fs-3">
        <span className="text-danger">Oops!</span> Page not found.
      </p>
      <p className="lead">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg mt-3">
        <i className="bi bi-house-door-fill me-2"></i>
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
