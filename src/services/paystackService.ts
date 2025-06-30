
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
    
    if (!this.publicKey || !this.secretKey) {
      console.warn('Paystack keys not configured. Payment functionality will be limited.');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(data: PaymentData): Promise<PaystackResponse> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          amount: data.amount * 100, // Convert to kobo/cents
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment initialization failed');
      }

      return result;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaystackResponse> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment verification failed');
      }

      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  async openPaymentModal(
    data: PaymentData, 
    onSuccess: (response: any) => void, 
    onClose: () => void
  ): Promise<void> {
    if (!this.publicKey) {
      throw new Error('Paystack public key not configured');
    }

    // Check if Paystack script is loaded
    if (typeof window === 'undefined' || !(window as any).PaystackPop) {
      throw new Error('Paystack script not loaded. Please include the Paystack script in your HTML.');
    }

    try {
      // @ts-ignore - Paystack is loaded via script
      const handler = PaystackPop.setup({
        key: this.publicKey,
        email: data.email,
        amount: data.amount * 100, // Convert to kobo/cents
        currency: data.currency || 'NGN',
        metadata: data.metadata,
        callback: (response: any) => {
          console.log('Payment successful:', response);
          onSuccess(response);
        },
        onClose: () => {
          console.log('Payment modal closed');
          onClose();
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Failed to open payment modal:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!(this.publicKey && this.secretKey);
  }
}

export const paystackService = new PaystackService();
