import logo from '../assets/logo-maybe-transparent.png';

export default function Nav() {
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <div className="brand-group">
          <img src={logo} alt="Maybe Café" className="brand-logo" />
        </div>
        <nav className="links">
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#events">Private Events</a>
          <a href="#gallery">Gallery</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#visit" className="btn btn-solid nav-cta">
          Visit Us
        </a>
      </div>
    </header>
  );
}
