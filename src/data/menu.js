import americano from '../assets/images/menu/americano.jpg';
import latte from '../assets/images/menu/latte.jpg';
import vanillaLatte from '../assets/images/menu/vanilla-latte.jpg';
import caramelLatte from '../assets/images/menu/caramel-latte.jpg';
import tiramisuLatte from '../assets/images/menu/tiramisu-latte.jpg';
import cookieButterLatte from '../assets/images/menu/cookie-butter-latte.jpg';
import bananaBreadLatte from '../assets/images/menu/banana-bread-latte.jpg';
import strawberryMatcha from '../assets/images/menu/strawberry-matcha.jpg';
import mangoMatcha from '../assets/images/menu/mango-matcha.jpg';
import bananaPuddingMatcha from '../assets/images/menu/banana-pudding-matcha.jpg';
import nutellaDream from '../assets/images/menu/nutella-dream.jpg';
import peanutBerryCrunch from '../assets/images/menu/peanut-berry-crunch.jpg';
import tropicalParadise from '../assets/images/menu/tropical-paradise.jpg';
import churroPancakes from '../assets/images/menu/churro-mini-pancakes.jpg';
import chocoBananaPancakes from '../assets/images/menu/choco-banana-mini-pancakes.jpg';
import tripleBerryPancakes from '../assets/images/menu/triple-berry-mini-pancakes.jpg';
import { PRICES, buildSizes } from './menuPricing';

// Photos in assets/images/menu/ are all normalized to the same square,
// light-backdrop format (see _originals/ for the untouched sources) so every
// card in the section looks consistent.
const RAW_MENU = [
  {
    id: 'americano',
    category: 'Classics',
    tag: 'coffee',
    description: {
      en: 'Espresso and water, served iced or hot (hot drinks are 16 oz only).',
      es: 'Espresso y agua, frío o caliente (las bebidas calientes solo en 16 oz).',
    },
    image: americano,
  },
  {
    id: 'latte',
    category: 'Classics',
    tag: 'coffee',
    description: {
      en: 'Espresso with your choice of milk, served iced or hot (hot drinks are 16 oz only).',
      es: 'Espresso con la leche de tu elección, frío o caliente (las calientes solo en 16 oz).',
    },
    image: latte,
  },
  {
    id: 'vanilla-latte',
    category: 'Classics',
    tag: 'coffee',
    description: {
      en: 'Espresso, milk and sweet vanilla, served iced or hot (hot drinks are 16 oz only).',
      es: 'Espresso, leche y vainilla, frío o caliente (las calientes solo en 16 oz).',
    },
    image: vanillaLatte,
  },
  {
    id: 'caramel-latte',
    category: 'Classics',
    tag: 'coffee',
    description: {
      en: 'Espresso, milk and rich caramel, served iced or hot (hot drinks are 16 oz only).',
      es: 'Espresso, leche y caramelo, frío o caliente (las calientes solo en 16 oz).',
    },
    image: caramelLatte,
  },
  {
    id: 'tiramisu-latte',
    category: 'Signature Latte',
    tag: 'latte',
    description: {
      en: 'Espresso and milk with a rich, tiramisu-inspired flavor. Iced only.',
      es: 'Espresso y leche con un sabor inspirado en el tiramisú. Solo frío.',
    },
    image: tiramisuLatte,
  },
  {
    id: 'cookie-butter-latte',
    category: 'Signature Latte',
    tag: 'latte',
    description: {
      en: 'Espresso and milk infused with rich cookie butter. Iced only.',
      es: 'Espresso y leche con cookie butter. Solo frío.',
    },
    image: cookieButterLatte,
  },
  {
    id: 'banana-bread-latte',
    category: 'Signature Latte',
    tag: 'latte',
    description: {
      en: 'Espresso and milk with warm banana bread flavor and caramel drizzle. Iced only.',
      es: 'Espresso y leche con sabor a pan de plátano y caramelo. Solo frío.',
    },
    image: bananaBreadLatte,
  },
  {
    id: 'strawberry-matcha',
    category: 'Matcha',
    tag: 'matcha',
    description: {
      en: 'Vibrant matcha swirled with sweet strawberry, served over ice.',
      es: 'Matcha vibrante con dulce de fresa, servido sobre hielo.',
    },
    image: strawberryMatcha,
  },
  {
    id: 'mango-matcha',
    category: 'Matcha',
    tag: 'matcha',
    description: {
      en: 'Smooth matcha layered with sweet mango, served over ice.',
      es: 'Matcha suave en capas con dulce de mango, servido sobre hielo.',
    },
    image: mangoMatcha,
  },
  {
    id: 'banana-pudding-matcha',
    category: 'Matcha',
    tag: 'matcha',
    description: {
      en: 'Creamy matcha blended with banana pudding flavor, served over ice.',
      es: 'Matcha cremoso con sabor a pudín de banana, servido sobre hielo.',
    },
    image: bananaPuddingMatcha,
  },
  {
    id: 'nutella-dream',
    category: 'Açaí Bowl',
    tag: 'acai',
    description: {
      en: 'Açaí topped with banana, strawberry, Nutella, granola, Oreo crumble, and chocolate chips.',
      es: 'Açaí con plátano, fresa, Nutella, granola, Oreo y chispas de chocolate.',
    },
    image: nutellaDream,
  },
  {
    id: 'peanut-berry-crunch',
    category: 'Açaí Bowl',
    tag: 'acai',
    description: {
      en: 'Açaí topped with strawberry, blueberries, banana, peanut butter, granola, and chia seeds.',
      es: 'Açaí con fresa, arándanos, plátano, mantequilla de maní, granola y chía.',
    },
    image: peanutBerryCrunch,
  },
  {
    id: 'tropical-paradise',
    category: 'Açaí Bowl',
    tag: 'acai',
    description: {
      en: 'Açaí topped with mango, strawberry, banana, coconut flakes, and granola.',
      es: 'Açaí con mango, fresa, plátano, coco y granola.',
    },
    image: tropicalParadise,
  },
  {
    id: 'churro-mini-pancakes',
    category: 'Mini Pancakes',
    tag: 'pancakes',
    description: {
      en: '10 cinnamon-sugar mini pancakes with cream, caramel and Cinnamon Toast Crunch.',
      es: '10 mini panqueques de canela y azúcar con crema, caramelo y Cinnamon Toast Crunch.',
    },
    image: churroPancakes,
  },
  {
    id: 'choco-banana-mini-pancakes',
    category: 'Mini Pancakes',
    tag: 'pancakes',
    description: {
      en: '10 mini pancakes with banana, cream and chocolate sauce.',
      es: '10 mini panqueques con plátano, crema y salsa de chocolate.',
    },
    image: chocoBananaPancakes,
  },
  {
    id: 'triple-berry-mini-pancakes',
    category: 'Mini Pancakes',
    tag: 'pancakes',
    description: {
      en: '10 mini pancakes with cream and a mix of strawberry, blueberry and raspberry.',
      es: '10 mini panqueques con crema y una mezcla de fresa, arándano y frambuesa.',
    },
    image: tripleBerryPancakes,
  },
];

export const MENU = RAW_MENU.map((dish) => ({ ...dish, name: PRICES[dish.id].name, sizes: buildSizes(dish.id) }));
