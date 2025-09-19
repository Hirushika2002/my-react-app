import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Stat({ label, value, trend }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend ? <div className="stat-trend">{trend}</div> : null}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await axios.get('/api/bookings');
      setBookings(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load bookings');
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, checkIn: new Date(form.checkIn), checkOut: new Date(form.checkOut) };
      if (editingId) {
        await axios.put(`/api/bookings/${editingId}`, payload);
      } else {
        await axios.post('/api/bookings', payload);
      }
      setForm({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '' });
      setEditingId(null);
      await load();
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
      notes: b.notes || ''
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this booking?')) return;
    setBusy(true);
    try {
      await axios.delete(`/api/bookings/${id}`);
      await load();
    } catch (e) {
      console.error(e);
      alert('Delete failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="dashboard">
      <div className="container">
        <header className="dash-header">
          <div className="dash-title">
            <img src="https://www.clipartmax.com/png/middle/276-2763872_hospitality-hotel-icon.png" alt="Hotel" />
            <div>
              <h1>Smart Stays Hotel</h1>
              <p>Today at a glance</p>
            </div>
          </div>
          <div className="dash-actions">
            <button type="button" className="btn" onClick={() => navigate('/hotels')}>New Booking</button>
            <a href="#" className="btn">Add Guest</a>
          </div>
        </header>

        <section className="dash-stats">
          <Stat label="Occupied Rooms" value="42/60" trend="+3 vs yesterday" />
          <Stat label="Check-ins" value="18" trend="12 completed" />
          <Stat label="Check-outs" value="14" trend="5 pending" />
          <Stat label="Revenue (Today)" value="$4,820" trend="+8%" />
        </section>

        <section className="dash-grid">
          <div className="card">
            <h3>Recent Bookings</h3>
            <div className="table">
              <div className="t-head">
                <div>Guest</div><div>Room</div><div>Check-in</div><div>Status</div>
              </div>
              {bookings.map((b)=> (
                <div key={b._id} className="t-row">
                  <div>{b.guestName}</div>
                  <div>{b.roomNumber}</div>
                  <div>{new Date(b.checkIn).toLocaleDateString()}</div>
                  <div>
                    <span className="badge" style={{ textTransform: 'capitalize' }}>{b.status}</span>
                    <span style={{ marginLeft: 8 }}>
                      <a href="#" onClick={(e)=>{e.preventDefault(); editRow(b);}}>Edit</a>
                      {' '}|{' '}
                      <a href="#" onClick={(e)=>{e.preventDefault(); remove(b._id);}}>Delete</a>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Upcoming Arrivals</h3>
            <ul className="list">
              {[
                {g:"D. Jayasuriya", t:"Today 2:00 PM"},
                {g:"N. Sharma", t:"Today 3:30 PM"},
                {g:"L. Zhang", t:"Tomorrow 9:00 AM"},
              ].map((x,i)=> (
                <li key={i}><strong>{x.g}</strong><span>{x.t}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <h3>{editingId ? 'Edit Booking' : 'Add Booking'}</h3>
          <form onSubmit={save} className="auth-form">
            <div className="form-group">
              <input className="input" placeholder="Guest name" value={form.guestName} onChange={e=>setForm({...form, guestName:e.target.value})} required/>
            </div>
            <div className="form-group" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <input className="input" placeholder="Room number" value={form.roomNumber} onChange={e=>setForm({...form, roomNumber:e.target.value})} required/>
              <select className="input" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                <option value="confirmed">confirmed</option>
                <option value="checked-in">checked-in</option>
                <option value="checked-out">checked-out</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div className="form-group" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <input className="input" type="date" value={form.checkIn} onChange={e=>setForm({...form, checkIn:e.target.value})} required/>
              <input className="input" type="date" value={form.checkOut} onChange={e=>setForm({...form, checkOut:e.target.value})} required/>
            </div>
            <div className="form-group">
              <input className="input" placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/>
            </div>
            <div className="auth-actions">
              <button className="btn btn-primary" disabled={busy}>{editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
