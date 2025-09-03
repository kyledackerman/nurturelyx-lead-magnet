
const Footer = () => {
  return (
    <footer className="bg-black mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center space-x-8">
            <a href="#" className="text-sm text-gray-300 hover:text-white">Privacy</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white">Terms</a>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-400 mb-4">
              © {new Date().getFullYear()} All rights reserved.
            </p>
            <h3 className="text-lg font-semibold text-white">NurturelyX</h3>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
