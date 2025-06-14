import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center px-4"> {/* Adjust min-h if navbar/footer height changes */}
      <img src="https://picsum.photos/seed/404page/300/200?grayscale&blur=2" alt="Lost and Confused" className="rounded-lg shadow-lg mb-8 w-64 h-auto"/>
      <h1 className="text-6xl font-bold text-slate-700">404</h1>
      <p className="text-2xl text-gray-600 mt-4">Oops! Page Not Found.</p>
      <p className="text-gray-500 mt-2 mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button onClick={() => window.history.back()} variant="secondary" className="mr-4">
        Go Back
      </Button>
      <Link to="/">
        <Button variant="primary">
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
