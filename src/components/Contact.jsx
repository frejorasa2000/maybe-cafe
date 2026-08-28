import { SOCIAL, MAPS_URL, PHONE, ADDRESS } from '../siteInfo';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './SocialIcons';

export default function Contact() {
  return (
    <section id="contact" style={{ background: 'var(--surface)' }}>
      <div className="wrap">
        <div className="section-label">Contact</div>
        <h2 className="section-title">Say Hello</h2>
        <p className="section-sub">
          Reach out about private events, or just to say you loved your coffee.
        </p>
        <div className="contact-grid">
          <div className="contact-card">
            <div className="icon" style={{ color: 'var(--accent-soft)' }}>
              <InstagramIcon />
            </div>
            <h3>Instagram</h3>
            <p>Photos &amp; daily updates</p>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="btn">
              @maybe_trailer
            </a>
          </div>
          <div className="contact-card">
            <div className="icon" style={{ color: 'var(--accent-soft)' }}>
              <FacebookIcon />
            </div>
            <h3>Facebook</h3>
            <p>Follow our page</p>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="btn">
              Maybe Café
            </a>
          </div>
          <div className="contact-card">
            <div className="icon" style={{ color: 'var(--accent-soft)' }}>
              <TikTokIcon />
            </div>
            <h3>TikTok</h3>
            <p>Behind the scenes</p>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className="btn">
              @maybe_trailer
            </a>
          </div>
          <div className="contact-card">
            <div className="icon">📞</div>
            <h3>Call Us</h3>
            <p>Events &amp; questions</p>
            <a href={PHONE.tel} className="btn">
              {PHONE.display}
            </a>
          </div>
          <div className="contact-card">
            <div className="icon">📍</div>
            <h3>Visit Us</h3>
            <p>{ADDRESS}</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn">
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
