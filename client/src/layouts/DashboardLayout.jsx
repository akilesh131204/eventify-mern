import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const DashboardLayout = ({ links, title }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <div className="flex flex-1">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{title}</h2>
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.icon} {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
