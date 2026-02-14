import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/50">
      <div className="container flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground">
          made with 💔 2026
        </p>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
            giới thiệu
          </Link>
          <span className="text-muted-foreground">•</span>
          <a 
            href="mailto:contact.tantranquoc@gmail.com" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            liên hệ
          </a>
        </nav>
      </div>
    </footer>
  );
}
