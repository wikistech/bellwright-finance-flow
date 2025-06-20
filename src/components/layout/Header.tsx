
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  transparent?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ transparent = false, onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className={`w-full py-4 ${transparent ? 'absolute top-0 left-0 z-10' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={onMenuClick}
            >
              <Menu size={20} />
            </Button>
          )}
          <Link to="/" className="flex items-center">
            <span className={`text-2xl font-bold ${transparent ? 'text-white' : 'text-finance-primary'}`}>
              Bellwright Finance
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/admin" className={`flex items-center space-x-1 ${transparent ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-finance-primary'} transition-colors`}>
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant={transparent ? "outline" : "ghost"} className={transparent ? "text-white border-white hover:bg-white/20" : ""}>
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant={transparent ? "outline" : "ghost"} 
                className={transparent ? "text-white border-white hover:bg-white/20" : ""}
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant={transparent ? "outline" : "ghost"} className={transparent ? "text-white border-white hover:bg-white/20" : ""}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className={transparent ? "bg-white text-finance-primary hover:bg-gray-100" : ""}>
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
