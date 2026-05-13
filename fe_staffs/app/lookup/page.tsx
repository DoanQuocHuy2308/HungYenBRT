"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { 
   ArrowLeft, Search, Ticket, CalendarDays, User, IdCard, Phone,
   MapPin, Clock, CreditCard, Mail, CheckCircle, XCircle, 
   AlertTriangle, Filter, ChevronDown, FileText, ScanLine, Hash
} from 'lucide-react';

import { TicketSearchSidebar } from '../../components/features/lookup/TicketSearchSidebar';
import { TicketDetailPanel } from '../../components/features/lookup/TicketDetailPanel';
import { PageWrapper } from '../../components/layout/PageWrapper';

export default function LookupPage() {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedTicket, setSelectedTicket] = useState<any>(null);
   const [tickets, setTickets] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch('http://localhost:3000/ticket-scan/all')
         .then(res => res.json())
         .then(res => {
            if(res.success) setTickets(res.data);
            setLoading(false);
         })
         .catch(e => {
            console.error(e);
            setLoading(false);
         });
   }, []);

   const filtered = tickets.filter(t => {
      const matchQuery = !searchQuery.trim() || 
         t.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         t.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         t.customer?.phone?.includes(searchQuery) ||
         t.customer?.cccd?.includes(searchQuery);
      return matchQuery;
   });

   return (
      <PageWrapper 
         title="Tra Cứu Vé" 
         description="Truy xuất dữ liệu bản ghi vé lượt và vé thời gian từ hệ thống terminal trung tâm."
      >
         <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-170px)]">
            {/* Left: Search & Results List */}
            <div className="w-full md:w-[400px] lg:w-[450px] border-r border-slate-200 relative flex flex-col h-full bg-slate-50">
               {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                     <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                     <span className="mt-3 text-slate-500 font-semibold text-sm">Đang tải dữ liệu...</span>
                  </div>
               )}
               <TicketSearchSidebar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredTickets={filtered}
                  selectedTicketCode={selectedTicket?.code}
                  onSelectTicket={setSelectedTicket}
               />
            </div>

            {/* Right: Detail Panel */}
            <div className="flex-1 bg-white overflow-y-auto h-full">
               <TicketDetailPanel 
                  ticket={selectedTicket} 
                  onClose={() => setSelectedTicket(null)}
               />
            </div>
         </div>
      </PageWrapper>
   );
}
