import { motion } from 'framer-motion';
import Button from '../atoms/Button';
import Eyebrow from '../atoms/Eyebrow';
import StoryBlock from '../molecules/StoryBlock';
import HeroScene from './HeroScene';
import MenuSection from './MenuSection';
import { useT } from '../../hooks/useT';
import { HERO_SEQUENCE, PAGE_BACKGROUND, SCROLL_SEQUENCES } from '../../data/scrollSequences';

const lineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const wordVariants = {
  hidden: { y: '115%' },
  visible: { y: '0%', transition: { duration: 1, ease: [0.16, 0.8, 0.2, 1] } },
};

// Headline, lede and buttons. `copy` overrides keys of t.hero (a scroll
// sequence can bring its own hero copy, see src/data/scrollSequences.js).
function HeroCopy({ copy }) {
  return (
    <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pt-28 pb-16 sm:px-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
      <div>
        <Eyebrow>{copy.eyebrow}</Eyebrow>

        <motion.h1
          key={copy.line1}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
          className="mt-6 font-display text-5xl leading-[1.05] tracking-wide text-espresso uppercase sm:text-7xl lg:text-6xl xl:text-7xl"
        >
          <span className="block overflow-hidden">
            <motion.span variants={wordVariants} className="inline-block">
              {copy.line1}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span variants={wordVariants} className="inline-block">
              {copy.line2Prefix}
              <span className="text-wine-soft">{copy.line2Accent}</span>
            </motion.span>
          </span>
        </motion.h1>

        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="my-6 block h-px w-32 origin-left bg-linear-to-r from-gold to-transparent sm:my-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          // hidden on phones so the cup below the headline stays clear
          className="hidden max-w-xl font-serif text-xl leading-relaxed text-espresso/70 italic sm:block sm:text-2xl"
        >
          {copy.lede}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap items-center gap-6 sm:mt-11"
        >
          <Button href="#favorites">{copy.ctaMenu}</Button>
          <Button as="a" href="#visit" variant="ghost">
            {copy.ctaDirections}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// "More than a coffee stop" as the first block of the page, in the original
// story style (each paragraph lights up as it crosses the middle of the
// screen). The page scrolls normally — nothing is pinned.
function Story({ t }) {
  const [heading1, heading2] = t.story.heading;
  return (
    // phones: the bottom padding leaves the finished bowl in view before the
    // Favorites menu comes in
    <div id="story" className="px-6 pt-32 pb-[52vh] sm:px-10 lg:pb-20 lg:min-h-screen lg:pt-40 lg:pr-4 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
      <Eyebrow>{t.story.eyebrow}</Eyebrow>
      <motion.h1
        key={heading1}
        initial="hidden"
        animate="visible"
        variants={lineVariants}
        className="mt-6 font-display text-4xl leading-[1.05] tracking-wide text-espresso uppercase sm:text-6xl"
      >
        <span className="block overflow-hidden">
          <motion.span variants={wordVariants} className="inline-block">
            {heading1}
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span variants={wordVariants} className="inline-block text-wine-soft">
            {heading2}
          </motion.span>
        </span>
      </motion.h1>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="my-8 block h-px w-32 origin-left bg-linear-to-r from-gold to-transparent"
      />
      <div className="flex flex-col gap-10 lg:gap-24">
        <StoryBlock>{t.story.p1}</StoryBlock>
        <StoryBlock>{t.story.p2}</StoryBlock>
        <StoryBlock isLast>{t.story.p3}</StoryBlock>
      </div>

      {/* what you'll find — light cards so they stay legible over the
          animation on phones */}
      <div className="mt-16 lg:mt-24">
        <Eyebrow>{t.story.highlightsEyebrow}</Eyebrow>
        <ul className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {t.story.highlights.map((h) => (
            // phones: always light — they sit on the light footage, also in
            // dark mode; desktop: on the page itself, so they follow the theme
            <li
              key={h.title}
              className="rounded-2xl border border-[#1f1810]/10 bg-[#faf9f5]/80 px-5 py-4 backdrop-blur-sm lg:border-espresso/10 lg:bg-paper-2/60 lg:backdrop-blur-none"
            >
              <p className="font-display text-lg tracking-wide text-[#1f1810] uppercase lg:text-espresso">{h.title}</p>
              <p className="mt-1 text-sm leading-relaxed font-light text-[#1f1810]/70 lg:text-espresso/65">{h.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// `children` = what follows the hero when there is no hero animation
// (HomeTemplate passes the divider + StorySection + Favorites).
export default function Hero({ children }) {
  const { t, lang } = useT();

  // 1) HERO_SEQUENCE set → HeroScene: the story and the Favorites menu scroll
  //    normally next to the animation (desktop) / over it (phones); its last
  //    frame lands right before Full Menu.
  const heroSeq = HERO_SEQUENCE ? SCROLL_SEQUENCES[HERO_SEQUENCE] : null;
  if (heroSeq) {
    return (
      <HeroScene
        seq={heroSeq}
        stages={heroSeq.stages?.[lang] ?? heroSeq.stages?.en ?? []}
        story={<Story t={t} />}
        after={<MenuSection singleColumn />}
      />
    );
  }

  // 2) Otherwise the page-wide animation (ScrollVideoBackground, see
  //    HomeTemplate) shows through on the right. Its colour tokens keep the
  //    copy legible on the light footage, also in dark mode.
  const pageSeq = PAGE_BACKGROUND ? SCROLL_SEQUENCES[PAGE_BACKGROUND] : null;
  const copy = { ...t.hero, ...(pageSeq?.hero?.[lang] ?? pageSeq?.hero?.en) };
  return (
    <>
      <section
        id="top"
        // phones: copy at the top, so the cup (anchored low) stays visible
        className="relative flex min-h-screen items-start overflow-hidden md:items-center"
        style={pageSeq?.cssVars}
      >
        <HeroCopy copy={copy} />
      </section>
      {children}
    </>
  );
}
