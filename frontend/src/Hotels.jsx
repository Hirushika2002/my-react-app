import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const seedHotels = [
  { id: 1, name: 'Smart Stays City Center', city: 'Colombo', country: 'Sri Lanka', rating: 4.6, price: 129, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, name: 'Oceanview Retreat', city: 'Galle', country: 'Sri Lanka', rating: 4.8, price: 179, img: 'https://images.unsplash.com/photo-1541976076758-347942db1970?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, name: 'Hilltop Boutique', city: 'Kandy', country: 'Sri Lanka', rating: 4.5, price: 145, img: 'https://images.unsplash.com/photo-1501117716987-c8e0bdde6651?q=80&w=1200&auto=format&fit=crop' },
  { id: 4, name: 'Lakeside Pavilion', city: 'Nuwara Eliya', country: 'Sri Lanka', rating: 4.7, price: 165, img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop' },
  { id: 5, name: 'Harbor Lights Inn', city: 'Trincomalee', country: 'Sri Lanka', rating: 4.4, price: 119, img: 'https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1200&auto=format&fit=crop' },
  { id: 6, name: 'Palm Grove Suites', city: 'Negombo', country: 'Sri Lanka', rating: 4.3, price: 109, img: 'https://images.unsplash.com/photo-1515419682769-91a8a6bdaf22?q=80&w=1200&auto=format&fit=crop' },
];

function Hotels() {
  const [query, setQuery] = useState('');
  const [minStars, setMinStars] = useState('0');
  const [sort, setSort] = useState('price-asc');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  const list = useMemo(() => {
    let items = seedHotels.filter(h =>
      (h.name + ' ' + h.city + ' ' + h.country).toLowerCase().includes(query.toLowerCase()) &&
      h.rating >= Number(minStars)
    );
    if (sort === 'price-asc') items = items.sort((a,b)=>a.price-b.price);
    if (sort === 'price-desc') items = items.sort((a,b)=>b.price-a.price);
    if (sort === 'rating-desc') items = items.sort((a,b)=>b.rating-a.rating);
    return items;
  }, [query, minStars, sort]);

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
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const chooseHotel = (h) => {
    setSelectedHotel(h);
    // Prefill notes with the hotel name; schema lacks explicit hotel field
    setForm((f) => ({ ...f, notes: `Hotel: ${h.name}${f.notes ? ' — ' + f.notes : ''}` }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hotels">
      <div className="container">
        <div className="hotels-header">
          <div>
            <h1>Select a Hotel</h1>
            <p>Browse available properties to start a new booking.</p>
          </div>
        </div>

        <div className="hotels-filters">
          <input className="input plain" placeholder="Search by name or city" value={query} onChange={e=>setQuery(e.target.value)} />
          <select className="input plain" value={minStars} onChange={e=>setMinStars(e.target.value)}>
            <option value="0">All ratings</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
          <select className="input plain" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
          </select>
        </div>

        <div className="hotels-grid">
          {list.map(h => (
            <article key={h.id} className="hotel-card">
              <div className="hotel-img" style={{ backgroundImage: `url(${h.img})` }} />
              <div className="hotel-body">
                <div className="hotel-head">
                  <h3>{h.name}</h3>
                  <span className="rating">★ {h.rating.toFixed(1)}</span>
                </div>
                <p className="muted">{h.city}, {h.country}</p>
                <div className="hotel-tags">
                  <span className="pill">Free Wi‑Fi</span>
                  <span className="pill">Breakfast</span>
                  <span className="pill">Pool</span>
                </div>
                <div className="hotel-foot">
                  <div className="price"><span>From</span> <strong>${h.price}</strong> <span>/night</span></div>
                  <button className="btn btn-primary" type="button" onClick={() => chooseHotel(h)}>Book Now</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section ref={formRef} className="card" style={{ marginTop: 16 }}>
          <h3>{editingId ? 'Edit Booking' : 'Add Booking'} {selectedHotel ? `— ${selectedHotel.name}` : ''}</h3>
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

        <section className="card" style={{ marginTop: 16 }}>
          <h3>Bookings</h3>
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
        </section>
      </div>
    </div>
  );
}

export default Hotels;
