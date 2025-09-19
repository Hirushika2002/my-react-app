import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home.jsx';
import Dashboard from './Dashboard.jsx';
import SignIn from './signin.jsx';
import SignUp from './signup.jsx';
import About from './About.jsx';
import Settings from './Settings.jsx';
import Profile from './Profile.jsx';
import Hotels from './Hotels.jsx';

function App() {
    const location = useLocation();
	const onHome = location.pathname === '/';
	const onDashboard = location.pathname.startsWith('/dashboard');
	return (
		<div>
			<div className="navbar">
				<div className="container navbar-inner">
					<div className="brand"><img src="https://www.clipartmax.com/png/middle/276-2763872_hospitality-hotel-icon.png" alt="Smart Stays logo" style={{height: 24, width: 24}} />Smart Stays Hotel</div>
					<nav className="navlinks">
						<Link to="/">Home</Link>
						<Link to="/dashboard">Dashboard</Link>
						<Link to="/about">About</Link>
						{onDashboard ? (
							<>
								<Link to="/profile">Profile</Link>
								<Link to="/settings">Settings</Link>
							</>
						) : (
							<>
								{!onHome && <Link to="/signin">Sign In</Link>}
								{!onHome && <Link to="/signup">Sign Up</Link>}
							</>
						)}
					</nav>
				</div>
			</div>

			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/hotels" element={<Hotels />} />
				<Route path="/about" element={<About />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="*" element={<div>Not Found</div>} />
			</Routes>

			<div className="footer">
				<div className="container footer-inner">
					© {new Date().getFullYear()} HotelEase. All rights reserved.
				</div>
			</div>
		</div>
	);
}

export default App;

