
import { useEffect, useState, useRef } from 'react';

function Stars({ value, onChange, size = 20 }) {
  const arr = [1,2,3,4,5];
  return (
    <div style={{display:'inline-flex',gap:6}}>
      {arr.map((n) => (
        <button key={n} type="button" className={"star-btn" + (n <= value ? ' active' : '')} onClick={() => onChange(n)} aria-label={`Rate ${n}`} style={{fontSize:size}}>
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ hotelId, onAdd, initial = {} }) {
  const [name, setName] = useState(initial.name || '');
  const [roomNumber, setRoomNumber] = useState(initial.roomNumber || '');
  const [dateOfStay, setDateOfStay] = useState(initial.dateOfStay || '');
  const [overall, setOverall] = useState(initial.overall || 5);
  const [cleanliness, setCleanliness] = useState(initial.cleanliness || 5);
  const [service, setService] = useState(initial.service || 5);
  const [comfort, setComfort] = useState(initial.comfort || 5);
  const [food, setFood] = useState(initial.food || 0);
  const [valueForMoney, setValueForMoney] = useState(initial.valueForMoney || 5);
  const [title, setTitle] = useState(initial.title || '');
  const [comment, setComment] = useState(initial.comment || '');
  const [recommend, setRecommend] = useState(initial.recommend ?? true);
  const [photos, setPhotos] = useState(initial.photos || []); // data URLs
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    // cap photos to 8
    if (photos.length > 8) setPhotos(photos.slice(0,8));
  }, [photos]);

  const handleFiles = (files) => {
    const farr = Array.from(files || []);
    const allowed = farr.slice(0, Math.max(0, 8 - photos.length));
    allowed.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i) => setPhotos(p => p.filter((_,idx)=>idx!==i));

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert('Please share your experience in the text area.');
    if (overall < 1 || overall > 5) return alert('Overall rating required');
    setBusy(true);
    try {
      const review = {
        id: `${hotelId || 'hotel'}-${Date.now()}`,
        hotelId,
        name: name.trim() || 'Anonymous',
        roomNumber: roomNumber.trim() || '',
        dateOfStay: dateOfStay || null,
        overall: Number(overall),
        cleanliness: Number(cleanliness),
        service: Number(service),
        comfort: Number(comfort),
        food: Number(food),
        valueForMoney: Number(valueForMoney),
        title: title.trim(),
        comment: comment.trim(),
        recommend: !!recommend,
        photos,
        createdAt: new Date().toISOString(),
      };
      await onAdd(review);
      // reset lighter fields
      setTitle(''); setComment(''); setPhotos([]); setOverall(5);
      try { if (fileRef.current) fileRef.current.value = null; } catch {}
    } catch (err) {
      console.error(err);
      alert('Failed to save review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <h4 style={{marginTop:12}}>1. Guest information</h4>
      <div className="form-group">
        <input className="input" placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <input className="input" placeholder="Room number (optional)" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} />
        <input className="input" type="date" value={dateOfStay} onChange={e=>setDateOfStay(e.target.value)} />
      </div>

      <h4 style={{marginTop:12}}>2. Overall experience</h4>
      <div className="form-group">
        <Stars value={overall} onChange={(v)=>setOverall(v)} size={22} />
      </div>

      <h4 style={{marginTop:12}}>3. Specific ratings</h4>
      <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <label>Cleanliness <Stars value={cleanliness} onChange={v=>setCleanliness(v)} size={18} /></label>
        <label>Staff/Service <Stars value={service} onChange={v=>setService(v)} size={18} /></label>
        <label>Comfort <Stars value={comfort} onChange={v=>setComfort(v)} size={18} /></label>
        <label>Food Quality (optional) <Stars value={food} onChange={v=>setFood(v)} size={18} /></label>
        <label style={{gridColumn:'span 2'}}>Value for Money <Stars value={valueForMoney} onChange={v=>setValueForMoney(v)} size={18} /></label>
      </div>

      <h4 style={{marginTop:12}}>4. Review content</h4>
      <div className="form-group">
        <input className="input" placeholder="Review title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <textarea className="input" placeholder="Share your experience" rows={5} value={comment} onChange={e=>setComment(e.target.value)} required />
      </div>

      <h4 style={{marginTop:12}}>5. Photo upload</h4>
      <div className="form-group">
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={e=>handleFiles(e.target.files)} />
        <div className="photo-tip muted" style={{marginTop:6,fontSize:13}}>Room, food, view, or facilities pictures help others! (up to 8)</div>
        <div className="photo-grid">
          {photos.map((p,idx)=> (
            <div className="thumb" key={idx}>
              <img src={p} alt={`upload-${idx}`} />
              <button type="button" className="btn" onClick={()=>removePhoto(idx)} style={{position:'absolute',right:6,top:6,padding:'4px 8px'}}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <h4 style={{marginTop:12}}>6. Would you recommend?</h4>
      <div className="form-group" style={{display:'flex',gap:8}}>
        <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="recommend" checked={recommend===true} onChange={()=>setRecommend(true)} /> Yes</label>
        <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="recommend" checked={recommend===false} onChange={()=>setRecommend(false)} /> No</label>
      </div>

      <div className="auth-actions" style={{marginTop:12}}>
        <button className="btn btn-primary" disabled={busy} type="submit">SUBMIT REVIEW</button>
      </div>
    </form>
  );
}

export default ReviewForm;
