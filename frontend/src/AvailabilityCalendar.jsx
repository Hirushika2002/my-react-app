import { useEffect, useState } from 'react';
import axios from 'axios';

function rangeDates(start, end) {
  const arr = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) arr.push(new Date(d));
  return arr;
}

function isSameDay(a,b){
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function AvailabilityCalendar({ hotelId }){
  const [blocked, setBlocked] = useState([]); // array of date strings yyyy-mm-dd
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();

  useEffect(()=>{
    if (!hotelId) return setBlocked([]);
    const load = async ()=>{
      try{
        const { data } = await axios.get(`/api/bookings?hotelId=${hotelId}`);
        const ranges = [];
        (data||[]).forEach(b=>{
          try{
            const s = new Date(b.checkIn);
            const e = new Date(b.checkOut);
            const r = rangeDates(s,e);
            r.forEach(d=>{
              const key = d.toISOString().slice(0,10);
              ranges.push(key);
            });
          }catch(e){}
        });
        setBlocked(Array.from(new Set(ranges)));
      }catch(e){
        console.error('Failed load bookings for availability',e);
        setBlocked([]);
      }
    };
    load();
  },[hotelId]);

  const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(new Date(year, monthIndex, d));

  const isBlocked = (d) => {
    if (!d) return false;
    const key = d.toISOString().slice(0,10);
    return blocked.includes(key);
  };

  return (
    <div className="availability-card card" style={{padding:12,marginTop:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}> 
        <strong>Availability</strong>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={()=>setMonthOffset(m=>m-1)}>&lt;</button>
          <div style={{minWidth:160,textAlign:'center'}}>{month.toLocaleString(undefined,{month:'long',year:'numeric'})}</div>
          <button className="btn" onClick={()=>setMonthOffset(m=>m+1)}>&gt;</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div className="calendar-grid" style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h=> <div key={h} style={{fontSize:12,color:'var(--subtext)',textAlign:'center'}}>{h}</div>)}
          {cells.map((d,idx)=> (
            <div key={idx} className={`cal-cell ${d?''+ (isBlocked(d)?' blocked':' available') : 'empty'}`} style={{height:44,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8}}>
              {d ? (
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:13}}>{d.getDate()}</div>
                  {isBlocked(d) ? <div style={{fontSize:11,color:'#b91c1c'}}>Booked</div> : <div style={{fontSize:11,color:'#059669'}}>Free</div>}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
