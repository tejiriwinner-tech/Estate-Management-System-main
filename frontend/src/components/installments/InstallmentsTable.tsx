'use client';

import React from 'react';
import { Eye, ExternalLink, CheckCircle2, AlertTriangle, Clock, Shield } from 'lucide-react';
import { InstallmentPlanItem } from '@/types/installmentPlan';

interface InstallmentsTableProps {
  items: InstallmentPlanItem[];
  onViewDetails: (item: InstallmentPlanItem) => void;
  onPaystackAction: (item: InstallmentPlanItem) => void;
}

export const InstallmentsTable: React.FC<InstallmentsTableProps> = ({
  items,
  onViewDetails,
  onPaystackAction,
}) => {
  return (
    <div className="w-full">
      {/* Desktop Data Table (>= md) */}
      <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              <th className="py-4 px-6">Security Bill</th>
              <th className="py-4 px-6">Month</th>
              <th className="py-4 px-6">Paid</th>
              <th className="py-4 px-6">Installment Plan</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {items.map((item) => (
              <tr 
                key={item.id}
                className="hover:bg-gray-50/60 transition-colors group"
              >
                {/* Security Bill (Unit Code) */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B22222]/10 group-hover:border-[#B22222]/30 transition-colors">
                      <Shield className="w-4 h-4 text-[#B22222]" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#B22222] transition-colors">
                        {item.unitCode}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.residentName}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Month (utd / nutd) */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                    item.monthTerm === 'utd'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  }`}>
                    {item.monthTerm.toUpperCase()} ({item.monthTerm === 'utd' ? 'Up-to-Date' : 'Not Up-to-Date'})
                  </span>
                </td>

                {/* Paid */}
                <td className="py-4 px-6">
                  <div className={`font-bold ${item.totalPaid > 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                    NGN{item.totalPaid.toLocaleString()}
                  </div>
                </td>

                {/* Installment Plan */}
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-700">
                    NGN{item.installmentAmount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400">4 installments/mo</div>
                </td>

                {/* Status Pill matching wireframe (paid, processing, defult) */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    item.status === 'paid'
                      ? 'bg-emerald-600 text-white'
                      : item.status === 'processing'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {item.status === 'default' ? 'defult' : item.status}
                  </span>
                </td>

                {/* Action Buttons matching wireframe (Eye green + External red) */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {/* View Details Eye Button (Green) */}
                    <button
                      onClick={() => onViewDetails(item)}
                      className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm hover:shadow transition-all"
                      title="View Installment Milestones"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Paystack Checkout / Share Action Button (Red) */}
                    <button
                      onClick={() => onPaystackAction(item)}
                      className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-sm hover:shadow transition-all"
                      title="Paystack Checkout Action"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-[#B22222]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{item.unitCode}</h4>
                  <p className="text-xs text-gray-400">{item.residentName}</p>
                </div>
              </div>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                item.status === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : item.status === 'processing'
                  ? 'bg-amber-500 text-white'
                  : 'bg-red-600 text-white'
              }`}>
                {item.status === 'default' ? 'defult' : item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-50 text-center">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-medium block">Month</span>
                <span className={`text-xs font-bold ${item.monthTerm === 'utd' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {item.monthTerm.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-medium block">Paid</span>
                <span className="text-xs font-bold text-gray-900">
                  NGN{item.totalPaid.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-medium block">Installment</span>
                <span className="text-xs font-bold text-gray-900">
                  NGN{item.installmentAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-gray-400">
                Plan: <code className="font-mono text-gray-600 font-semibold">{item.paystackPlanCode}</code>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewDetails(item)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onPaystackAction(item)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Action</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
