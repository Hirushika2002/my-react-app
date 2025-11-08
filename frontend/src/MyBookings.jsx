import { useEffect, useState } from 'react';
import axios from 'axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      let user = {};
      try { user = JSON.parse(localStorage.getItem('authUser') || '{}'); } catch {}
      const userId = user?._id;
      const url = userId ? `/api/bookings?userId=${userId}` : '/api/bookings';
      const { data } = await axios.get(url);
      setBookings(data || []);
    } catch (e) {
      console.error(e);
      setBookings([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await axios.delete(`/api/bookings/${id}`);
      await load();
    } catch (e) {
      console.error(e);
      alert('Cancel failed');
    }
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
      <p style="margin-top:24px;">Thank you for booking with HotelEase.</p>
      <script>window.print();</script>
      </body></html>
    `;
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="container mybookings" style={{padding:'24px 0'}}>
      <h1>My Bookings</h1>
      {loading ? <p className="muted">Loading…</p> : (
        bookings.length === 0 ? <p className="muted">You have no bookings yet.</p> : (
          <div style={{display:'grid',gap:12}}>
            {bookings.map(b => (
              <div key={b._id} className="booking-card card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <strong>{b.guestName}</strong>
                        <div className="muted">{b.notes || ''}</div>
                      </div>
                      <div>
                        <div className="badge">{b.status}</div>
                      </div>
                    </div>
                    <div style={{marginTop:8,color:'var(--subtext)'}}>
                      <div><strong>Room:</strong> {b.roomNumber}</div>
                      <div><strong>Check-in:</strong> {new Date(b.checkIn).toLocaleString()}</div>
                      <div><strong>Check-out:</strong> {new Date(b.checkOut).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginLeft:12}}>
                    <button className="btn" onClick={()=>downloadReceipt(b)}>Download receipt</button>
                    <button className="btn" onClick={()=>cancel(b._id)}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default MyBookings;
