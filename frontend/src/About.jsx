function About() {
  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 style={{ margin: 0 }}>About Smart Stays Hotel</h1>
      <p className="auth-subtitle">A modern hotel booking management system to streamline operations.</p>
      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Our Mission</h3>
          <p>Deliver delightful guest experiences while simplifying reservations, room management, and reporting.</p>
        </div>
        <div className="card">
          <h3>What We Offer</h3>
          <p>Smart reservations, guest profiles, housekeeping status tracking, and clear analytics.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
