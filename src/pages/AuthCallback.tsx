
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get auth code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");
    const error = urlParams.get("error");
    
    if (error) {
      // Handle error from Google OAuth
      console.error("Google OAuth error:", error);
      toast.error("Authentication failed", {
        description: error,
        duration: 5000,
      });
      
      // Redirect back to home page after error
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
      return;
    }
    
    if (authCode) {
      // In a real implementation, you would:
      // 1. Exchange the auth code for an access token using your backend
      // 2. Store the token securely
      
      // For demo purposes, we'll just store a dummy token
      sessionStorage.setItem("google_analytics_token", "mock_token_from_oauth");
      
      // Notify the opener window (if this was opened as a popup)
      if (window.opener) {
        window.opener.postMessage({ type: "GOOGLE_ANALYTICS_AUTH_SUCCESS" }, window.location.origin);
        
        // Close the popup after successful authentication
        window.close();
      } else {
        // If not in a popup, redirect back to the main page
        toast.success("Successfully connected to Google Analytics");
        navigate("/");
      }
    } else {
      // No auth code, redirect back to home
      toast.error("Authentication failed", {
        description: "No authorization code received",
        duration: 5000,
      });
      
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold mb-4">Connecting to Google Analytics</h1>
        <p className="text-gray-400 mb-8">
          Please wait while we authenticate your account...
        </p>
        <div className="w-16 h-16 border-4 border-t-accent border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
