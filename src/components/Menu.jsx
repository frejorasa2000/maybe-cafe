import tiramisuLatte from '../assets/Tiramisú Latte.png';
import cookieButterLatte from '../assets/Cookie Butter Latte.png';
import strawberryMatcha from '../assets/Strawberry Matcha.png';
import mangoMatcha from '../assets/Mango Matcha.png';
import bananaPuddingMatcha from '../assets/Banana Pudding Matcha.png';
import nutellaDreamAcai from '../assets/Nutella Dream Acaí.png';
import peanutBerryCrunchAcai from '../assets/Peanut Berry Crunch Acaí.png';
import tropicalParadiseAcai from '../assets/Tropical Paradise Acaí.png';
import { useLightbox } from './Lightbox';

const ITEMS = [
  {
    img: strawberryMatcha,
    tag: 'Matcha',
    name: 'Strawberry Matcha',
    desc: 'Vibrant matcha swirled with sweet strawberry, served over ice.',
  },
  {
    img: mangoMatcha,
    tag: 'Matcha',
    name: 'Mango Matcha',
    desc: 'Smooth matcha layered with sweet mango, served over ice.',
  },
  {
    img: bananaPuddingMatcha,
    tag: 'Matcha',
    name: 'Banana Pudding Matcha',
    desc: 'Creamy matcha blended with banana pudding flavor, served over ice.',
  },
  {
    img: tiramisuLatte,
    tag: 'Iced Latte',
    name: 'Tiramisu Latte',
    desc: 'Espresso and steamed milk with a rich, tiramisu-inspired flavor, served iced.',
  },
  {
    img: cookieButterLatte,
    tag: 'Iced Latte',
    name: 'Cookie Butter Latte',
    desc: 'Espresso and steamed milk infused with rich cookie butter, served iced.',
  },
  {
    img: nutellaDreamAcai,
    tag: 'Açaí Bowl',
    name: 'Nutella Dream',
    desc: 'Açaí topped with banana, strawberry, Nutella, granola, Oreo crumble, and chocolate chips.',
  },
  {
    img: peanutBerryCrunchAcai,
    tag: 'Açaí Bowl',
    name: 'Peanut Berry Crunch',
    desc: 'Açaí topped with strawberry, blueberries, banana, peanut butter, granola, and chia seeds.',
  },
  {
    img: tropicalParadiseAcai,
    tag: 'Açaí Bowl',
    name: 'Tropical Paradise',
    desc: 'Açaí topped with mango, strawberry, banana, coconut flakes, and granola.',
  },
];

export default function Menu() {
  const openLightbox = useLightbox();

  return (
    <section id="menu" style={{ background: 'var(--alt-bg)' }}>
      <div className="wrap">
        <div className="section-label">Our Menu</div>
        <h2 className="section-title">Signature Favorites</h2>
        <p className="section-sub">Our handcrafted drinks and açaí bowls, made to brighten every moment.</p>
        <div className="menu-grid">
          {ITEMS.map((item) => (
            <div className="menu-card" key={item.name}>
              <div className="thumb" onClick={() => openLightbox(item.img, item.name)}>
                <img src={item.img} alt={item.name} />
              </div>
              <div className="body">
                <span className="menu-tag">{item.tag}</span>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
