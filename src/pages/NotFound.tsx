
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Oops! Page not found</p>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
          <br />
          <span className="text-sm">
            Attempted path: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</code>
          </span>
        </p>
        <div className="mb-6 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <p className="font-semibold">Debug information:</p>
          <p>Current location: {JSON.stringify(location)}</p>
        </div>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline font-medium">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
