import React, { useState } from 'react';
import { MapPin, Target, Locate, Search, X } from 'lucide-react';
import { Location } from '../../../services/pos.service';

interface StationSelectorProps {
    stations: Location[];
    departureId: number | null;
    destinationId: number | null;
    onSelect: (station: Location) => void;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
    stations,
    departureId,
    destinationId,
    onSelect
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStations = stations.filter(st => 
        st.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(st.order_index || st.Order || st.Id || (st as any).id).includes(searchQuery)
    );

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0 gap-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                        <MapPin size={20} className="text-indigo-600" /> Mạng lưới trạm dừng
                    </h2>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest opacity-80 mt-1">
                        Chọn vị trí để xác định hành trình
                    </p>
                </div>

                <div className="flex-1 max-w-sm relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
                    <input 
                        type="text"
                        placeholder="Tìm tên trạm hoặc số hiệu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all placeholder:text-slate-300 placeholder:font-medium"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {destinationId && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl animate-in zoom-in-95 duration-300">
                        <Target size={14} className="text-emerald-600" />
                        <span className="text-emerald-700 font-black text-[9px] uppercase tracking-widest">Hành trình đã chọn</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 pb-8 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {filteredStations.length > 0 ? (
                    filteredStations.map((st) => {
                        const id = st.Id || (st as any).id;
                        const isDeparture = id === departureId;
                        const isDestination = id === destinationId;
                        
                        return (
                            <button
                                key={id}
                                onClick={() => onSelect(st)}
                                disabled={isDeparture}
                                className={`
                                    group relative h-28 rounded-2xl border-2 transition-all duration-300 text-left
                                    ${isDeparture
                                        ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
                                        : isDestination
                                            ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/10 scale-[1.02] z-10'
                                            : 'bg-white border-slate-100 hover:border-indigo-600 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <div className="p-5 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            font-black text-[10px] tabular-nums tracking-widest
                                            ${isDestination ? 'text-slate-400' : 'text-slate-300'}
                                        `}>
                                            #{String(st.order_index || st.Order || id).padStart(2, '0')}
                                        </span>
                                        {isDeparture && <Locate size={12} className="text-indigo-600" />}
                                    </div>
                                    
                                    <span className={`
                                        font-black text-[13px] leading-tight tracking-tight uppercase line-clamp-2
                                        ${isDestination ? 'text-white' : 'text-slate-900'}
                                    `}>
                                        {st.Name}
                                    </span>
                                </div>
                                
                                {/* Selection indicator dot */}
                                {isDestination && (
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                )}
                            </button>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Không tìm thấy trạm phù hợp</p>
                    </div>
                )}
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Hệ thống sẵn sàng</span>
                </div>
                <div className="flex items-center gap-4">
                    {searchQuery && (
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                            Kết quả: {filteredStations.length}
                        </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">Hưng Yên BRT • Workstation</span>
                </div>
            </div>
        </div>
    );
};
