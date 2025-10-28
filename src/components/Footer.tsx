import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const Footer = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Footer navigation schema for SEO
  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Footer Navigation",
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Industries",
        "url": "https://x1.nurturely.io/industries"
      },
      {
        "@type": "WebPage",
        "name": "HVAC",
        "url": "https://x1.nurturely.io/industries/hvac"
      },
      {
        "@type": "WebPage",
        "name": "Legal Services",
        "url": "https://x1.nurturely.io/industries/legal"
      },
      {
        "@type": "WebPage",
        "name": "Real Estate",
        "url": "https://x1.nurturely.io/industries/real-estate"
      },
      {
        "@type": "WebPage",
        "name": "Home Services",
        "url": "https://x1.nurturely.io/industries/home-services"
      },
      {
        "@type": "WebPage",
        "name": "Automotive",
        "url": "https://x1.nurturely.io/industries/automotive"
      },
      {
        "@type": "WebPage",
        "name": "Healthcare",
        "url": "https://x1.nurturely.io/industries/healthcare"
      },
      {
        "@type": "WebPage",
        "name": "How It Works",
        "url": "https://x1.nurturely.io/how-it-works"
      },
      {
        "@type": "WebPage",
        "name": "Blog",
        "url": "https://x1.nurturely.io/blog"
      },
      {
        "@type": "WebPage",
        "name": "Pricing",
        "url": "https://x1.nurturely.io/pricing"
      }
    ]
  };

  // Organization contact schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NurturelyX",
    "url": "https://x1.nurturely.io",
    "logo": "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
    "description": "Turn anonymous website visitors into qualified leads with NurturelyX visitor identification technology",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "url": "https://x1.nurturely.io/submit-ticket",
      "areaServed": ["US", "CA", "GB"],
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/nurturelyx"
    ]
  };

  useEffect(() => {
    // Don't load chat widget on admin pages
    if (isAdminPage) return;

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
  }, [isAdminPage]);
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(siteNavigationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      
      <footer className="bg-black border-t border-gray-800 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Industries</h3>
            <ul className="space-y-2">
              <li><Link to="/industries/hvac" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">HVAC</Link></li>
              <li><Link to="/industries/legal" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Legal Services</Link></li>
              <li><Link to="/industries/real-estate" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Real Estate</Link></li>
              <li><Link to="/industries/home-services" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Home Services</Link></li>
              <li><Link to="/industries/automotive" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Automotive</Link></li>
              <li><Link to="/industries/healthcare" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Healthcare</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/resources" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Resource Hub</Link></li>
              <li><Link to="/how-it-works" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">How It Works</Link></li>
              <li><Link to="/blog" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Blog</Link></li>
              <li><Link to="/pricing" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Pricing</Link></li>
              <li><Link to="/learn" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Learn More</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Top Reports</h3>
            <ul className="space-y-2">
              <li><Link to="/top-companies-losing-revenue" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Top 25 Companies</Link></li>
              <li><Link to="/reports/hvac" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">HVAC Reports</Link></li>
              <li><Link to="/reports/legal" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Legal Reports</Link></li>
              <li><Link to="/reports/real-estate" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Real Estate Reports</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Home</Link></li>
              <li><Link to="/auth" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Sign In</Link></li>
              <li><Link to="/ambassador/apply" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Become an Ambassador</Link></li>
              <li><a href="https://nurturely.io/post/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Privacy Policy</a></li>
              <li><a href="https://nurturely.io/post/terms" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-gray-300 hover:text-white inline-block py-1">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
          <p className="text-xs md:text-sm text-gray-400 mb-2">
            © {new Date().getFullYear()} NurturelyX. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Turn anonymous website visitors into qualified leads
          </p>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
