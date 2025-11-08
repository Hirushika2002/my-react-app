import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function PayPalMock() {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const hotelId = location?.state?.hotelId;

  const doPay = () => {
    setProcessing(true);
    setTimeout(() => {
      // emulate successful payment
      try { localStorage.setItem('lastPaymentSuccess', JSON.stringify({ hotelId, at: new Date().toISOString() })); } catch {}
      navigate('/', { replace: true });
    }, 1400);
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div className="card" style={{textAlign:'center'}}>
        <h2>PayPal — Checkout</h2>
        <p className="muted">This is a sandboxed mock of the PayPal flow for demo purposes.</p>
        <div style={{marginTop:16}}>
          <button className="btn btn-primary" onClick={doPay} disabled={processing}>{processing ? 'Processing...' : 'Pay Now'}</button>
        </div>
      </div>
    </div>
  );
}

export default PayPalMock;
