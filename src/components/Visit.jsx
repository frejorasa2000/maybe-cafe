import { MAPS_URL, PHONE, ADDRESS } from '../siteInfo';

export default function Visit() {
  return (
    <section id="visit">
      <div className="wrap">
        <div className="today-block">
          <div className="eyebrow" style={{ color: '#ecdcc9' }}>
            Visit Us
          </div>
          <h2>Come Say Hello</h2>
          <p>
            We've put down roots at {ADDRESS}. Stop by for handcrafted coffee, fresh pastries, and a
            place to slow down for a while.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
              Get Directions
            </a>
            <a href={PHONE.tel} className="btn btn-outline">
              Call {PHONE.display}
            </a>
          </div>
          <small>Hours coming soon — follow us on social for the latest updates.</small>
        </div>
      </div>
    </section>
  );
}
