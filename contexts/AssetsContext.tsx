// contexts/AssetsContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AssetsContextType {
  assetVersion: number;

  refreshAssets: () => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

interface AssetsProviderProps {
  children: ReactNode;
}

export const AssetsProvider = ({ children }: AssetsProviderProps) => {
  const [assetVersion, setAssetVersion] = useState<number>(0);

  const refreshAssets = () => {
    setAssetVersion((prev) => prev + 1);
  };

  return (
    <AssetsContext.Provider value={{ assetVersion, refreshAssets }}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = (): AssetsContextType => {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error('useAssetsmust be within AssetsProvider');
  }
  return context;
};
