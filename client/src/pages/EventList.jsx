import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { eventService } from '../services/eventService';
import EventCard from '../components/event/EventCard';
import Spinner from '../components/common/Spinner';

const categories = ['Music', 'Technology', 'Business', 'Sports', 'Arts', 'Education', 'Food', 'Health', 'Other'];

const EventList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await eventService.getEvents(params);
      setEvents(res.data);
      setPagination({ page: res.page, pages: res.pages, total: res.total });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    fetchEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Browse Events</h1>

      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search events..."
            className="input-field pl-11"
          />
        </div>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
          <FiFilter /> Filters
        </button>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            className="input-field"
          />
        </div>
      )}

      {loading ? (
        <Spinner full />
      ) : events.length === 0 ? (
        <p className="text-slate-500 py-20 text-center">No events found matching your criteria.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  className={`h-10 w-10 rounded-lg font-medium ${
                    p === pagination.page ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;
