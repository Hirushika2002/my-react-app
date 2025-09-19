import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SignIn() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/signin", formData);
            try { localStorage.setItem("authUser", JSON.stringify(res?.data?.user || {})); } catch {}
            navigate("/dashboard");
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div className="auth-page">
            <div className="container auth-layout">
                <aside className="auth-hero">
                    <h2 className="auth-hero-title">Welcome back</h2>
                    <p className="auth-hero-sub">Manage your bookings and pick up where you left off.</p>
                </aside>

                <section className="auth-card">
                    <h1 className="auth-title">Sign in</h1>
                    <p className="auth-subtitle">Enter your credentials</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <input
                                className="input"
                                type="text"
                                name="username"
                                placeholder="Email or username"
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="input"
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="auth-actions">
                            <button type="submit" className="btn btn-primary btn-wide">Sign In</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default SignIn;
