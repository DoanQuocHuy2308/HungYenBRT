import React from 'react';
import { ReceiptText, ArrowRight, Ticket, Minus, Plus, CreditCard, Banknote } from 'lucide-react';
import { StaffButton } from '../../ui/StaffButton';
import { Location } from '../../../services/pos.service';

interface ReceiptPanelProps {
    departure: Location | null;
    destination: Location | null;
    quantity: number;
    setQuantity: (q: number) => void;
    unitPrice: number;
    onBuy: () => void;
    loading?: boolean;
}

export const ReceiptPanel: React.FC<ReceiptPanelProps> = ({
    departure,
    destination,
    quantity,
    setQuantity,
    unitPrice,
    onBuy,
    loading = false
}) => {
    const total = quantity * unitPrice;

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200">
            <div className="p-10 flex flex-col h-full">
                <div className="mb-10 shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                        <ReceiptText size={20} className="text-indigo-600" />
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Biên nhận POS</h2>
                    </div>
                    <div className="w-full h-px bg-slate-100"></div>
                </div>

                {/* Journey Visualization */}
                <div className="mb-10 shrink-0">
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200"></div>
                            <div className="w-0.5 h-8 bg-slate-200"></div>
                            <div className={`w-2.5 h-2.5 rounded-full ${destination ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="mb-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1.5">Trạm đi (Origin)</span>
                                <p className="font-black text-slate-900 text-sm uppercase truncate tracking-tight">{departure?.Name || 'System Error'}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1.5">Trạm đến (Target)</span>
                                <p className={`font-black text-sm uppercase truncate tracking-tight ${destination ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                                    {destination?.Name || 'Đang đợi chọn...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets & Quantity */}
                <div className="space-y-4 mb-10 shrink-0">
                    <div className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl">
                        <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cấu hình vé</span>
                            <span className="font-black text-slate-900 text-[11px] uppercase tracking-tight">Vé lượt đồng nhất</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                            <button
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                className="w-8 h-8 hover:bg-white hover:shadow-sm rounded-lg flex items-center justify-center text-slate-500 transition-all active:scale-90"
                            >
                                <Minus size={16} strokeWidth={3} />
                            </button>
                            <span className="font-black text-xl text-slate-900 w-8 text-center tabular-nums">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-8 hover:bg-white hover:shadow-sm rounded-lg flex items-center justify-center text-slate-500 transition-all active:scale-90"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settlement Terminal */}
                <div className="mt-auto space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá trạm</span>
                        <span className="text-slate-900 font-black text-base tabular-nums">{unitPrice.toLocaleString()} ₫</span>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="relative z-10">
                            <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Tổng thanh toán</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-white font-black text-5xl tracking-tighter tabular-nums">
                                    {total.toLocaleString()}
                                </span>
                                <span className="text-xl text-indigo-400 font-black opacity-80">VNĐ</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <StaffButton 
                            label={destination ? "PHÁT HÀNH VÉ" : "ĐỢI XÁC ĐỊNH TRẠM"}
                            loading={loading}
                            disabled={!destination}
                            icon={<Ticket size={22} />}
                            className={`
                                w-full h-16 text-sm uppercase font-black tracking-widest rounded-2xl transition-all duration-300
                                ${destination ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 active:scale-[0.98]' : 'bg-slate-100 text-slate-400'}
                            `}
                            onClick={onBuy}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
