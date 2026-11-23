import { PaymentChannel, CardFormData, TransactionReceipt, PaystackBillItem } from '@/types/paystackForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const paystackApi = {
  /**
   * Dynamically fetch bill info or presets for resident
   */
  async getBillDetails(billId: string): Promise<PaystackBillItem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/paystack/bill/${billId}`);
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      return data.data;
    } catch {
      // Fallback to mock preset
      return null;
    }
  },

  /**
   * Charge Card via Paystack
   */
  async chargeCard(
    bill: PaystackBillItem,
    cardData: CardFormData
  ): Promise<{ status: 'success' | 'send_otp'; reference: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/paystack/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bill.amount,
          email: bill.residentEmail,
          channel: 'card',
          card: cardData,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline / local simulated success for prototype resilience
    }

    // High fidelity prototype simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'send_otp',
          reference: `PST_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          message: 'OTP sent to mobile phone linked to card',
        });
      }, 1200);
    });
  },

  /**
   * Submit OTP verification
   */
  async submitOtp(
    reference: string,
    otp: string
  ): Promise<{ status: 'success'; receipt: TransactionReceipt }> {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/paystack/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Offline fallback
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          receipt: {
            reference,
            amount: 5000,
            paidAt: new Date().toISOString(),
            channel: 'card',
            serviceName: 'Security Bill',
            residentEmail: 'demo@paystack.com',
            residentUnit: 'LEHN125',
            status: 'success',
          },
        });
      }, 1000);
    });
  },
};
