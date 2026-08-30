import tresProductos from '../assets/Tres Productos.png';
import { PHONE } from '../siteInfo';

export default function Events() {
  return (
    <section id="events" style={{ background: 'var(--alt-bg)' }}>
      <div className="wrap">
        <div className="events-card">
          <div>
            <div className="section-label" style={{ textAlign: 'left' }}>
              Private Events
            </div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              Bring Maybe Café to You
            </h2>
            <p>
              From birthdays to weddings, corporate mornings to community pop-ups — we bring
              handcrafted drinks straight to your event.
            </p>
            <ul className="check-list">
              <li>Custom drink menus for your event</li>
              <li>Full espresso bar &amp; fresh pastries</li>
              <li>We handle setup, service, and cleanup</li>
            </ul>
            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
              <a
                href={PHONE.tel}
                className="btn btn-solid"
                style={{ background: 'var(--coffee)', color: '#fff' }}
              >
                Call for Events: {PHONE.display}
              </a>
              <a href="#event-request" className="btn btn-outline" style={{ color: 'var(--coffee)', borderColor: 'var(--coffee)' }}>
                Request Info
              </a>
            </div>
          </div>
          <div>
            <img src={tresProductos} alt="Maybe Café products" style={{ maxWidth: 280, margin: '0 auto' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
