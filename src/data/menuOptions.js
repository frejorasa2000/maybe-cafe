// Customization groups (milk, syrup, cold foam, toppings). Like menuPricing.js
// this has no image imports, so api/create-payment can import it to validate
// the chosen options and recompute their price server-side.
const opt = (id, en, es = en, price = 0) => ({ id, label: { en, es }, price });

export const OPTION_GROUPS = {
  milk: {
    id: 'milk',
    label: { en: 'Milk choice', es: 'Tipo de leche' },
    max: 1,
    options: [
      opt('whole', 'Whole milk', 'Leche entera'),
      opt('oat', 'Oat milk', 'Leche de avena'),
      opt('almond', 'Almond milk', 'Leche de almendra'),
      opt('coconut', 'Coconut milk', 'Leche de coco'),
    ],
  },
  syrup: {
    id: 'syrup',
    label: { en: 'Syrup', es: 'Syrup' },
    max: 1,
    options: [
      opt('banana', 'Banana syrup', 'Syrup de banana', 0.49),
      opt('caramel', 'Caramel syrup', 'Syrup de caramelo', 0.49),
      opt('vanilla', 'Vanilla syrup', 'Syrup de vainilla', 0.49),
      opt('hazelnut', 'Hazelnut syrup', 'Syrup de avellana', 0.49),
      opt('cookie-butter', 'Cookie butter syrup', 'Syrup de cookie butter', 0.49),
      opt('brown-sugar', 'Brown sugar syrup', 'Syrup de azúcar morena', 0.49),
    ],
  },
  coldFoam: {
    id: 'coldFoam',
    label: { en: 'Cold foam', es: 'Cold foam' },
    max: 1,
    options: [
      opt('brown-sugar', 'Brown sugar cold foam', 'Cold foam de azúcar morena', 0.49),
      opt('mascarpone', 'Mascarpone cold foam', 'Cold foam de mascarpone', 0.49),
      opt('biscoff', 'Biscoff cold foam', 'Cold foam de Biscoff', 0.49),
      opt('nutella', 'Nutella cold foam', 'Cold foam de Nutella', 0.49),
      opt('banana', 'Banana cold foam', 'Cold foam de banana', 0.49),
      opt('vanilla', 'Vanilla cold foam', 'Cold foam de vainilla', 0.49),
      opt('caramel', 'Caramel cold foam', 'Cold foam de caramelo', 0.49),
      opt('strawberry', 'Strawberry cold foam', 'Cold foam de fresa', 0.49),
      opt('mango', 'Mango cold foam', 'Cold foam de mango', 0.49),
      opt('matcha', 'Matcha cold foam', 'Cold foam de matcha', 0.49),
    ],
  },
  toppings: {
    id: 'toppings',
    label: { en: 'Extra toppings', es: 'Toppings extra' },
    max: 2,
    options: [
      opt('strawberries', 'Strawberries', 'Fresas'),
      opt('banana', 'Banana', 'Plátano'),
      opt('blueberries', 'Blueberries', 'Arándanos'),
      opt('raspberries', 'Raspberries', 'Frambuesas'),
      opt('mango', 'Mango'),
      opt('granola', 'Granola'),
      opt('coconut-flakes', 'Coconut flakes', 'Coco rallado'),
      opt('chia-seeds', 'Chia seeds', 'Semillas de chía'),
      opt('sliced-almonds', 'Sliced almonds', 'Almendras fileteadas'),
      opt('bee-pollen', 'Bee pollen', 'Polen de abeja'),
      opt('walnuts', 'Walnuts', 'Nueces'),
      opt('mini-marshmallows', 'Mini marshmallows', 'Mini malvaviscos'),
      opt('chocolate-chips', 'Chocolate chips', 'Chispas de chocolate'),
      opt('white-chocolate-chips', 'White chocolate chips', 'Chispas de chocolate blanco'),
      opt('mms', "M&M's"),
      opt('sprinkles', 'Sprinkles', 'Chispas de colores'),
      opt('oreo', 'Oreo cookie', 'Galleta Oreo'),
      opt('lotus', 'Lotus cookie crumble', 'Galleta Lotus'),
      opt('matcha-almonds', 'Matcha almonds', 'Almendras de matcha'),
      opt('honey', 'Honey', 'Miel'),
      opt('peanut-butter', 'Peanut butter', 'Mantequilla de maní'),
      opt('nutella', 'Nutella'),
      opt('hershey', 'Chocolate Hershey syrup', 'Sirope de chocolate Hershey'),
      opt('condensed-milk', 'Sweetened condensed milk', 'Leche condensada'),
    ],
  },
};

const MILK_DRINKS = [
  'latte',
  'vanilla-latte',
  'caramel-latte',
  'tiramisu-latte',
  'cookie-butter-latte',
  'banana-bread-latte',
  'strawberry-matcha',
  'mango-matcha',
  'banana-pudding-matcha',
];
const TOPPING_ITEMS = [
  'nutella-dream',
  'peanut-berry-crunch',
  'tropical-paradise',
  'churro-mini-pancakes',
  'choco-banana-mini-pancakes',
  'triple-berry-mini-pancakes',
];

// Which groups each product offers. Milk drinks must pick a milk (whole milk
// is preselected); everything else is optional.
export function getProductGroups(productId) {
  if (TOPPING_ITEMS.includes(productId)) return [{ ...OPTION_GROUPS.toppings, required: false }];
  if (productId === 'americano' || MILK_DRINKS.includes(productId)) {
    return [
      { ...OPTION_GROUPS.milk, required: MILK_DRINKS.includes(productId) },
      { ...OPTION_GROUPS.syrup, required: false },
      { ...OPTION_GROUPS.coldFoam, required: false },
    ];
  }
  return [];
}

export function defaultSelections(productId) {
  const selections = {};
  for (const group of getProductGroups(productId)) {
    selections[group.id] = group.required ? [group.options[0].id] : [];
  }
  return selections;
}

// Turns { groupId: [optionId] } into a flat list of chosen options, or
// { error } when something is unknown, over the limit, or missing.
export function resolveSelections(productId, selections = {}) {
  const groups = getProductGroups(productId);
  const chosen = [];
  for (const key of Object.keys(selections || {})) {
    if (!groups.some((g) => g.id === key)) return { error: `Invalid option group "${key}".` };
  }
  for (const group of groups) {
    const ids = Array.isArray(selections?.[group.id]) ? selections[group.id] : [];
    if (new Set(ids).size !== ids.length || ids.length > group.max) return { error: `Too many choices for ${group.label.en}.` };
    if (group.required && ids.length === 0) return { error: `Please choose a ${group.label.en.toLowerCase()}.` };
    for (const id of ids) {
      const option = group.options.find((o) => o.id === id);
      if (!option) return { error: `Invalid choice for ${group.label.en}.` };
      chosen.push({ groupId: group.id, ...option });
    }
  }
  return { chosen };
}

export const optionsPrice = (chosen) => chosen.reduce((sum, o) => sum + o.price, 0);
