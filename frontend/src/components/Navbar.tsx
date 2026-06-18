import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, User, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const handleMenuNavigate = (path: string) => {
    setIsUserMenuOpen(false);
    navigate(path);
  };

  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'provider'
      ? '/provider/dashboard'
      : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-[#1a4d2e] p-2 rounded-lg">
            <Home className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">ServeSmart</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#1a4d2e]">Home</Link>
          <Link to="/services" className="text-sm font-medium text-gray-600 hover:text-[#1a4d2e]">Services</Link>
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d2e]"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                <User className="h-5 w-5" />
              </button>
              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 z-50 min-w-48 rounded-lg border bg-white p-1 text-sm text-gray-900 shadow-lg"
                >
                {user.role === 'admin' && (
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleMenuNavigate('/admin')}
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-100"
                  onClick={() => handleMenuNavigate(dashboardPath)}
                >
                  Dashboard
                </button>
                {user.role === 'provider' && (
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleMenuNavigate('/provider/services')}
                  >
                    Manage Services
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-[#1a4d2e] hover:bg-[#143d24] text-white rounded-full px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center outline-none">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/services" className="text-lg font-medium">Services</Link>
                {user ? (
                  <>
                    <Link 
                      to={dashboardPath} 
                      className="text-lg font-medium"
                    >
                      Dashboard
                    </Link>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-medium">Login</Link>
                    <Link to="/register" className="text-lg font-medium">Sign Up</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
