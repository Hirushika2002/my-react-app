import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ReviewForm from './ReviewForm.jsx';
import AvailabilityCalendar from './AvailabilityCalendar.jsx';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [reviewsHotel, setReviewsHotel] = useState(null);
  const [reviews, setReviews] = useState([]);

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

  useEffect(() => { load();
    // if navigated here with state to open reviews for a hotel
    try {
      const target = location?.state?.openReviewsFor;
      if (target) {
        const h = seedHotels.find(x => Number(x.id) === Number(target));
        if (h) openReviews(h);
        // clear the navigation state so repeated visits don't auto-open
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (e) {}
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, checkIn: new Date(form.checkIn), checkOut: new Date(form.checkOut) };
      // attach logged-in user id when present
      try {
        const user = JSON.parse(localStorage.getItem('authUser') || '{}');
        if (user?._id) payload.userId = user._id;
      } catch (e) {}
      let res;
      if (editingId) {
        res = await axios.put(`/api/bookings/${editingId}`, payload);
      } else {
        // include hotelId when creating a booking
        if (selectedHotel?.id) payload.hotelId = selectedHotel.id;
        res = await axios.post('/api/bookings', payload);
      }
      setForm({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', status: 'confirmed', notes: '' });
      setEditingId(null);
      await load();
      // After creating a booking (not editing), go to payment choices
      if (!editingId) {
        navigate('/payment', { state: { hotelId: selectedHotel?.id } });
      }
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

  const openReviews = (h) => {
    setReviewsHotel(h);
    try {
      const raw = localStorage.getItem(`reviews:${h.id}`) || '[]';
      const list = JSON.parse(raw);
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load reviews', e);
      setReviews([]);
    }
    // scroll to reviews section if exists
    setTimeout(()=>{
      document.getElementById('reviews-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeReviews = () => { setReviewsHotel(null); setReviews([]); };

  const addReview = async (r) => {
    try {
      // enrich with hotel name when available
      const hotel = seedHotels.find(h => Number(h.id) === Number(r.hotelId));
      const reviewToSave = { ...r, hotelName: hotel?.name || '' };
      const key = `reviews:${r.hotelId}`;
      const raw = localStorage.getItem(key) || '[]';
      const list = JSON.parse(raw);
      const next = Array.isArray(list) ? [...list, reviewToSave] : [reviewToSave];
      localStorage.setItem(key, JSON.stringify(next));
      // store last review so Home can show it briefly
      try { localStorage.setItem('lastReview', JSON.stringify(reviewToSave)); } catch {}
      if (reviewsHotel && Number(reviewsHotel.id) === Number(r.hotelId)) {
        setReviews(next);
      }
    } catch (e) {
      console.error('Failed to save review', e);
      throw e;
    }
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
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <button className="btn" type="button" onClick={() => openReviews(h)} style={{border:'1px solid var(--border)'}}>Reviews</button>
                    <button className="btn btn-primary" type="button" onClick={() => chooseHotel(h)}>Book Now</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section ref={formRef} className="card" style={{ marginTop: 16 }}>
          <h3>{editingId ? 'Edit Booking' : 'Add Booking'} {selectedHotel ? `— ${selectedHotel.name}` : ''}</h3>
          {selectedHotel && (
            <AvailabilityCalendar hotelId={selectedHotel.id} />
          )}
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
        {reviewsHotel && (
          <section id="reviews-panel" className="card" style={{ marginTop: 16 }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3>Reviews — {reviewsHotel.name}</h3>
              <button className="btn" onClick={closeReviews}>Close</button>
            </div>

            {reviews.length === 0 ? (
              <p className="muted">No reviews yet. Be the first to review this hotel.</p>
            ) : (
              <div className="review-list">
                {reviews.slice().reverse().map(r => (
                  <div key={r.id} className="review">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div><strong>{r.name}</strong> <span className="muted">• {new Date(r.createdAt).toLocaleDateString()}</span></div>
                      <div className="rating">{Array.from({length: r.rating}).map((_,i)=>(<span key={i}>★</span>))}</div>
                    </div>
                    <div className="review-body">{r.comment}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{marginTop:12}}>
              <h4 style={{margin:0}}>Leave a review</h4>
              <ReviewForm hotelId={reviewsHotel.id} onAdd={addReview} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Hotels;
