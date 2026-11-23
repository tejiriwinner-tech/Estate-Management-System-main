'use client';

import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { EstateServiceBillingItem } from '@/types/estateServicesBilling';

interface AddEstateServiceBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newService: EstateServiceBillingItem) => void;
}

export const AddEstateServiceBillingModal: React.FC<AddEstateServiceBillingModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Waste Management');
  const [cost, setCost] = useState('5000');
  const [paymentSchedule, setPaymentSchedule] = useState<'Monthly' | 'Weekly' | '3 Weeks' | 'Quarterly' | 'Yearly'>('Monthly');
  const [subText, setSubText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numericCost = parseFloat(cost) || 5000;
    const randomPlanCode = `PLN_${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newService: EstateServiceBillingItem = {
      id: `esb-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'General Utilities',
      cost: numericCost,
      paymentSchedule,
      subText: subText.trim() || `${paymentSchedule} recurring estate utility service`,
      paystack: {
        planCode: randomPlanCode,
        totalSubscribers: 150,
        paidCount: 140,
        overdueCount: 10,
        totalCollected: numericCost * 140,
        totalExpected: numericCost * 150,
        collectionRate: 93.3,
        lastSettlementDate: new Date().toISOString().split('T')[0],
        status: 'active'
      }
    };

    onAdd(newService);
    setName('');
    setCost('5000');
    setSubText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#B22222] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Add Estate Service</h3>
              <p className="text-xs text-red-100">Configure new billing item for Paystack collection</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Service Name *
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Trash Disposal, Water Bill, Security"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222]"
              >
                <option value="Waste Management">Waste Management</option>
                <option value="Power & Utilities">Power & Utilities</option>
                <option value="Estate Security">Estate Security</option>
                <option value="Piped Cooking Gas">Piped Cooking Gas</option>
                <option value="Water Services">Water Services</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Cost (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₦</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Payment Schedule *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <select
                value={paymentSchedule}
                onChange={(e) => setPaymentSchedule(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="3 Weeks">3 Weeks</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description / Zone (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="e.g. Zone B residential cluster refuse"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#B22222] hover:bg-[#8B0000] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
              <span>Save & Connect Paystack</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
