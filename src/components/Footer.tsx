import { Link } from "react-router-dom";
import { useEffect } from "react";

const Footer = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    script.setAttribute('data-widget-id', '68f52b2ebad480e00c1e81ad');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Industries</h3>
            <ul className="space-y-2">
              <li><Link to="/industries/hvac" className="text-sm text-gray-300 hover:text-white">HVAC</Link></li>
              <li><Link to="/industries/legal" className="text-sm text-gray-300 hover:text-white">Legal Services</Link></li>
              <li><Link to="/industries/real-estate" className="text-sm text-gray-300 hover:text-white">Real Estate</Link></li>
              <li><Link to="/industries/home-services" className="text-sm text-gray-300 hover:text-white">Home Services</Link></li>
              <li><Link to="/industries/automotive" className="text-sm text-gray-300 hover:text-white">Automotive</Link></li>
              <li><Link to="/industries/healthcare" className="text-sm text-gray-300 hover:text-white">Healthcare</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/how-it-works" className="text-sm text-gray-300 hover:text-white">How It Works</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link to="/pricing" className="text-sm text-gray-300 hover:text-white">Pricing</Link></li>
              <li><Link to="/learn" className="text-sm text-gray-300 hover:text-white">Learn More</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Reports</h3>
            <ul className="space-y-2">
              <li><Link to="/top-companies-losing-revenue" className="text-sm text-gray-300 hover:text-white">Top 25 Companies</Link></li>
              <li><Link to="/reports/hvac" className="text-sm text-gray-300 hover:text-white">HVAC Reports</Link></li>
              <li><Link to="/reports/legal" className="text-sm text-gray-300 hover:text-white">Legal Reports</Link></li>
              <li><Link to="/reports/real-estate" className="text-sm text-gray-300 hover:text-white">Real Estate Reports</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/auth" className="text-sm text-gray-300 hover:text-white">Sign In</Link></li>
              <li><a href="https://nurturely.io/post/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="https://nurturely.io/post/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            © {new Date().getFullYear()} NurturelyX. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Turn anonymous website visitors into qualified leads
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
