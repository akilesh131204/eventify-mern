import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-7xl font-extrabold text-primary-600 mb-2">404</h1>
    <p className="text-slate-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
