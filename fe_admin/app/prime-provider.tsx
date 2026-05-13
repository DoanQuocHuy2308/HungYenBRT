"use client";

import { PrimeReactProvider } from 'primereact/api';

// Core UI Styles
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider>
      {children}
    </PrimeReactProvider>
  );
}
