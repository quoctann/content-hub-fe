import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, FileText, Image, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/hooks/use-theme';
import traime from '@/assets/traime.png';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { label: 'văn mẫu', href: '/search?type=text', icon: FileText },
    { label: 'hình ảnh', href: '/search?type=image', icon: Image },
    { label: 'giới thiệu', href: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <img src={traime} alt="Logo" />
          </div>
          <span className="text-lg font-semibold text-foreground">me me</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {menuItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-6 pt-6 mx-auto">
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border pt-4">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={toggleTheme}>
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-5 w-5" />
                      dảk theme
                    </>
                  ) : (
                    <>
                      <Sun className="h-5 w-5" />
                      light theme
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
