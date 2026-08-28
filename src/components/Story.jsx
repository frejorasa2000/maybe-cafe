import establishmentImg from '../assets/establishment.png';
import { MAPS_URL } from '../siteInfo';

export default function Story() {
  return (
    <section id="story">
      <div className="wrap story-grid">
        <div>
          <div className="section-label" style={{ textAlign: 'left' }}>
            Our Story
          </div>
          <h2 className="section-title" style={{ textAlign: 'left' }}>
            More Than a Coffee Stop
          </h2>
          <p className="story-lead">
            Maybe Café is more than a coffee shop — it's a place where handcrafted coffee, fresh
            pastries, and meaningful moments come together.
          </p>
          <p className="body-copy">
            Every visit is an invitation to slow down, connect, and enjoy exceptional coffee right
            here at home.
          </p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solid"
            style={{ background: 'var(--coffee)', color: '#fff' }}
          >
            Get Directions
          </a>
        </div>
        <div className="img-col">
          <img src={establishmentImg} alt="Maybe Café" />
        </div>
      </div>
    </section>
  );
}
