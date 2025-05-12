
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  verificationCode: string;
  isVerified: boolean;
  paymentInfoSubmitted: boolean;
}

interface RegistrationContextType {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  resetRegistrationData: () => void;
}

const initialRegistrationData: RegistrationData = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  verificationCode: '',
  isVerified: false,
  paymentInfoSubmitted: false,
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(() => {
    // Try to load from localStorage on init
    const savedData = localStorage.getItem('registrationData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        return initialRegistrationData;
      }
    }
    return initialRegistrationData;
  });

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData(prev => {
      const updated = { ...prev, ...data };
      // Save to localStorage for persistence
      localStorage.setItem('registrationData', JSON.stringify(updated));
      return updated;
    });
  };

  const resetRegistrationData = () => {
    localStorage.removeItem('registrationData');
    setRegistrationData(initialRegistrationData);
  };

  return (
    <RegistrationContext.Provider value={{ registrationData, updateRegistrationData, resetRegistrationData }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
