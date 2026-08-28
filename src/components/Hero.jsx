import heroImg from '../assets/establishment.png';
import { MAPS_URL } from '../siteInfo';

export default function Hero() {
  return (
    <section id="home" className="hero" style={{ '--hero-img': `url(${heroImg})` }}>
      <div>
        <div className="eyebrow">Handcrafted Specialty Coffee &middot; Fresh Drinks &amp; Pastries</div>
        <h1>
          Coffee Worth
          <br />
          Chasing
        </h1>
        <p>
          Handcrafted espresso, specialty coffee, fresh pastries, and unforgettable moments — now
          served from our very own home. Come find your new favorite corner of the neighborhood.
        </p>
        <div className="hero-actions">
          <a href="#menu" className="btn btn-solid">
            View Our Menu
          </a>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
