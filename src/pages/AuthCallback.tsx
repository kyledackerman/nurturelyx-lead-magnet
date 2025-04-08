
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get error from URL parameters if any
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    
    // Always redirect back to home - we're no longer using Google Analytics
    toast.error("This authentication flow is no longer used", {
      description: "We now use SpyFu's public data. Redirecting you back to the main page.",
      duration: 5000,
    });
    
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4 space-y-6">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        
        <h1 className="text-2xl font-bold">
          Authentication No Longer Needed
        </h1>
        
        <p className="text-gray-400">
          We've updated our system to use SpyFu's public data. No authentication required.
        </p>
        
        <div className="space-y-2">
          <p className="text-red-500 bg-white p-2 rounded">
            You'll be redirected to the main form in a moment.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80 transition-colors"
          >
            Return to Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
