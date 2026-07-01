import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="text-lg font-bold text-white">Eventify</span>
        </div>
        <p className="text-sm text-slate-400">
          Discover, organize, and manage events with ease. From concerts to conferences, we power it all.
        </p>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Explore</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/events" className="hover:text-white">Browse Events</Link></li>
          <li><Link to="/register" className="hover:text-white">Become an Organizer</Link></li>
          <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-white">About Us</a></li>
          <li><a href="#" className="hover:text-white">Contact</a></li>
          <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white">Terms of Service</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Connect</h4>
        <div className="flex gap-3">
          <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiFacebook /></a>
          <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiTwitter /></a>
          <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiInstagram /></a>
          <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiMail /></a>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-800 py-4 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} Eventify. All rights reserved.
    </div>
  </footer>
);

export default Footer;
