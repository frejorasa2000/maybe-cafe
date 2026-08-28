import menu1 from '../assets/Menu1.jpeg';
import menu2 from '../assets/Menu2.jpeg';
import toppings from '../assets/Toppings.jpeg';
import { useLightbox } from './Lightbox';

const PAGES = [
  { img: menu1, alt: 'Maybe Café menu — coffee, matcha, and other drinks' },
  { img: menu2, alt: 'Maybe Café menu — açaí bowls, strawberries & cream bowls, and mini pancakes' },
  { img: toppings, alt: 'Maybe Café topping choices' },
];

export default function FullMenu() {
  const openLightbox = useLightbox();

  return (
    <section id="full-menu" style={{ background: 'var(--surface)' }}>
      <div className="wrap">
        <div className="section-label">Full Menu</div>
        <h2 className="section-title">Everything We Pour &amp; Top</h2>
        <p className="section-sub">&nbsp;</p>
        <div className="menu-images">
          {PAGES.map((page) => (
            <img
              key={page.img}
              src={page.img}
              alt={page.alt}
              onClick={() => openLightbox(page.img, page.alt)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
