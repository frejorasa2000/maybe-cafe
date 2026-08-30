import { useState } from 'react';

const INITIAL = { name: '', email: '', phone: '', description: '' };

export default function EventRequestForm() {
  const [values, setValues] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/send-event-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      setValues(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="event-request" style={{ background: 'var(--surface)' }}>
      <div className="wrap">
        <div className="section-label">Request Info</div>
        <h2 className="section-title">Planning an Event?</h2>
        <p className="section-sub">
          Tell us a bit about it and we'll get back to you by email or phone.
        </p>

        <form className="event-form" onSubmit={onSubmit}>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={values.name} onChange={onChange} placeholder="Your name" />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={values.email}
              onChange={onChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-row">
            <label htmlFor="phone">Phone *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={values.phone}
              onChange={onChange}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">What do you need? *</label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={values.description}
              onChange={onChange}
              placeholder="Event date, location, number of guests, anything else we should know..."
            />
          </div>

          <button type="submit" className="btn btn-solid" style={{ background: 'var(--coffee)', color: '#fff' }} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Request'}
          </button>

          {status === 'sent' && <p className="form-message success">Thanks! We'll be in touch soon.</p>}
          {status === 'error' && (
            <p className="form-message error">
              Something went wrong. Please try again, or call us directly.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
