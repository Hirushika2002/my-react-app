import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';

function Home() {
  const navigate = useNavigate();
  const [lastReview, setLastReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [searchForm, setSearchForm] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
  });
  const [travelerName, setTravelerName] = useState('Traveler');

  const trendingDestinations = useMemo(() => ([
    {
      name: 'Kandy',
      sub: '1,258 properties',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Nuwara Eliya',
      sub: '864 properties',
      image: 'https://images.unsplash.com/photo-1582719478402-771262dd2aa5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Colombo',
      sub: '678 properties',
      image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Ella',
      sub: '959 properties',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Negombo',
      sub: '868 properties',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    }
  ]), []);

  const stayTypes = useMemo(() => ([
    {
      name: 'Hotels',
      caption: 'Comfort meets convenience',
      image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Apartments',
      caption: 'Space for the whole crew',
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Resorts',
      caption: 'All-inclusive indulgence',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Villas',
      caption: 'Private escapes with style',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80'
    }
  ]), []);

  const featuredHotels = useMemo(() => ([
    {
      name: 'Cinnamon Grand',
      city: 'Colombo',
      image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21078?auto=format&fit=crop&w=1200&q=80',
      price: 'LKR 28,900',
      rating: '8.9',
      perks: 'Breakfast included · Pool & Spa'
    },
    {
      name: '98 Acres Resort & Spa',
      city: 'Ella',
      image: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=1200&q=80',
      price: 'LKR 24,500',
      rating: '9.4',
      perks: 'Mountain view · Wellness retreats'
    },
    {
      name: 'Heritance Kandalama',
      city: 'Dambulla',
      image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
      price: 'LKR 31,200',
      rating: '9.1',
      perks: 'Jungle escape · Infinity pool'
    },
    {
      name: 'The Grand Hotel',
      city: 'Nuwara Eliya',
      image: 'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?auto=format&fit=crop&w=1200&q=80',
      price: 'LKR 19,750',
      rating: '8.7',
      perks: 'Colonial charm · High-tea experience'
    }
  ]), []);

  const bookingBenefits = useMemo(() => ([
    {
      title: 'Genius-style member rewards',
      desc: 'Collect nights, unlock instant savings, and enjoy complimentary upgrades.'
    },
    {
      title: 'Flexible cancellation',
      desc: 'Filter for free cancellation stays and change plans without the stress.'
    },
    {
      title: '24/7 support',
      desc: 'Message the property or chat with Smart Stays specialists any time you need help.'
    }
  ]), []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchForm.destination) {
      alert('Please enter a destination to start your search.');
      return;
    }
    try {
      localStorage.setItem('lastSearch', JSON.stringify(searchForm));
    } catch {}
    navigate('/hotels');
  };

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let name = 'Traveler';
    try {
      const raw = localStorage.getItem('authUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) {
          const base = parsed.username.split('@')[0];
          if (base) name = base.charAt(0).toUpperCase() + base.slice(1);
        }
      } else {
        const fallbackRaw = localStorage.getItem('lastSignedUp');
        if (fallbackRaw) {
          const fallback = JSON.parse(fallbackRaw);
          if (fallback?.username) {
            const base = fallback.username.split('@')[0];
            if (base) name = base.charAt(0).toUpperCase() + base.slice(1);
          }
        }
      }
    } catch {}
    setTravelerName(name);
  }, []);

  const featuredReviews = allReviews.slice(0, 6);

  return (
    <>
      {lastReview && (
        <section className="container review-toast">
          <div className="review-toast-card">
            <div className="review-toast-header">
              <div>
                <span className="review-toast-badge">Fresh feedback</span>
                <div className="review-toast-title">
                  <strong>{lastReview.name}</strong>
                  <span className="muted">{lastReview.title || 'Shared a new story'}</span>
                </div>
              </div>
              <div className="rating">
                {Array.from({ length: (lastReview.overall || lastReview.rating || 0) }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
            <p className="review-toast-body">{lastReview.comment}</p>
            {lastReview.photos && lastReview.photos.length > 0 && (
              <div className="home-review-photos">
                {lastReview.photos.slice(0, 4).map((p, idx) => (
                  <div className="home-thumb" key={idx}><img src={p} alt={`review-${idx}`} /></div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="hero hero-booking">
        <div className="hero-booking-overlay" />
        <div className="container hero-booking-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">Smart Stays member offers</p>
            <h1>Where to next, {travelerName}?</h1>
            <p>Find exclusive rewards on every stay across Sri Lanka and beyond. Save with flexible rates, instant confirmation, and member-only perks.</p>
            <form className="search-bar" onSubmit={handleSearch}>
              <label className="search-field">
                <span>Destination</span>
                <input
                  type="text"
                  placeholder="Try Colombo, Kandy, Galle..."
                  value={searchForm.destination}
                  onChange={(e) => setSearchForm((prev) => ({ ...prev, destination: e.target.value }))}
                />
              </label>
              <label className="search-field">
                <span>Check-in</span>
                <input
                  type="date"
                  value={searchForm.checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                />
              </label>
              <label className="search-field">
                <span>Check-out</span>
                <input
                  type="date"
                  value={searchForm.checkOut}
                  min={searchForm.checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                />
              </label>
              <label className="search-field">
                <span>Guests</span>
                <input
                  type="number"
                  min={1}
                  value={searchForm.guests}
                  onChange={(e) => setSearchForm((prev) => ({ ...prev, guests: Number(e.target.value) }))}
                />
              </label>
              <button type="submit" className="search-button">Search</button>
            </form>
            <div className="search-actions">
              <label className="search-toggle">
                <input type="checkbox" /> I'm looking for an entire home or apartment
              </label>
              <Link to="/signin">Sign in to see Genius-style deals</Link>
            </div>
          </div>
          <div className="hero-sidecard">
            <div className="deal-card">
              <span className="deal-badge">Late escape deal</span>
              <h3>Save at least 15% on stays in November</h3>
              <p>Secure your holiday with flexible cancellation and pay when you stay at most properties.</p>
              <Link to="/hotels" className="btn btn-primary">Find deals</Link>
            </div>
            <div className="deal-card secondary">
              <h4>Need airport pickup?</h4>
              <p>Book rides from Colombo International directly through Smart Stays partners.</p>
              <Link to="/settings">Plan airport taxis →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="trending-section">
        <div className="container">
          <div className="section-head">
            <h2>Trending destinations</h2>
            <p>Most popular choices for travelers exploring Sri Lanka right now.</p>
          </div>
          <div className="trending-grid">
            {trendingDestinations.map((item) => (
              <article key={item.name} className="trending-card" style={{ backgroundImage: `url(${item.image})` }}>
                <div className="trending-overlay">
                  <h3>{item.name} <span role="img" aria-label="flag">🇱🇰</span></h3>
                  <p>{item.sub}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-hotels-section">
        <div className="container">
          <div className="section-head">
            <h2>Featured stays handpicked for you</h2>
            <p>Take your pick from Sri Lanka&apos;s most loved hotels with real-time availability.</p>
          </div>
          <div className="featured-hotels-grid">
            {featuredHotels.map((hotel) => (
              <article key={hotel.name} className="hotel-highlight-card">
                <div className="hotel-highlight-media" style={{ backgroundImage: `url(${hotel.image})` }} />
                <div className="hotel-highlight-body">
                  <div className="hotel-highlight-top">
                    <h3>{hotel.name}</h3>
                    <span className="rating-chip">{hotel.rating}</span>
                  </div>
                  <p className="hotel-highlight-city">{hotel.city}</p>
                  <p className="hotel-highlight-perks">{hotel.perks}</p>
                  <div className="hotel-highlight-foot">
                    <span className="hotel-highlight-price">{hotel.price} <span>per night</span></span>
                    <Link to="/hotels" className="btn btn-light">View</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="property-type-section">
        <div className="container">
          <div className="section-head">
            <h2>Browse by property type</h2>
            <p>Whatever your travel style, Smart Stays has a stay to match.</p>
          </div>
          <div className="property-type-grid">
            {stayTypes.map((type) => (
              <article key={type.name} className="property-type-card">
                <div className="property-type-media" style={{ backgroundImage: `url(${type.image})` }} />
                <div className="property-type-body">
                  <h3>{type.name}</h3>
                  <p>{type.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="container">
          <div className="section-head">
            <h2>Why book with Smart Stays</h2>
            <p>Member rewards, flexible options, and 24/7 support at every step.</p>
          </div>
          <div className="benefits-grid">
            {bookingBenefits.map((benefit) => (
              <div key={benefit.title} className="benefit-card">
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="all-reviews">
        <div className="container">
          <div className="section-head">
            <h2>Recent stories from guests</h2>
            <p>Collect rich, visual reviews and surface them across your digital touchpoints instantly.</p>
          </div>
          {featuredReviews.length === 0 ? (
            <p className="muted">No reviews yet — be the first to leave one.</p>
          ) : (
            <div className="grid reviews-grid">
              {featuredReviews.map((r, idx) => (
                <article key={r.id || idx} className="review-card card">
                  <div className="review-card-head">
                    <div>
                      <strong>{r.title || (r.comment?.slice(0, 50) || 'Review')}</strong>
                      <div className="muted">{r.name} • {r.hotelName || (`Hotel ${r.hotelId || ''}`)}</div>
                    </div>
                    <div className="rating">
                      {Array.from({ length: (r.overall || r.rating || 0) }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="review-card-body">{r.comment}</p>
                  {r.photos && r.photos.length > 0 && (
                    <div className="review-card-media">
                      <img src={r.photos[0]} alt="Guest experience" />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
