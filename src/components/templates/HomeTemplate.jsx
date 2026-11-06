import Header from '../organisms/Header';
import MobileMenu from '../organisms/MobileMenu';
import CartDrawer from '../organisms/CartDrawer';
import CheckoutModal from '../organisms/CheckoutModal';
import CustomizeModal from '../organisms/CustomizeModal';
import IntroCurtain from '../organisms/IntroCurtain';
import EmberField from '../atoms/EmberField';
// Scroll animations, configured in src/data/scrollSequences.js:
//   HERO_SEQUENCE   → pinned animation inside the hero (now 'acai-v2')
//   PAGE_BACKGROUND → whole-page fixed background ('caramel-latte',
//                     'iced-coffee', 'acai'; null = off)
import ScrollVideoBackground from '../atoms/ScrollVideoBackground';
import { PAGE_BACKGROUND, SCROLL_SEQUENCES } from '../../data/scrollSequences';
// Optional: a pinned section with its own animation + stage captions.
// To show the açaí as a second section further down, uncomment this import
// and the <ScrollFrameSequence> block below <MenuSection />:
// import ScrollFrameSequence from '../organisms/ScrollFrameSequence';
import CustomCursor from '../atoms/CustomCursor';
import Hero from '../organisms/Hero';
import GoldDivider from '../atoms/GoldDivider';
import StorySection from '../organisms/StorySection';
import MenuSection from '../organisms/MenuSection';
import FullMenuSection from '../organisms/FullMenuSection';
import GallerySection from '../organisms/GallerySection';
import EventsSection from '../organisms/EventsSection';
import ReviewsSection from '../organisms/ReviewsSection';
import ReservationSection from '../organisms/ReservationSection';
import VisitSection from '../organisms/VisitSection';
import Footer from '../organisms/Footer';
import { LightboxProvider } from '../organisms/Lightbox';
import { useT } from '../../hooks/useT';
import { useThemeSync } from '../../hooks/useThemeSync';

export default function HomeTemplate() {
  const { t, lang } = useT();
  useThemeSync();

  return (
    <LightboxProvider>
      <IntroCurtain />
      <CustomCursor />
      {PAGE_BACKGROUND && <ScrollVideoBackground {...SCROLL_SEQUENCES[PAGE_BACKGROUND]} />}
      <EmberField />
      <Header />
      <MobileMenu />
      <CartDrawer />
      <CheckoutModal />
      <CustomizeModal />
      <main>
        {/* With a hero animation (HERO_SEQUENCE) the hero renders the story
            and the Favorites menu itself, next to the animation — its last
            frame lands right before Full Menu. Without one, these follow. */}
        <Hero>
          <GoldDivider label={t.common.dividerLabel} />
          <StorySection />
          <MenuSection />
        </Hero>
        {/* Açaí scroll animation (disabled for now) — uncomment, together
            with the ScrollFrameSequence import at the top, to show it as a
            pinned section of its own:
        <ScrollFrameSequence
          id="acai"
          {...SCROLL_SEQUENCES.acai}
          stages={SCROLL_SEQUENCES.acai.stages[lang] ?? SCROLL_SEQUENCES.acai.stages.en}
        />
        */}
        <FullMenuSection />
        <GallerySection />
        <EventsSection />
        <ReviewsSection />
        <ReservationSection />
        <VisitSection />
      </main>
      <Footer />
    </LightboxProvider>
  );
}
