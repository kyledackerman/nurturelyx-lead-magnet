import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Auto-redirect to homepage after 2 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-4">Redirecting to homepage in 2 seconds...</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Or click here to return now
        </a>
      </div>
    </div>
  );
};

export default NotFound;
