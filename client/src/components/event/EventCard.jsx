import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const EventCard = ({ event }) => {
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/events/${event._id}`} className="card overflow-hidden block h-full group">
        <div className="relative h-44 overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full text-primary-700">
            {event.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1 mb-2">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <FiCalendar size={14} /> {dateStr} · {event.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <FiMapPin size={14} /> {event.location?.isOnline ? 'Online' : `${event.location?.city}`}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-primary-700 font-bold">
              {event.minPrice > 0 ? `₹${event.minPrice}+` : 'Free'}
            </span>
            <span className="text-xs text-slate-400">{event.views} views</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
