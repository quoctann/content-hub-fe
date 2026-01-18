import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/50">
      <div className="container flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground">
          Content Hub — Your personal content library
        </p>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <span className="text-muted-foreground">•</span>
          <a 
            href="mailto:contact@example.com" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
