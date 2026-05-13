"use client";

import React from 'react';
import { Carousel } from 'primereact/carousel';

export const BannerCarousel: React.FC = () => {
    const banners = ['banner.png', 'banner1.png', 'banner2.png'];

    const itemTemplate = (item: string) => (
        <div className="mx-4">
            <div className="w-full h-56 bg-white rounded-[32px] border border-slate-100 overflow-hidden relative group shadow-sm flex items-center justify-center cursor-pointer transition-all hover:shadow-xl hover:shadow-[#3E2723]/5">
                <div className="text-center z-10 transition-opacity group-hover:opacity-0 absolute">
                    <span className="block text-slate-200 font-black uppercase tracking-[0.3em] text-sm italic">System Bulletin</span>
                </div>
                <img 
                    src={`/${item}`} 
                    className="absolute inset-0 w-full h-full object-cover z-20 transition-transform duration-1000 group-hover:scale-110" 
                    alt="Promo Banner" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/20 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        </div>
    );

    return (
        <footer className="w-full mt-20 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <div className="flex items-center gap-4 mb-8 px-4">
                <div className="w-8 h-[1px] bg-[#DDB892]"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Internal Communications & Safety</p>
            </div>
            <Carousel 
                value={banners} 
                numVisible={3} 
                numScroll={1} 
                circular 
                autoplayInterval={5000} 
                showNavigators={false}
                showIndicators={true}
                className="w-full"
                itemTemplate={itemTemplate}
                responsiveOptions={[
                    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
                    { breakpoint: '600px', numVisible: 1, numScroll: 1 }
                ]}
            />
        </footer>
    );
};
