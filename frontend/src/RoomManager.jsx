import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const defaultForm = {
  name: '',
  roomNumber: '',
  type: 'Deluxe',
  price: 0,
  status: 'available',
  amenities: '',
  description: '',
  capacity: 2,
  ownerNotes: ''
};

function RoomManager() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await axios.get('/api/rooms');
      setRooms(data);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Failed to load rooms');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const capacity = rooms.reduce((total, room) => total + (room.capacity || 0), 0);
    return {
      available: rooms.filter((room) => room.status === 'available').length,
      occupied: rooms.filter((room) => room.status === 'occupied').length,
      maintenance: rooms.filter((room) => room.status === 'maintenance').length,
      capacity
    };
  }, [rooms]);

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        capacity: Number(form.capacity) || 0,
        amenities: form.amenities
          ? form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
          : []
      };
      let response;
      if (editingId) {
        response = await axios.put(`/api/rooms/${editingId}`, payload);
      } else {
        response = await axios.post('/api/rooms', payload);
      }
      if (response.data) {
        await load();
        resetForm();
      }
    } catch (e) {
      console.error(e);
      setError('Failed to save room. Ensure the room number is unique.');
    } finally {
      setBusy(false);
    }
  };

  const editRoom = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name || '',
      roomNumber: room.roomNumber || '',
      type: room.type || 'Deluxe',
      price: room.price || 0,
      status: room.status || 'available',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      description: room.description || '',
      capacity: room.capacity || 0,
      ownerNotes: room.ownerNotes || ''
    });
  };

  const removeRoom = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNumber}?`)) return;
    setBusy(true);
    try {
      await axios.delete(`/api/rooms/${room._id}`);
      await load();
    } catch (e) {
      console.error(e);
      setError('Failed to delete room');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="room-manager">
      <div className="container">
        <header className="room-manager-header">
          <div>
            <h1>Room management</h1>
            <p>Keep inventory up to date so guests always see accurate availability.</p>
          </div>
        </header>

        <section className="room-stats">
          <div className="card stat-card">
            <span className="stat-label">Available</span>
            <span className="stat-value">{totals.available}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Occupied</span>
            <span className="stat-value">{totals.occupied}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">In maintenance</span>
            <span className="stat-value">{totals.maintenance}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Total capacity</span>
            <span className="stat-value">{totals.capacity}</span>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <div className="section-header">
            <div>
              <h2>{editingId ? 'Edit room' : 'Add a new room'}</h2>
              <p>Provide a clear description, nightly rate, and amenities list.</p>
            </div>
            {editingId ? <button type="button" className="link-button" onClick={resetForm}>Cancel edit</button> : null}
          </div>
          {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
          <form className="room-form" onSubmit={save}>
            <label>
              Room name
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <div className="room-form-grid">
              <label>
                Room number
                <input className="input" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
              </label>
              <label>
                Type
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Villa">Villa</option>
                  <option value="Standard">Standard</option>
                </select>
              </label>
            </div>
            <div className="room-form-grid">
              <label>
                Price per night (LKR)
                <input className="input" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </label>
              <label>
                Capacity (guests)
                <input className="input" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </label>
            </div>
            <div className="room-form-grid">
              <label>
                Status
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="available">available</option>
                  <option value="occupied">occupied</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </label>
              <label>
                Amenities (comma separated)
                <input className="input" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Wi-Fi, Pool, Breakfast" />
              </label>
            </div>
            <label>
              Description
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label>
              Internal notes
              <textarea className="input" rows={2} value={form.ownerNotes} onChange={(e) => setForm({ ...form, ownerNotes: e.target.value })} placeholder="Maintenance schedules, housekeeping notes" />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Add room'}</button>
            </div>
          </form>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <div className="section-header">
            <div>
              <h2>Room inventory</h2>
              <p>View all rooms and keep availability accurate.</p>
            </div>
          </div>
          <div className="table table-modern room-table">
            <div className="t-head">
              <span>Room</span>
              <span>Type</span>
              <span>Status</span>
              <span>Rate (LKR)</span>
              <span>Capacity</span>
              <span>Actions</span>
            </div>
            {rooms.map((room) => (
              <div key={room._id} className="t-row">
                <span className="cell-guest">
                  <strong>{room.name}</strong>
                  <small>#{room.roomNumber}</small>
                </span>
                <span>{room.type}</span>
                <span><span className={`badge badge-soft status-${room.status}`}>{room.status}</span></span>
                <span>{room.price?.toLocaleString?.() || room.price}</span>
                <span>{room.capacity}</span>
                <span className="cell-actions">
                  <button type="button" className="link-button" onClick={() => editRoom(room)}>Edit</button>
                  <button type="button" className="link-button danger" onClick={() => removeRoom(room)}>Delete</button>
                </span>
              </div>
            ))}
            {rooms.length === 0 ? <div className="t-row"><span>No rooms added yet.</span></div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RoomManager;
