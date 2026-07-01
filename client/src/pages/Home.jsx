import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { eventService } from '../services/eventService';
import EventCard from '../components/event/EventCard';
import Spinner from '../components/common/Spinner';

const categories = ['Music', 'Technology', 'Business', 'Sports', 'Arts', 'Education', 'Food', 'Health'];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventService.getEvents({ limit: 8, sort: '-views' });
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl">
              Find & host events that matter to you
            </h1>
            <p className="text-lg text-primary-100 max-w-2xl mb-8">
              From concerts to conferences — discover experiences, sell tickets, and manage attendees, all in one place.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/events?search=${encodeURIComponent(search)}`;
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, categories, cities..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button type="submit" className="bg-accent-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Search
              </button>
            </form>
          </motion.div>
        </div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/events?category=${cat}`}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-700 transition-colors text-sm font-medium"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Trending Events</h2>
          <Link to="/events" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <Spinner full />
        ) : events.length === 0 ? (
          <p className="text-slate-500">No events yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Are you an organizer?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Create stunning event pages, sell tickets securely, and track performance with real-time analytics.
          </p>
          <Link to="/register" className="btn-primary inline-block">
            Start Organizing
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
