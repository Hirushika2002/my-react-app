import { useLocation, useNavigate } from 'react-router-dom';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const hotelId = location?.state?.hotelId;

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Payment</h1>
      <p className="muted">Choose how you'd like to pay for your booking.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
        <div className="card" style={{textAlign:'center'}}>
          <h3>Pay Online</h3>
          <p className="muted">Secure online payment via a fast checkout flow.</p>
          <div style={{marginTop:12}}>
            <button className="btn btn-primary" onClick={() => navigate('/paypal', { state: { hotelId } })}>Pay with PayPal</button>
          </div>
        </div>

        <div className="card" style={{textAlign:'center'}}>
          <h3>Pay at Hotel</h3>
          <p className="muted">Pay when you arrive — leave a quick review now.</p>
          <div style={{marginTop:12}}>
            {/* Navigate back to hotels and open review form for the hotel */}
            <button className="btn" onClick={() => navigate('/hotels', { state: { openReviewsFor: hotelId } })}>Pay at Hotel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
