"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { MainHeader } from './MainHeader';

interface PageWrapperProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    showNav?: boolean;
    requireAuth?: boolean;
    actions?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ 
    children, 
    title, 
    description,
    showNav = true,
    requireAuth = true,
    actions
}) => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(requireAuth);

    useEffect(() => {
        if (!requireAuth) {
            setIsLoading(false);
            return;
        }

        const loadUser = () => {
            const token = localStorage.getItem('staff_access_token');
            const dataStr = localStorage.getItem('staff_data');

            if (!token) {
                router.push('/login');
            } else if (dataStr) {
                setCurrentUser(JSON.parse(dataStr));
                setIsLoading(false);
            }
        };

        loadUser();

        const handleStaffUpdate = () => loadUser();
        window.addEventListener('staff_data_updated', handleStaffUpdate);
        return () => window.removeEventListener('staff_data_updated', handleStaffUpdate);
    }, [router, requireAuth]);

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Hệ thống đang khởi động...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Toast ref={toast} position="top-right" />
            
            {showNav && <MainHeader currentUser={currentUser} />}

            <main className={`
                flex-1 overflow-y-auto custom-scrollbar
                max-w-screen-2xl mx-auto w-full px-8 
                ${showNav ? 'pt-8 pb-20' : 'py-0'}
                transition-all duration-500
            `}>
                {(title || description || actions) && (
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            {title && (
                                <h2 className="text-[#3E2723] text-4xl font-black tracking-tight mb-2 uppercase">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-slate-400 font-bold text-base tracking-tight max-w-2xl">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && (
                            <div className="flex items-center gap-3 shrink-0">
                                {actions}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                /* Global overrides for professional minimalist look */
                .p-toast {
                    z-index: 1000 !important;
                }
                .p-toast-message {
                    border-radius: 1.2rem !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.06) !important;
                    border: 1px solid rgba(0,0,0,0.05) !important;
                }
                .p-toast-message-content {
                    padding: 1.25rem !important;
                }
                .p-toast-summary {
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    font-size: 11px !important;
                    margin-bottom: 4px !important;
                }
                .p-toast-detail {
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    opacity: 0.8 !important;
                }
                
                /* Custom Thin Scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #DDB892;
                }
            `}</style>
        </div>
    );
};
