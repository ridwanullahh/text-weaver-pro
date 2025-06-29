
interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface PaymentData {
  amount: number;
  email: string;
  currency?: string;
  callback_url?: string;
  metadata?: any;
}

class PaystackService {
  private publicKey: string;
  private secretKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
    this.secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(data: PaymentData): Promise<PaystackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          amount: data.amount * 100, // Convert to kobo
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(reference: string): Promise<PaystackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw new Error('Payment verification failed');
    }
  }

  openPaymentModal(data: PaymentData, onSuccess: (response: any) => void, onClose: () => void) {
    // @ts-ignore - Paystack is loaded via script
    const handler = PaystackPop.setup({
      key: this.publicKey,
      email: data.email,
      amount: data.amount * 100,
      currency: data.currency || 'NGN',
      metadata: data.metadata,
      callback: onSuccess,
      onClose: onClose,
    });

    handler.openIframe();
  }
}

export const paystackService = new PaystackService();
