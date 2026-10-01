import Header from '../organisms/Header';
import MobileMenu from '../organisms/MobileMenu';
import CartDrawer from '../organisms/CartDrawer';
import CheckoutModal from '../organisms/CheckoutModal';
import CustomizeModal from '../organisms/CustomizeModal';
import IntroCurtain from '../organisms/IntroCurtain';
import EmberField from '../atoms/EmberField';
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
  const { t } = useT();
  useThemeSync();

  return (
    <LightboxProvider>
      <IntroCurtain />
      <CustomCursor />
      <EmberField />
      <Header />
      <MobileMenu />
      <CartDrawer />
      <CheckoutModal />
      <CustomizeModal />
      <main>
        <Hero />
        <GoldDivider label={t.common.dividerLabel} />
        <StorySection />
        <MenuSection />
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
