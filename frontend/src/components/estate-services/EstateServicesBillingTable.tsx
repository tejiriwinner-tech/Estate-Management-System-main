'use client';

import React from 'react';
import { Trash2, Activity, Calendar, ShieldCheck, Zap, Trash, Flame } from 'lucide-react';
import { EstateServiceBillingItem } from '@/types/estateServicesBilling';

interface EstateServicesBillingTableProps {
  services: EstateServiceBillingItem[];
  onOpenStatus: (service: EstateServiceBillingItem) => void;
  onDelete: (serviceId: string) => void;
}

export const EstateServicesBillingTable: React.FC<EstateServicesBillingTableProps> = ({
  services,
  onOpenStatus,
  onDelete,
}) => {
  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('trash')) return <Trash className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('elect')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (lower.includes('sec')) return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    if (lower.includes('gas')) return <Flame className="w-4 h-4 text-orange-500" />;
    return <Calendar className="w-4 h-4 text-[#B22222]" />;
  };

  return (
    <div className="w-full">
      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              <th className="py-4 px-6">Services</th>
              <th className="py-4 px-6">Cost</th>
              <th className="py-4 px-6">Payment Schedule</th>
              <th className="py-4 px-6 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {services.map((item) => (
              <tr 
                key={item.id}
                className="hover:bg-gray-50/60 transition-colors group"
              >
                {/* Services Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B22222]/10 group-hover:border-[#B22222]/30 transition-colors">
                      {getServiceIcon(item.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-[#B22222] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.subText || item.category}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Cost Column */}
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-800">
                    ₦{item.cost.toLocaleString()}
                  </div>
                </td>

                {/* Payment Schedule Column */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.paymentSchedule === 'Monthly' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/50' 
                      : item.paymentSchedule === 'Weekly'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                      : 'bg-purple-50 text-purple-700 border border-purple-200/50'
                  }`}>
                    {item.paymentSchedule}
                  </span>
                </td>

                {/* View Actions Column (Delete + Status) */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Wireframe Red Delete Button */}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-sm hover:shadow transition-all"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Wireframe Green Status Button */}
                    <button
                      onClick={() => onOpenStatus(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm hover:shadow transition-all"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Status</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {services.map((item) => (
          <div 
            key={item.id}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {getServiceIcon(item.name)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                  <p className="text-xs text-gray-400">{item.subText || item.category}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                item.paymentSchedule === 'Monthly' 
                  ? 'bg-blue-50 text-blue-700' 
                  : item.paymentSchedule === 'Weekly'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-purple-50 text-purple-700'
              }`}>
                {item.paymentSchedule}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-gray-50 text-xs">
              <span className="text-gray-500 font-medium">Billing Cost</span>
              <span className="text-base font-bold text-gray-900">₦{item.cost.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-gray-500">
                Compliance: <strong className="text-emerald-600 font-bold">{item.paystack.collectionRate.toFixed(0)}%</strong>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDelete(item.id)}
                  className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-sm"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenStatus(item)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Status</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
