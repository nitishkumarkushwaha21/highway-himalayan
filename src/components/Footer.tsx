export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <span className="footer__logo">Drishya Trails</span>
          <p className="footer__tagline">Where the road becomes the story.</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Journey</h4>
            <a href="#shimla">Shimla</a>
            <a href="#manali">Manali</a>
            <a href="#spiti">Spiti Valley</a>
            <a href="#ladakh">Ladakh</a>
          </div>
          <div className="footer__col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Safety</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div className="footer__col">
            <h4>Connect</h4>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
            <a href="#">WhatsApp</a>
            <a href="#">Email us</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 Drishya Trails. All rights reserved.</span>
        <span className="footer__separator">·</span>
        <a href="#">Privacy</a>
        <span className="footer__separator">·</span>
        <a href="#">Terms</a>
      </div>
    </footer>
  );
}
