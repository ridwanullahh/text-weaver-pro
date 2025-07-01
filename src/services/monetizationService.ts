
import { useAuth } from '@/hooks/useAuth';

interface CostCalculation {
  totalCost: number;
  pagesCost: number;
  translationsCost: number;
  breakdown: {
    pages: number;
    translations: number;
    pagePrice: number;
    translationPrice: number;
  };
}

class MonetizationService {
  private readonly PAGE_PRICE = 0.10; // $0.10 per page
  private readonly TRANSLATION_PRICE = 0.05; // $0.05 per translation
  private readonly FREE_DAILY_TRANSLATIONS = 3;

  calculateExtractionCost(pages: number): CostCalculation {
    const pagesCost = pages * this.PAGE_PRICE;
    
    return {
      totalCost: pagesCost,
      pagesCost,
      translationsCost: 0,
      breakdown: {
        pages,
        translations: 0,
        pagePrice: this.PAGE_PRICE,
        translationPrice: this.TRANSLATION_PRICE
      }
    };
  }

  calculateTranslationCost(targetLanguages: number, chunks: number): CostCalculation {
    const totalTranslations = targetLanguages * chunks;
    const translationsCost = totalTranslations * this.TRANSLATION_PRICE;
    
    return {
      totalCost: translationsCost,
      pagesCost: 0,
      translationsCost,
      breakdown: {
        pages: 0,
        translations: totalTranslations,
        pagePrice: this.PAGE_PRICE,
        translationPrice: this.TRANSLATION_PRICE
      }
    };
  }

  checkWalletBalance(user: any, requiredAmount: number): { canProceed: boolean; message: string } {
    if (!user) {
      return { canProceed: false, message: 'Please log in to continue' };
    }

    if (user.walletBalance < requiredAmount) {
      return { 
        canProceed: false, 
        message: `Insufficient funds. Required: $${requiredAmount.toFixed(2)}, Available: $${user.walletBalance.toFixed(2)}` 
      };
    }

    return { canProceed: true, message: '' };
  }

  checkDailyTranslationLimit(user: any): { canProceed: boolean; remaining: number; message: string } {
    if (!user) {
      return { canProceed: false, remaining: 0, message: 'Please log in to continue' };
    }

    const dailyUsed = user.dailyTextTranslations || 0;
    const remaining = Math.max(0, this.FREE_DAILY_TRANSLATIONS - dailyUsed);

    if (remaining > 0) {
      return { 
        canProceed: true, 
        remaining, 
        message: `${remaining} free translations remaining today` 
      };
    }

    return { 
      canProceed: false, 
      remaining: 0, 
      message: 'Daily free translation limit reached. Upgrade or fund wallet to continue.' 
    };
  }

  async deductFromWallet(user: any, amount: number, updateWallet: (amount: number) => Promise<void>): Promise<boolean> {
    try {
      if (user.walletBalance < amount) {
        throw new Error('Insufficient funds');
      }

      await updateWallet(-amount);
      return true;
    } catch (error) {
      console.error('Failed to deduct from wallet:', error);
      return false;
    }
  }
}

export const monetizationService = new MonetizationService();
