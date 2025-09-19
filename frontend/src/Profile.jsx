function Profile() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem('authUser') || '{}'); } catch {}
  if (!user?.username) {
    try { const last = JSON.parse(localStorage.getItem('lastSignedUp') || '{}'); user.username = last.username; } catch {}
  }

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 style={{ margin: 0 }}>Your Profile</h1>
      <p className="auth-subtitle">View your account details.</p>
      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Account</h3>
          <p><strong>Username (email):</strong> {user?.username || '—'}</p>
          <p><strong>User ID:</strong> {user?._id || '—'}</p>
        </div>
        <div className="card">
          <h3>Preferences</h3>
          <p>Newsletter: —</p>
          <p>SMS Alerts: —</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
