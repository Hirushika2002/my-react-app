import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Home() {
  const [lastReview, setLastReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastReview');
      if (raw) {
        const r = JSON.parse(raw);
        setLastReview(r);
        // remove after 8 seconds so it's only briefly visible
        const t = setTimeout(() => { try { localStorage.removeItem('lastReview'); } catch {} ; setLastReview(null); }, 8000);
        return () => clearTimeout(t);
      }
    } catch (e) {}
    // also load all reviews to show at bottom of home page
    try {
      const reviews = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('reviews:')) {
          try {
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(arr)) reviews.push(...arr);
          } catch (e) {}
        }
      }
      // sort by createdAt desc
      reviews.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllReviews(reviews);
    } catch (e) {}
  }, []);

  return (
    <>
      {lastReview && (
        <section className="container" style={{marginTop:12}}>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{flex:1}}>
                    <strong>New review posted</strong>
                    <div style={{marginTop:6}}><strong>{lastReview.name}</strong> — <span className="muted">{lastReview.title || ''}</span></div>
                  </div>
                  <div className="rating">{Array.from({length:(lastReview.overall||lastReview.rating||0)}).map((_,i)=>(<span key={i}>★</span>))}</div>
                </div>

                <div style={{marginTop:8,color:'var(--subtext)'}}>{lastReview.comment}</div>
                {lastReview.photos && lastReview.photos.length > 0 && (
                  <div className="home-review-photos" style={{marginTop:10}}>
                    {lastReview.photos.slice(0,4).map((p,idx) => (
                      <div className="home-thumb" key={idx}><img src={p} alt={`rev-${idx}`} /></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="hero">
        <div className="container hero-inner">
          <h1>Manage Bookings With Confidence</h1>
          <p>
            Streamline reservations, guests, rooms, and payments — all in one place.
          </p>
          <div className="cta-row">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/signin" className="btn btn-ghost">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why HotelEase?</h2>
          <div className="grid">
            <Feature title="Smart Reservations" desc="Fast booking creation with availability checks and overbooking alerts." />
            <Feature title="Guest Profiles" desc="Centralize guest history, preferences, and communication." />
            <Feature title="Room Management" desc="Track room types, rates, and maintenance status in real time." />
            <Feature title="Analytics" desc="Dashboards for occupancy, RevPAR, and revenue trends." />
          </div>
        </div>
      </section>

      <section className="section-cta">
        <div className="container">
          <p>Ready to modernize your hotel operations?</p>
          <Link to="/signup" className="btn btn-primary">Create an account</Link>
        </div>
      </section>

      {/* All reviews at bottom of home */}
      <section className="all-reviews" style={{padding:'28px 0'}}>
        <div className="container">
          <h2>Recent Reviews</h2>
          {allReviews.length === 0 ? (
            <p className="muted">No reviews yet — be the first to leave one.</p>
          ) : (
            <div className="grid reviews-grid" style={{marginTop:12}}>
              {allReviews.map((r, idx) => (
                <article key={r.id || idx} className="review-card card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <strong>{r.title || (r.comment?.slice(0,50) || 'Review')}</strong>
                          <div className="muted" style={{fontSize:13}}>{r.name} • {r.hotelName || ('Hotel ' + (r.hotelId || ''))}</div>
                        </div>
                        <div className="rating">{Array.from({length:(r.overall||r.rating||0)}).map((_,i)=>(<span key={i}>★</span>))}</div>
                      </div>
                      <div style={{marginTop:8,color:'var(--subtext)'}}>{r.comment}</div>
                    </div>
                    {r.photos && r.photos.length > 0 && (
                      <div style={{width:120,marginLeft:12}}>
                        <img src={r.photos[0]} alt="rev" style={{width:'100%',height:88,objectFit:'cover',borderRadius:8}} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default Home;
