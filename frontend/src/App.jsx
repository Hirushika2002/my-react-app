import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home.jsx';
import Dashboard from './Dashboard.jsx';
import SignIn from './signin.jsx';
import SignUp from './signup.jsx';
import About from './About.jsx';
import Settings from './Settings.jsx';
import Profile from './Profile.jsx';
import Hotels from './Hotels.jsx';
import Payment from './Payment.jsx';
import PayPalMock from './PayPalMock.jsx';
import MyBookings from './MyBookings.jsx';
import RoomCatalog from './RoomCatalog.jsx';
import RoomManager from './RoomManager.jsx';

function App() {
    const location = useLocation();
	const onHome = location.pathname === '/';
	const onDashboard = location.pathname.startsWith('/dashboard');
	const [authUser, setAuthUser] = useState(() => {
		if (typeof window === 'undefined') return null;
		try {
			return JSON.parse(localStorage.getItem('authUser') || 'null');
		} catch {
			return null;
		}
	});

    useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			const raw = localStorage.getItem('authUser');
			setAuthUser(raw ? JSON.parse(raw) : null);
		} catch {
			setAuthUser(null);
		}
    }, [location.key]);

    useEffect(() => {
		if (typeof window === 'undefined') return;
        const syncAuth = () => {
            try {
                const raw = localStorage.getItem('authUser');
                setAuthUser(raw ? JSON.parse(raw) : null);
            } catch {
                setAuthUser(null);
            }
        };
		window.addEventListener('storage', syncAuth);
		return () => window.removeEventListener('storage', syncAuth);
    }, []);

    const displayName = useMemo(() => {
        if (!authUser?.username) return '';
        const base = authUser.username.trim();
        if (!base) return '';
        return base.includes('@') ? base.split('@')[0] : base;
    }, [authUser]);

    const initials = useMemo(() => (displayName ? displayName[0].toUpperCase() : 'U'), [displayName]);

	return (
		<div>
			<div className="navbar">
				<div className="container navbar-inner">
					<div className="brand"><img src="https://www.clipartmax.com/png/middle/276-2763872_hospitality-hotel-icon.png" alt="Smart Stays logo" style={{height: 24, width: 24}} />Smart Stays Hotel</div>
					<nav className="navlinks">
						<Link to="/">Home</Link>
						<Link to="/dashboard">Dashboard</Link>
						<Link to="/rooms">Rooms</Link>
						<Link to="/about">About</Link>
						{authUser ? (
							<>
								<Link to="/profile">Profile</Link>
								<Link to="/settings">Settings</Link>
								<Link to="/admin/rooms">Manage Rooms</Link>
							</>
						) : null}
					</nav>
					<div className="nav-actions">
						{authUser ? (
							<Link to="/profile" className="nav-user">
								<span className="nav-avatar">{authUser?.avatar ? <img src={authUser.avatar} alt={`${displayName || authUser.username} avatar`} /> : <span className="nav-avatar-fallback">{initials}</span>}</span>
								<span className="nav-user-text">
									<span className="nav-user-name">{displayName || authUser.username}</span>
									<span className="nav-user-username">{authUser.username}</span>
								</span>
							</Link>
						) : (
							<div className="nav-auth">
								{!onHome && <Link to="/signin">Sign In</Link>}
								{!onHome && <Link to="/signup" className="btn btn-primary">Join Now</Link>}
							</div>
						)}
					</div>
				</div>
			</div>

			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/hotels" element={<Hotels />} />
				<Route path="/rooms" element={<RoomCatalog />} />
				<Route path="/mybookings" element={<MyBookings />} />
				<Route path="/payment" element={<Payment />} />
				<Route path="/paypal" element={<PayPalMock />} />
				<Route path="/about" element={<About />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/admin/rooms" element={<RoomManager />} />
				<Route path="*" element={<div>Not Found</div>} />
			</Routes>

			<div className="footer">
				<div className="container footer-inner">
					© {new Date().getFullYear()} Smart Stays. All rights reserved.
				</div>
			</div>
		</div>
	);
}

export default App;

