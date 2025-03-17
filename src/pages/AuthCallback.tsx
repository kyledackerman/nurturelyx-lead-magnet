
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Authenticating with Google Analytics...");
  
  useEffect(() => {
    // Get auth code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");
    const error = urlParams.get("error");
    
    if (error) {
      // Handle error from Google OAuth
      console.error("Google OAuth error:", error);
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      
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
      setStatus('success');
      setMessage("Successfully authenticated with Google Analytics");
      sessionStorage.setItem("google_analytics_token", "mock_token_from_oauth");
      
      // Notify the opener window (if this was opened as a popup)
      if (window.opener) {
        window.opener.postMessage({ type: "GOOGLE_ANALYTICS_AUTH_SUCCESS" }, window.location.origin);
        
        toast.success("Successfully connected to Google Analytics", {
          description: "Return to the main window to select a domain from your account."
        });
        
        // Close the popup after successful authentication
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        // If not in a popup, redirect back to the main page
        toast.success("Successfully connected to Google Analytics", {
          description: "You can now select one of your domains from the dropdown."
        });
        
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } else {
      // No auth code, redirect back to home
      setStatus('error');
      setMessage("Authentication failed: No authorization code received");
      
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
      <div className="text-center max-w-md px-4 space-y-6">
        {status === 'loading' && (
          <Loader2 className="w-16 h-16 text-accent animate-spin mx-auto" />
        )}
        
        {status === 'success' && (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        )}
        
        {status === 'error' && (
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        )}
        
        <h1 className="text-2xl font-bold">
          {status === 'loading' && "Connecting to Google Analytics"}
          {status === 'success' && "Connected Successfully"}
          {status === 'error' && "Connection Failed"}
        </h1>
        
        <p className="text-gray-400">
          {message}
        </p>
        
        {status === 'success' && (
          <p className="text-green-500 font-medium">
            {window.opener 
              ? "You can close this window and return to the main form."
              : "You'll be redirected to select a domain in a moment."}
          </p>
        )}
        
        {status === 'error' && (
          <div className="space-y-2">
            <p className="text-red-500 bg-white p-2 rounded">
              You'll be redirected to the form to try again or enter your data manually.
            </p>
            <button 
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80 transition-colors"
            >
              Return to Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
