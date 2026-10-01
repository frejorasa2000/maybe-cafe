// Real prices from the printed menu (Menu1 / Menu2). Drinks come in 16 oz and
// 20 oz; açaí bowls and mini pancakes have a single size/price.
// Kept separate from menu.js (which imports images) so this same file can be
// imported by the api/create-payment serverless function to recompute the
// charge server-side instead of trusting the amount sent from the browser.
export const SIZE_LABELS = {
  '16oz': { en: '16 oz', es: '16 oz' },
  '20oz': { en: '20 oz', es: '20 oz' },
  bowl: { en: '16 oz bowl', es: 'Bowl 16 oz' },
  pancakes: { en: '10 pcs', es: '10 piezas' },
};

const drink = (small, large) => ({ '16oz': small, '20oz': large });

export const PRICES = {
  // Classics
  americano: { name: 'Americano', sizes: drink(4.0, 4.5) },
  latte: { name: 'Latte', sizes: drink(4.5, 5.0) },
  'vanilla-latte': { name: 'Vanilla Latte', sizes: drink(5.0, 5.5) },
  'caramel-latte': { name: 'Caramel Latte', sizes: drink(5.0, 5.5) },
  // Signature lattes (iced only)
  'tiramisu-latte': { name: 'Tiramisu Latte', sizes: drink(6.0, 6.5) },
  'cookie-butter-latte': { name: 'Cookie Butter Latte', sizes: drink(6.0, 6.5) },
  'banana-bread-latte': { name: 'Banana Bread Latte', sizes: drink(6.0, 6.5) },
  // Matcha
  'strawberry-matcha': { name: 'Strawberry Matcha', sizes: drink(6.5, 7.5) },
  'mango-matcha': { name: 'Mango Matcha', sizes: drink(6.5, 7.5) },
  'banana-pudding-matcha': { name: 'Banana Pudding Matcha', sizes: drink(6.5, 7.5) },
  // Açaí bowls
  'nutella-dream': { name: 'Nutella Dream', sizes: { bowl: 13 } },
  'peanut-berry-crunch': { name: 'Peanut Berry Crunch', sizes: { bowl: 13 } },
  'tropical-paradise': { name: 'Tropical Paradise', sizes: { bowl: 13 } },
  // Mini pancakes
  'churro-mini-pancakes': { name: 'Churro Mini Pancakes', sizes: { pancakes: 10 } },
  'choco-banana-mini-pancakes': { name: 'Choco Banana Mini Pancakes', sizes: { pancakes: 10 } },
  'triple-berry-mini-pancakes': { name: 'Triple Berry Mini Pancakes', sizes: { pancakes: 10 } },
};

export function buildSizes(productId) {
  const product = PRICES[productId];
  if (!product) return [];
  return Object.entries(product.sizes).map(([id, price]) => ({ id, label: SIZE_LABELS[id], price }));
}
