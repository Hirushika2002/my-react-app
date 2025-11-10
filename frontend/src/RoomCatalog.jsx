import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RoomCatalog() {
  const [rooms, setRooms] = useState([]);
  const [statusFilter, setStatusFilter] = useState('available');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/rooms');
        if (mounted) {
          setRooms(data);
          setError('');
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError('Unable to load rooms right now.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRooms();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesStatus = statusFilter === 'all' ? true : room.status === statusFilter;
      const matchesType = typeFilter ? room.type?.toLowerCase() === typeFilter.toLowerCase() : true;
      const matchesSearch = search
        ? (room.name + room.roomNumber + room.description + (room.amenities || []).join(' ')).toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [rooms, statusFilter, typeFilter, search]);

  const handleBook = (room) => {
    navigate('/hotels', { state: { prefillRoom: room } });
  };

  return (
    <div className="room-catalog">
      <div className="container">
        <header className="section-head">
          <h2>Browse available rooms</h2>
          <p>Filter by room type or availability to find the perfect space for your stay.</p>
        </header>

        <div className="room-catalog-filters">
          <input className="input plain" placeholder="Search by name, number, amenity" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input plain" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">In maintenance</option>
            <option value="all">All statuses</option>
          </select>
          <select className="input plain" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Villa">Villa</option>
            <option value="Standard">Standard</option>
          </select>
        </div>

        {loading ? (
          <div className="card" style={{ marginTop: 16 }}>Loading rooms…</div>
        ) : error ? (
          <div className="card" style={{ marginTop: 16, color: '#b91c1c' }}>{error}</div>
        ) : (
          <div className="room-catalog-grid">
            {filteredRooms.map((room) => (
              <article key={room._id || room.roomNumber} className="room-card">
                <div className="room-card-media" style={{ backgroundImage: `url(${room.images?.[0] || 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1000&q=80'})` }} />
                <div className="room-card-body">
                  <div className="room-card-head">
                    <h3>{room.name}</h3>
                    <span className={`room-status status-${room.status}`}>{room.status}</span>
                  </div>
                  <p className="room-card-meta">Room {room.roomNumber} • {room.type}</p>
                  {room.description ? <p className="room-card-desc">{room.description}</p> : null}
                  {room.amenities?.length ? (
                    <ul className="room-amenities">
                      {room.amenities.slice(0, 4).map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="room-card-foot">
                    <span className="room-price">LKR {room.price?.toLocaleString?.() || room.price}<span>per night</span></span>
                    <button className="btn btn-primary" type="button" onClick={() => handleBook(room)} disabled={room.status !== 'available'}>
                      {room.status === 'available' ? 'Book this room' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {filteredRooms.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1' }}>No rooms match your filters.</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomCatalog;
