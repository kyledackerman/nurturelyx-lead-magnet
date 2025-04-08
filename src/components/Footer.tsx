
import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">NurturelyX</h3>
            <p className="text-sm text-gray-600">
              Transform anonymous website visitors into qualified leads with our identity resolution technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Features</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Integrations</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Pricing</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Case Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Guides</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">About</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Contact</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-purple">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NurturelyX. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-brand-purple flex items-center">
              Free Trial <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
