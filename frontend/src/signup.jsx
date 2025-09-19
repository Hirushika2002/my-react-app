import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    countryCode: "+1",
    phone: "",
    country: "",
    newsletter: false,
    smsOptIn: false,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "", percent: 0, color: "#e2e8f0" });

  const quotes = useMemo(
    () => [
      "Best rates with no hidden fees — guaranteed.",
      "Flexible bookings with free cancellations on select rooms.",
      "24/7 support — we’re here for your next stay.",
    ],
    []
  );

  const computeStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    const labels = ["", "Weak", "Medium", "Strong"];
    const colors = ["#e2e8f0", "#ef4444", "#f59e0b", "#10b981"];
    return { score, label: labels[score], percent: (score / 3) * 100, color: colors[score] };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (name === "password") setStrength(computeStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  const nextErrors = { email: "", password: "", confirmPassword: "", terms: "" };
    if (!formData.email) nextErrors.email = "Email is required";
    if (!formData.password) nextErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
  if (!formData.acceptTerms) nextErrors.terms = "Please accept Terms and Privacy";
    setErrors(nextErrors);
  if (nextErrors.email || nextErrors.password || nextErrors.confirmPassword || nextErrors.terms) return;

    try {
      setLoading(true);
      // Backend expects `username`; map from email.
  const res = await axios.post("/api/signup", { username: formData.email, password: formData.password });
  try { localStorage.setItem("lastSignedUp", JSON.stringify({ username: formData.email })); } catch {}
  navigate("/signin");
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        alert("Account already exists. Please sign in.");
        navigate("/signin");
        return;
      }
      const msg = error?.response?.data?.message || error.message || "Signup failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-layout">
        <aside className="auth-hero">
          <h2 className="auth-hero-title">Plan Your Perfect Stay</h2>
          <p className="auth-hero-sub">Book smarter, manage reservations, and enjoy exclusive rates.</p>
          <ul className="quote-list">
            {quotes.slice(0, 3).map((q, i) => (
              <li key={i} className="quote">{q}</li>
            ))}
          </ul>
        </aside>

        <section className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">It takes less than a minute.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name row */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div className="form-group">
                <input
                  className="input"
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <input
                  className="input"
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <input
                className="input"
                type="email"
                name="email"
                placeholder="Email address"
                required
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email ? <small style={{ color: "#dc2626" }}>{errors.email}</small> : null}
            </div>
            {/* Phone row */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "120px 1fr" }}>
              <div className="form-group">
                <select
                  className="input"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  aria-label="Country code"
                >
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+94">+94 (LK)</option>
                  <option value="+91">+91 (IN)</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  className="input"
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Country */}
            <div className="form-group">
              <select
                className="input"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Country/Region</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="India">India</option>
              </select>
            </div>
            <div className="form-group">
              <input
                className="input"
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
              />
              {/* Strength meter */}
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden", marginTop: 6 }}>
                <div style={{ width: `${strength.percent}%`, height: "100%", background: strength.color, transition: "width .2s ease" }} />
              </div>
              <small style={{ color: "#64748b" }}>
                {strength.label ? `Password strength: ${strength.label}` : "Use at least 8 characters, a number, and a capital letter."}
              </small>
            </div>
            <div className="form-group">
              <input
                className="input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword ? <small style={{ color: "#dc2626" }}>{errors.confirmPassword}</small> : null}
            </div>
            {/* Marketing opt-ins */}
            <div className="form-group" style={{ gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} />
                Subscribe to our newsletter for exclusive deals and offers.
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="smsOptIn" checked={formData.smsOptIn} onChange={handleChange} />
                Send me SMS alerts about my booking status.
              </label>
            </div>
            {/* Legal */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
                <span>
                  By creating an account, you agree to our <a href="#" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="#" target="_blank" rel="noreferrer">Privacy Policy</a>.
                </span>
              </label>
              {errors.terms ? <small style={{ color: "#dc2626" }}>{errors.terms}</small> : null}
            </div>
            <div className="auth-actions">
              <button disabled={loading} type="submit" className="btn btn-primary btn-wide">
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>
            <div className="auth-subtitle" style={{ marginTop: 8 }}>
              Already have an account? <a href="/signin">Sign in</a>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SignUp;