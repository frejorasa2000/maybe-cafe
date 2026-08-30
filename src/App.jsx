import './App.css';
import { LightboxProvider } from './components/Lightbox';
import Nav from './components/Nav';
import Hero from './components/Hero';
import StatsStrip from './components/StatsStrip';
import Story from './components/Story';
import Menu from './components/Menu';
import Visit from './components/Visit';
import FullMenu from './components/FullMenu';
import Events from './components/Events';
import EventRequestForm from './components/EventRequestForm';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <LightboxProvider>
      <Nav />
      <Hero />
      <StatsStrip />
      <Story />
      <Menu />
      <Visit />
      <FullMenu />
      <Events />
      <EventRequestForm />
      <Gallery />
      <Reviews />
      <Contact />
      <Footer />
    </LightboxProvider>
  );
}
