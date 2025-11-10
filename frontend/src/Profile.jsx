import { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem('authUser') || '{}'); } catch {}
  if (!stored?.username) {
    try { const last = JSON.parse(localStorage.getItem('lastSignedUp') || '{}'); stored.username = last.username; } catch {}
  }

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const userId = stored?._id;
      const url = userId ? `/api/bookings?userId=${userId}` : '/api/bookings';
      const { data } = await axios.get(url);
      setBookings(data || []);
    } catch (e) {
      console.error(e);
      setBookings([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const upcoming = bookings.filter(b => new Date(b.checkOut) >= new Date()).sort((a,b)=> new Date(a.checkIn)-new Date(b.checkIn));
  const past = bookings.filter(b => new Date(b.checkOut) < new Date()).sort((a,b)=> new Date(b.checkOut)-new Date(a.checkOut));

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await axios.delete(`/api/bookings/${id}`); await load(); } catch (e) { console.error(e); alert('Cancel failed'); }
  };

  const downloadReceipt = (b) => {
    const win = window.open('', '_blank');
    if (!win) return alert('Popup blocked.');
    const html = `
      <html><head><title>Receipt</title></head><body>
      <h1>Booking Receipt</h1>
      <p><strong>Guest:</strong> ${b.guestName}</p>
      <p><strong>Hotel:</strong> ${b.notes || '—'}</p>
      <p><strong>Room:</strong> ${b.roomNumber}</p>
      <p><strong>Check-in:</strong> ${new Date(b.checkIn).toLocaleString()}</p>
      <p><strong>Check-out:</strong> ${new Date(b.checkOut).toLocaleString()}</p>
      <p><strong>Status:</strong> ${b.status}</p>
  <p style="margin-top:24px;">Thank you for booking with Smart Stays.</p>
      <script>window.print();</script>
      </body></html>
    `;
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 style={{ margin: 0 }}>Your Profile</h1>
      <p className="auth-subtitle">Manage your account and bookings.</p>

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Account</h3>
          <p><strong>Username (email):</strong> {stored?.username || '—'}</p>
          <p><strong>User ID:</strong> {stored?._id || '—'}</p>
        </div>
        <div className="card">
          <h3>Summary</h3>
          <p><strong>Total bookings:</strong> {bookings.length}</p>
          <p><strong>Upcoming:</strong> {upcoming.length}</p>
          <p><strong>Past:</strong> {past.length}</p>
        </div>
      </div>

      <section style={{marginTop:20}}>
        <h2>Upcoming bookings</h2>
        {loading ? <p className="muted">Loading…</p> : (
          upcoming.length === 0 ? <p className="muted">No upcoming bookings.</p> : (
            <div style={{display:'grid',gap:12}}>
              {upcoming.map(b => (
                <div key={b._id} className="booking-card card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <strong>{b.guestName}</strong>
                      <div className="muted">{b.notes || ''}</div>
                      <div style={{marginTop:8}}><strong>Room:</strong> {b.roomNumber}</div>
                      <div><strong>Check-in:</strong> {new Date(b.checkIn).toLocaleString()}</div>
                      <div><strong>Check-out:</strong> {new Date(b.checkOut).toLocaleString()}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,marginLeft:12}}>
                      <button className="btn" onClick={()=>downloadReceipt(b)}>Receipt</button>
                      <button className="btn" onClick={()=>cancel(b._id)}>Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </section>

      <section style={{marginTop:20}}>
        <h2>Previous bookings</h2>
        {loading ? <p className="muted">Loading…</p> : (
          past.length === 0 ? <p className="muted">No previous bookings.</p> : (
            <div style={{display:'grid',gap:12}}>
              {past.map(b => (
                <div key={b._id} className="booking-card card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <strong>{b.guestName}</strong>
                      <div className="muted">{b.notes || ''}</div>
                      <div style={{marginTop:8}}><strong>Room:</strong> {b.roomNumber}</div>
                      <div><strong>Check-in:</strong> {new Date(b.checkIn).toLocaleString()}</div>
                      <div><strong>Check-out:</strong> {new Date(b.checkOut).toLocaleString()}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,marginLeft:12}}>
                      <button className="btn" onClick={()=>downloadReceipt(b)}>Receipt</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}

export default Profile;
