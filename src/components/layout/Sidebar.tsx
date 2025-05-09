
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  Users, 
  Settings,
  ArrowLeft,
  ArrowRight,
  Menu 
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Loans",
    href: "/loans",
    icon: Calendar,
  },
  {
    title: "Referrals",
    href: "/referrals",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-finance-primary text-white border-r relative",
      collapsed ? "w-16" : "w-64",
      isMobile && mobileMenuOpen ? "fixed z-50 w-64" : "",
      isMobile && !mobileMenuOpen ? "w-16" : "",
      "transition-all duration-300 ease-in-out"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-finance-secondary">
        {(!collapsed || (isMobile && mobileMenuOpen)) && (
          <div className="font-bold text-xl">Bellwright</div>
        )}
        
        {isMobile ? (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-finance-secondary ml-auto"
            onClick={toggleMobileMenu}
          >
            <Menu size={20} />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-finance-secondary ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </Button>
        )}
      </div>

      <nav className={cn("flex-1 p-2", isMobile && !mobileMenuOpen && !collapsed ? "hidden" : "")}>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center py-3 px-3 rounded-md transition-colors",
                  isActive 
                    ? "bg-white text-finance-primary font-medium" 
                    : "text-white hover:bg-finance-secondary",
                )}
              >
                <item.icon className={cn("h-5 w-5", (collapsed && !mobileMenuOpen) ? "mx-auto" : "mr-3")} />
                {(!collapsed || (isMobile && mobileMenuOpen)) && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-finance-secondary">
        {(!collapsed || (isMobile && mobileMenuOpen)) && (
          <div className="text-sm text-gray-300">
            © 2025 Bellwright Finance
          </div>
        )}
      </div>
      
      {/* Overlay for mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Sidebar;
