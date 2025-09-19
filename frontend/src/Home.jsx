import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
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
