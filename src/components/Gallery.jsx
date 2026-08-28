import establishmentImg from '../assets/establishment.png';
import utencilios from '../assets/Utencilios.png';
import nutellaDreamAcai from '../assets/Nutella Dream Acaí.png';
import tropicalParadiseAcai from '../assets/Tropical Paradise Acaí.png';

export default function Gallery() {
  return (
    <section id="gallery">
      <div className="wrap">
        <div className="section-label">Gallery</div>
        <h2 className="section-title">A Peek Inside Maybe Café</h2>
        <p className="section-sub">&nbsp;</p>
        <div className="gallery-grid">
          <figure>
            <img src={establishmentImg} alt="Maybe Café" />
          </figure>
          <figure className="contain">
            <img src={utencilios} alt="Matcha preparation" />
          </figure>
          <figure className="contain">
            <img src={nutellaDreamAcai} alt="Nutella Dream Açaí bowl" />
          </figure>
          <figure className="contain">
            <img src={tropicalParadiseAcai} alt="Tropical Paradise Açaí bowl" />
          </figure>
        </div>
      </div>
    </section>
  );
}
