import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Stat({ label, value, trend }) {
  return (
    <div className="dashboard-stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {trend ? <span className="stat-trend">{trend}</span> : null}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('authUser') || 'null');
    } catch {
      return null;
    }
  });
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '', userId: '' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (targetUserId) => {
    if (!targetUserId) {
      setBookings([]);
      return;
    }
    try {
      const { data } = await axios.get('/api/bookings', { params: { userId: targetUserId } });
      setBookings(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load bookings');
    }
  }, []);

  const userId = useMemo(() => currentUser?._id || '', [currentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('authUser');
      setCurrentUser(raw ? JSON.parse(raw) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncUser = () => {
      try {
        const raw = localStorage.getItem('authUser');
        setCurrentUser(raw ? JSON.parse(raw) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, userId }));
    load(userId);
  }, [userId, load]);

  const save = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('Please sign in to manage bookings.');
      navigate('/signin');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        userId,
        checkIn: new Date(form.checkIn),
        checkOut: new Date(form.checkOut)
      };
      if (editingId) {
        await axios.put(`/api/bookings/${editingId}`, payload);
      } else {
        await axios.post('/api/bookings', payload);
      }
      setForm({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '', userId });
      setEditingId(null);
      await load(userId);
    } catch (e) {
      console.error(e);
      alert('Save failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const editRow = (b) => {
    setEditingId(b._id);
    setForm({
      guestName: b.guestName,
      roomNumber: b.roomNumber,
      checkIn: b.checkIn?.slice(0,10) || '',
      checkOut: b.checkOut?.slice(0,10) || '',
      status: b.status,
      notes: b.notes || '',
      userId: b.userId || userId
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this booking?')) return;
    if (!userId) {
      alert('Please sign in to manage bookings.');
      navigate('/signin');
      return;
    }
    setBusy(true);
    try {
      await axios.delete(`/api/bookings/${id}`);
      await load(userId);
    } catch (e) {
      console.error(e);
      alert('Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const greetingName = useMemo(() => {
    const username = currentUser?.username || '';
    if (!username) return 'Guest';
    const base = username.split('@')[0];
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Guest';
  }, [currentUser]);

  const upcomingBookings = useMemo(() =>
    bookings
      .filter((b) => {
        const checkout = new Date(b.checkOut);
        if (Number.isNaN(checkout.getTime())) return false;
        const today = new Date();
        today.setHours(0,0,0,0);
        return checkout >= today;
      })
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
  , [bookings]);

  const pastBookings = useMemo(() =>
    bookings
      .filter((b) => {
        const checkout = new Date(b.checkOut);
        if (Number.isNaN(checkout.getTime())) return false;
        const today = new Date();
        today.setHours(0,0,0,0);
        return checkout < today;
      })
      .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut))
  , [bookings]);

  const nextStay = upcomingBookings[0] || null;
  const totalNightsBooked = useMemo(() => {
    return bookings.reduce((acc, b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const diff = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
      return Number.isFinite(diff) && diff > 0 ? acc + diff : acc;
    }, 0);
  }, [bookings]);

  const handleCreateBooking = () => {
    navigate('/hotels');
  };

  const roundedNightCount = Math.max(0, Math.round(totalNightsBooked));

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '', userId });
  }, [setEditingId, setForm, userId]);

  const formatDate = (value) => {
  if (!value) return '--';
    const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRange = (start, end) => {
    const from = formatDate(start);
    const to = formatDate(end);
    return `${from} - ${to}`;
  };
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="container dashboard-hero-inner">
          <div className="dashboard-hero-content">
            <p className="dashboard-hero-kicker">Welcome back</p>
            <h1>Hi {greetingName}, here&apos;s your Smart Stays hub</h1>
            <p className="dashboard-hero-subtitle">Track reservations, keep plans organised, and discover exclusive deals curated for you.</p>
            <div className="dashboard-hero-actions">
              <button type="button" className="btn btn-primary" onClick={handleCreateBooking}>Book another stay</button>
              <Link to="/hotels" className="btn btn-light">Browse hotels</Link>
            </div>
            <div className="next-stay-card">
              <span className="next-stay-label">{nextStay ? 'Your next stay' : 'No upcoming stays yet'}</span>
              {nextStay ? (
                <>
                  <h3 className="next-stay-title">{nextStay.guestName || greetingName}</h3>
                  <p className="next-stay-dates">{formatRange(nextStay.checkIn, nextStay.checkOut)}</p>
                  <p className="next-stay-meta">Room {nextStay.roomNumber} • Status <span className={`status-chip status-${nextStay.status}`}>{nextStay.status}</span></p>
                  {nextStay.notes ? <p className="next-stay-notes">{nextStay.notes}</p> : null}
                </>
              ) : (
                <p className="next-stay-empty">Plan your next escape to see it appear here.</p>
              )}
            </div>
          </div>
          <div className="dashboard-hero-stats">
            <Stat label="Total bookings" value={bookings.length} trend={`${upcomingBookings.length} upcoming`} />
            <Stat label="Nights booked" value={roundedNightCount} trend={pastBookings.length ? `${pastBookings.length} past stays` : 'Start exploring'} />
            <Stat label="Active status" value={nextStay ? nextStay.status : 'None'} trend={nextStay ? `Check-in ${formatDate(nextStay.checkIn)}` : 'Ready when you are'} />
          </div>
        </div>
      </section>

      <section className="container dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-column primary">
            <div className="card booking-table-card">
              <div className="section-header">
                <div>
                  <h2>Upcoming stays</h2>
                  <p>Modify, cancel, or keep an eye on what&apos;s coming up next.</p>
                </div>
                <button type="button" className="link-button" onClick={handleCreateBooking}>Plan a stay</button>
              </div>
              {upcomingBookings.length ? (
                <div className="table table-modern">
                  <div className="t-head">
                    <span>Guest</span>
                    <span>Room</span>
                    <span>Dates</span>
                    <span>Status & Actions</span>
                  </div>
                  {upcomingBookings.map((b) => (
                    <div key={b._id} className="t-row">
                      <span className="cell-guest">
                        <strong>{b.guestName}</strong>
                        {b.notes ? <small>{b.notes}</small> : null}
                      </span>
                      <span>Room {b.roomNumber}</span>
                      <span>{formatRange(b.checkIn, b.checkOut)}</span>
                      <span className="cell-actions">
                        <span className="badge badge-soft">{b.status}</span>
                        <button type="button" className="link-button" onClick={() => editRow(b)}>Edit</button>
                        <button type="button" className="link-button danger" onClick={() => remove(b._id)}>Cancel</button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No upcoming stays yet</h3>
                  <p>When you book your next getaway, it will appear here for quick access.</p>
                  <button type="button" className="btn btn-primary" onClick={handleCreateBooking}>Find your next stay</button>
                </div>
              )}
            </div>

            <div className="card past-stays-card">
              <div className="section-header">
                <div>
                  <h2>Recent stays</h2>
                  <p>Review where you&apos;ve been and plan to revisit favourites.</p>
                </div>
                <Link to="/hotels" className="link-button">Book again</Link>
              </div>
              {pastBookings.length ? (
                <ul className="stay-list">
                  {pastBookings.slice(0, 4).map((b) => (
                    <li key={b._id}>
                      <div>
                        <strong>{b.guestName}</strong>
                        <p>{formatRange(b.checkIn, b.checkOut)}</p>
                      </div>
                      <span className="stay-room">Room {b.roomNumber}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state compact">
                  <p>No previous stays logged yet.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="dashboard-column secondary">
            <div className="card booking-form-card">
              <h2>{editingId ? 'Update booking' : 'Add a booking'}</h2>
              <p className="form-subtitle">Keep your itinerary in sync with Smart Stays.</p>
              <form onSubmit={save} className="dashboard-form">
                <label>
                  Guest name
                  <input className="input" placeholder="Guest name" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} required />
                </label>
                <div className="form-row">
                  <label>
                    Room number
                    <input className="input" placeholder="Room number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
                  </label>
                  <label>
                    Status
                    <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="confirmed">confirmed</option>
                      <option value="checked-in">checked-in</option>
                      <option value="checked-out">checked-out</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Check-in
                    <input className="input" type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} required />
                  </label>
                  <label>
                    Check-out
                    <input className="input" type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} required />
                  </label>
                </div>
                <label>
                  Notes (optional)
                  <input className="input" placeholder="Add a note" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </label>
                <div className="form-actions">
                  <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Create booking'}</button>
                  {editingId ? (
                    <button type="button" className="link-button" onClick={resetForm}>Cancel edit</button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="card travel-tips-card">
              <h3>Need some inspiration?</h3>
              <p>Check personalised recommendations and exclusive deals in the Hotels section.</p>
              <Link to="/hotels" className="btn btn-light">Discover deals</Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
