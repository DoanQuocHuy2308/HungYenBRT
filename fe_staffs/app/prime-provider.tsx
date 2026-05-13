"use client";

import { PrimeReactProvider } from 'primereact/api';
import React from 'react';

export default function AppProvider({ children }: { children: React.ReactNode }) {
    return <PrimeReactProvider value={{ ripple: true }}>{children}</PrimeReactProvider>;
}
