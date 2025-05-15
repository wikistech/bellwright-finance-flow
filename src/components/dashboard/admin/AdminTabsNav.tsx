
import React from "react";
import { Button } from "@/components/ui/button";

interface AdminTabsNavProps {
  activeTab: 'users' | 'loans' | 'payments';
  onTabChange: (tab: 'users' | 'loans' | 'payments') => void;
}

export function AdminTabsNav({ activeTab, onTabChange }: AdminTabsNavProps) {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={activeTab === 'users' ? "default" : "outline"} 
        onClick={() => onTabChange('users')}
      >
        Users
      </Button>
      <Button 
        variant={activeTab === 'loans' ? "default" : "outline"} 
        onClick={() => onTabChange('loans')}
      >
        Loan Applications
      </Button>
      <Button 
        variant={activeTab === 'payments' ? "default" : "outline"} 
        onClick={() => onTabChange('payments')}
      >
        Payment Methods
      </Button>
    </div>
  );
}
