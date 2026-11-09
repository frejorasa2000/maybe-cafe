// Scroll-scrubbed frame animations, rendered by <ScrollFrameSequence />.
//
// Each entry describes one sequence of WebP frames in /public/frames/<folder>/
// named frame_001.webp, frame_002.webp, … To add another one, extract its
// frames into a new folder and add an entry here.
//
//   folder        public path of the frames
//   frameCount    how many frame_XXX.webp files there are
//   background    solid section colour (sampled from a corner pixel of a frame)
//   backgroundGradient  optional CSS gradient that follows the footage's own
//                 light falloff, so the frame edges melt into the section
//   fit           'contain' → whole frame visible, edges feathered into the
//                 background (good for portrait product shots)
//                 'cover'   → frame fills the viewport (good for landscape)
//   focusX        desktop horizontal centre of the frame (0 = left, 1 = right)
//   mobileScale   phones: frame height as a fraction of the screen, anchored
//                 to the bottom so the text sits above it ('contain' only)
//   desktopScale  same, for desktop (default 1 = full screen height)
//   fitWidth      desktop: also shrink a landscape frame so it is never wider
//                 than the screen — the whole frame (and the bottom of the
//                 cup) stays visible and its edges feather into the background
//   scrollLength  how many screen heights the section stays pinned
//   filter        CSS filter applied to the canvas ('none' to keep colours
//                 identical to the background colour)
//   wash          whole-page mode (ScrollVideoBackground): opacity of the
//                 paper-coloured veil over the footage, in the hero and in the
//                 rest of the sections, on desktop and on phones (…Small)
//   overlay       pinned-section mode (ScrollFrameSequence): CSS backgrounds
//                 drawn over the footage for text legibility
//   cssVars       colour tokens overridden inside the section (keeps the text
//                 dark on the light footage even in dark mode)
//   stages        captions shown one after another as the user scrolls, per
//                 language

//   maxWidth      desktop: largest drawn width in CSS px (low-res footage)
//   alignY        desktop: 'bottom' (default) or 'center'
//   mobileOffsetY phones: lift the frame by this fraction of the screen
//                 height, leaving room for the stage caption below it
//   pinHeight     pinned-section mode: section height in vh per device
//                 ({ desktop, mobile }); the animation plays over
//                 (pinHeight − 100) vh of scroll — lower = faster
//   scrub         0–1 easing toward the scroll position per animation frame
//                 (lower = smoother, a bit more lag)
//   hero          optional hero copy shown with this sequence as
//                 PAGE_BACKGROUND, per language (keys of t.hero)
//   stages[].at   optional start of each caption (0–1 of the animation), so
//                 the captions follow the footage

// The animation shown in the HERO, as a pinned section (null = plain hero).
// 'acai-v2', 'caramel-latte', 'iced-coffee' or 'acai'.
export const HERO_SEQUENCE = 'acai-v2';

// Which sequence plays as the fixed background of the WHOLE page
// (scroll down → it fills up, scroll up → it empties). null = off.
// 'caramel-latte', 'iced-coffee' or 'acai'.
export const PAGE_BACKGROUND = null;

export const SCROLL_SEQUENCES = {
  // Seedance clip (src/assets/videos/acai-seedance.mp4, 844×484): trimmed to
  // the last falling coconut + 0.3 s, interpolated 24 → 45 fps (minterpolate
  // mci/aobmc/bidir), lanczos to 1600 px + light unsharp, WebP q80.
  'acai-v2': {
    folder: '/frames/acai-v2',
    // phones: same frames with the gray background pushed to white, drawn in
    // front of the text with "multiply" (the white vanishes)
    mobileFolder: '/frames/acai-v2-light',
    frameCount: 169,
    // corners of the footage: light gray left, a little darker right
    background: '#D4D2D7',
    backgroundGradient: 'linear-gradient(to right, #DCDBDF 0%, #D6D4D9 50%, #C4C2C7 100%)',
    fit: 'contain',
    focusX: 0.62,
    alignY: 'center',
    // low-res source: never drawn wider than this on desktop
    maxWidth: 1100,
    fitWidth: true,
    desktopScale: 0.9,
    mobileScale: 0.42,
    mobileOffsetY: 0.13,
    // As HERO_SEQUENCE (components/organisms/HeroScene.jsx):
    //  desktop — the animation sits in the right half of the screen while
    //    the story + Favorites scroll on the left; it ends right before
    //    Full Menu. panelScale = frame height as a fraction of the screen.
    //  phones — the animation plays behind the story, over pinHeight.mobile
    //    vh of page (the page keeps scrolling); Favorites follows on a solid
    //    background.
    panelScale: 0.75,
    // desktop: 'story' = the bowl fills while the story is read (more
    // noticeable) and stays complete next to Favorites; 'menu' = spread
    // until right before Full Menu. desktopFinishOffset: extra screens of
    // scroll after the story before the last frame (0.5 = Favorites heading
    // halfway up the screen).
    desktopFinish: 'story',
    desktopFinishOffset: 0.5,
    pinHeight: { desktop: 200, mobile: 170 },
    scrub: 0.15,
    filter: 'none',
    overlay: { desktop: null, mobile: null },
    cssVars: {
      '--color-espresso': '#1f1810',
      '--color-wine-soft': '#6e2430',
      '--color-gold': '#7d5419',
    },
    // (as HERO_SEQUENCE the hero shows "More than a coffee stop" — see Hero.jsx)
    // starts measured on the footage: açaí pour → granola (~26 %) →
    // strawberries / mango / banana (~43 %) → coconut & finished bowl (~68 %)
    stages: {
      es: [
        { at: 0, title: 'Açaí puro', text: 'Base cremosa y bien fría.' },
        { at: 0.26, title: 'Granola crujiente', text: 'Tostada, en su punto.' },
        { at: 0.43, title: 'Fruta fresca', text: 'Fresas, mango y banano.' },
        { at: 0.68, title: 'Tu bowl, Maybe', text: 'Con coco, listo para ti.' },
      ],
      en: [
        { at: 0, title: 'Pure açaí', text: 'A creamy, ice-cold base.' },
        { at: 0.26, title: 'Crunchy granola', text: 'Toasted just right.' },
        { at: 0.43, title: 'Fresh fruit', text: 'Strawberries, mango and banana.' },
        { at: 0.68, title: 'Your Maybe bowl', text: 'Finished with coconut, made for you.' },
      ],
    },
  },

  // Artlist (Kling v3 Pro) clip, generated emptying and played reversed:
  // empty cup → ice → milk & coffee → caramel down the walls (= the photo).
  // Source: src/assets/videos/caramel-latte-original.mp4
  'caramel-latte': {
    folder: '/frames/caramel-latte',
    // same frames with the studio gray pushed to white: InlineScrub blends
    // them with "multiply" in the light theme so they sit on the page
    // background (Events section)
    lightFolder: '/frames/caramel-latte-light',
    frameCount: 150,
    // studio gray just inside the feathered edges of the 16:9 frames
    background: '#E5E4E7',
    backgroundGradient: 'linear-gradient(to bottom, #D8D7DA 0%, #E3E2E5 25%, #E9E8EB 50%, #EAE9EC 75%, #E7E6E9 100%)',
    fit: 'contain',
    focusX: 0.62,
    desktopScale: 1,
    fitWidth: true,
    // phones: keeps the rim of the cup below the hero buttons
    mobileScale: 0.6,
    scrollLength: 3,
    filter: 'none',
    wash: { hero: 0, heroSmall: 0.15, sections: 0.55, sectionsSmall: 0.68 },
    overlay: {
      desktop: null,
      mobile: 'linear-gradient(to bottom, rgba(229,228,231,.85) 0%, rgba(229,228,231,.55) 40%, rgba(229,228,231,0) 55%)',
    },
    cssVars: {
      '--color-espresso': '#1f1810',
      '--color-wine-soft': '#6e2430',
      '--color-gold': '#7d5419',
    },
    hero: {
      en: {
        eyebrow: 'Iced Caramel Latte · Carmel, NY',
        line1: 'Iced Caramel',
        line2Prefix: '',
        line2Accent: 'Latte',
        lede: 'Espresso and cold milk over ice, finished with golden caramel running down every side of the cup. Handcrafted to order — the way it should be.',
      },
      es: {
        eyebrow: 'Iced Caramel Latte · Carmel, NY',
        line1: 'Caramel Latte',
        line2Prefix: '',
        line2Accent: 'helado',
        lede: 'Espresso y leche fría sobre hielo, terminado con caramelo dorado escurriendo por las paredes del vaso. Hecho a mano, al momento.',
      },
    },
    stages: {
      es: [
        { title: 'Hielo', text: 'Cubos cristalinos en un vaso limpio.' },
        { title: 'Leche y espresso', text: 'Servidos en frío, capa a capa.' },
        { title: 'Caramelo', text: 'Escurriendo por las paredes del vaso.' },
      ],
      en: [
        { title: 'Ice', text: 'Crystal-clear cubes in a clean cup.' },
        { title: 'Milk & espresso', text: 'Poured cold, layer by layer.' },
        { title: 'Caramel', text: 'Ribboned down every side of the cup.' },
      ],
    },
  },

  'iced-coffee': {
    folder: '/frames/iced-coffee',
    frameCount: 150,
    // top-left pixel of frame_150.webp
    background: '#A3A3A3',
    // left edge of the frame: top #A3A3A3 → middle #BDBCBD → bottom #B5B4B4
    backgroundGradient: 'linear-gradient(to bottom, #A3A3A3 0%, #BDBCBD 50%, #B5B4B4 100%)',
    fit: 'contain',
    focusX: 0.7,
    mobileScale: 0.58,
    scrollLength: 3,
    filter: 'none',
    wash: { hero: 0, heroSmall: 0.25, sections: 0.55, sectionsSmall: 0.68 },
    overlay: {
      desktop: null,
      mobile: 'linear-gradient(to bottom, rgba(163,163,163,.85) 0%, rgba(163,163,163,.55) 45%, rgba(163,163,163,0) 65%)',
    },
    cssVars: {
      '--color-espresso': '#1f1810',
      '--color-wine-soft': '#6e2430',
      '--color-gold': '#7d5419',
    },
    stages: {
      es: [
        { title: 'Hielo', text: 'Cubos cristalinos, recién caídos.' },
        { title: 'Cold brew de especialidad', text: 'Extraído en frío durante horas.' },
        { title: 'Tu momento, Maybe', text: 'Frío, intenso y hecho para ti.' },
      ],
      en: [
        { title: 'Ice', text: 'Crystal-clear cubes, fresh from the fall.' },
        { title: 'Specialty cold brew', text: 'Slow-steeped for hours.' },
        { title: 'Your Maybe moment', text: 'Cold, bold and made for you.' },
      ],
    },
  },

  acai: {
    folder: '/frames/acai',
    frameCount: 120,
    // top-left pixel of frame_120.webp
    background: '#C7C6CD',
    backgroundGradient: null,
    fit: 'cover',
    focusX: 0.5,
    mobileScale: 1,
    scrollLength: 3,
    // a touch richer than the raw footage so the bowl stands out
    filter: 'saturate(1.25) contrast(1.08)',
    wash: { hero: 0.2, heroSmall: 0.45, sections: 0.55, sectionsSmall: 0.68 },
    overlay: {
      desktop: 'rgba(250,249,245,.2)',
      mobile: 'rgba(250,249,245,.45)',
    },
    cssVars: {
      '--color-espresso': '#2a2015',
    },
    stages: {
      es: [
        { title: 'Açaí', text: 'Base cremosa y bien fría.' },
        { title: 'Fruta fresca', text: 'Capa a capa, hecha al momento.' },
        { title: 'Tu bowl, Maybe', text: 'Toppings a tu gusto.' },
      ],
      en: [
        { title: 'Açaí', text: 'A creamy, ice-cold base.' },
        { title: 'Fresh fruit', text: 'Layer by layer, made to order.' },
        { title: 'Your Maybe bowl', text: 'Topped just the way you like it.' },
      ],
    },
  },
};
