'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard,
  DollarSign,
  Filter,
  RefreshCw
} from 'lucide-react';
import { EstateServicesBillingTable } from '@/components/estate-services/EstateServicesBillingTable';
import { ServicePaystackStatusModal } from '@/components/estate-services/ServicePaystackStatusModal';
import { AddEstateServiceBillingModal } from '@/components/estate-services/AddEstateServiceBillingModal';
import { mockEstateServicesBilling } from '@/data/mockEstateServicesBilling';
import { EstateServiceBillingItem } from '@/types/estateServicesBilling';

export default function EstateServicesBillingPage() {
  const [services, setServices] = useState<EstateServiceBillingItem[]>(mockEstateServicesBilling);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('All');
  const [statusModalService, setStatusModalService] = useState<EstateServiceBillingItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddService = (newService: EstateServiceBillingItem) => {
    setServices((prev) => [newService, ...prev]);
    showToast(`Service "${newService.name}" created and synced with Paystack!`);
  };

  const handleDeleteService = (serviceId: string) => {
    const target = services.find((s) => s.id === serviceId);
    if (!target) return;

    if (window.confirm(`Are you sure you want to remove "${target.name}" (${target.paymentSchedule})?`)) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      showToast(`Removed "${target.name}" from billing schedule.`);
    }
  };

  // Filter & Search Logic
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subText && item.subText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSchedule = selectedSchedule === 'All' || item.paymentSchedule === selectedSchedule;

      return matchesSearch && matchesSchedule;
    });
  }, [services, searchQuery, selectedSchedule]);

  // Aggregate Stats
  const totalVolume = services.reduce((acc, s) => acc + s.paystack.totalCollected, 0);
  const averageCompliance = services.length 
    ? (services.reduce((acc, s) => acc + s.paystack.collectionRate, 0) / services.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B22222] uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4 text-[#C9A227]" />
            <span>Finance & Billing Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Estate Services Billing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage scheduled resident utility fees, recurring costs, and live Paystack settlement collection status.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 border border-gray-200/60 flex items-center justify-center flex-shrink-0 text-[#B22222]">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Configured Services
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{services.length}</span>
            <span className="text-[10px] text-emerald-600 block font-medium">All active in billing cycle</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Inflow Volume
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-800">
              ₦{(totalVolume / 1000000).toFixed(2)}M
            </span>
            <span className="text-[10px] text-gray-400 block font-medium">Live Paystack collections</span>
          </div>
        </div>

        {/* Avg Compliance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Avg. Compliance
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{averageCompliance}%</span>
            <span className="text-[10px] text-emerald-600 block font-medium">+3.4% vs last period</span>
          </div>
        </div>

        {/* Paystack Gateway Sync */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Paystack Gateway
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-800">Operational</span>
            </div>
            <span className="text-[10px] text-gray-400 block font-medium">Automated splits active</span>
          </div>
        </div>
      </div>

      {/* Main Table Card (Figma Content Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        {/* Header row in card matching Figma title and Add Service button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Estate Services
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing active estate billing tariffs, rates, and resident collection frequency.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or categories..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222] transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3 h-3" /> Schedule:
            </span>
            {['All', 'Monthly', 'Weekly', '3 Weeks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedSchedule(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  selectedSchedule === tab
                    ? 'bg-[#B22222] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Mobile Cards */}
        <EstateServicesBillingTable
          services={filteredServices}
          onOpenStatus={(service) => setStatusModalService(service)}
          onDelete={handleDeleteService}
        />
      </div>

      {/* Modals */}
      <ServicePaystackStatusModal
        service={statusModalService}
        isOpen={!!statusModalService}
        onClose={() => setStatusModalService(null)}
      />

      <AddEstateServiceBillingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddService}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1A1A1A] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-fadeIn border border-[#C9A227]/30">
          <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
