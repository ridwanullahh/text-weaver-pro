
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

interface PlanLimits {
  pages: number;
  translations: number;
  languages: number;
  features: string[];
}

class MonetizationService {
  private readonly PAGE_PRICE = 0.10; // $0.10 per page
  private readonly TRANSLATION_PRICE = 0.05; // $0.05 per translation
  private readonly FREE_DAILY_TRANSLATIONS = 3;

  private readonly PLAN_LIMITS: Record<string, PlanLimits> = {
    free: {
      pages: 5,
      translations: 3,
      languages: 5,
      features: ['Basic translation', 'PDF support']
    },
    basic: {
      pages: 50,
      translations: 100,
      languages: 10,
      features: ['All file formats', 'Email support', 'Standard quality']
    },
    pro: {
      pages: 500,
      translations: 1000,
      languages: 50,
      features: ['Premium AI quality', 'Priority support', 'Advanced formatting', 'Batch processing']
    },
    enterprise: {
      pages: -1, // Unlimited
      translations: -1, // Unlimited
      languages: 100,
      features: ['Unlimited pages', 'Custom integrations', 'Dedicated support', 'Team collaboration', 'Advanced analytics', 'SLA guarantee']
    }
  };

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

  checkPlanLimits(user: any, operation: 'pages' | 'translations', amount: number): { canProceed: boolean; message: string; remaining: number } {
    if (!user) {
      return { canProceed: false, message: 'Please log in to continue', remaining: 0 };
    }

    const userPlan = user.plan || 'free';
    const planLimits = this.PLAN_LIMITS[userPlan];
    
    if (!planLimits) {
      return { canProceed: false, message: 'Invalid plan', remaining: 0 };
    }

    const limit = planLimits[operation];
    
    // Unlimited for enterprise
    if (limit === -1) {
      return { canProceed: true, message: 'Unlimited usage', remaining: -1 };
    }

    const used = operation === 'pages' ? (user.monthlyPagesUsed || 0) : (user.monthlyTranslationsUsed || 0);
    const remaining = Math.max(0, limit - used);

    if (remaining >= amount) {
      return { 
        canProceed: true, 
        message: `${remaining - amount} ${operation} remaining this month`, 
        remaining: remaining - amount 
      };
    }

    return { 
      canProceed: false, 
      message: `Monthly ${operation} limit exceeded. Upgrade your plan or use pay-as-you-go.`, 
      remaining: 0 
    };
  }

  checkWalletBalance(user: any, requiredAmount: number): { canProceed: boolean; message: string } {
    if (!user) {
      return { canProceed: false, message: 'Please log in to continue' };
    }

    if (user.walletBalance < requiredAmount) {
      return { 
        canProceed: false, 
        message: `Insufficient funds. Required: $${requiredAmount.toFixed(2)}, Available: $${(user.walletBalance || 0).toFixed(2)}` 
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

  async processPayment(user: any, amount: number, operation: string, updateUser: (updates: any) => Promise<void>): Promise<boolean> {
    try {
      if (user.walletBalance < amount) {
        throw new Error('Insufficient funds');
      }

      // Deduct from wallet
      const newBalance = user.walletBalance - amount;
      
      // Update usage counters
      const updates: any = { walletBalance: newBalance };
      
      if (operation === 'pages') {
        updates.monthlyPagesUsed = (user.monthlyPagesUsed || 0) + 1;
      } else if (operation === 'translations') {
        updates.monthlyTranslationsUsed = (user.monthlyTranslationsUsed || 0) + 1;
      }

      await updateUser(updates);
      return true;
    } catch (error) {
      console.error('Failed to process payment:', error);
      return false;
    }
  }

  async upgradeUserPlan(user: any, newPlan: string, updateUser: (updates: any) => Promise<void>): Promise<boolean> {
    try {
      if (!this.PLAN_LIMITS[newPlan]) {
        throw new Error('Invalid plan');
      }

      await updateUser({ 
        plan: newPlan,
        planUpgradedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      return false;
    }
  }

  getPlanFeatures(planName: string): string[] {
    return this.PLAN_LIMITS[planName]?.features || [];
  }

  getPlanLimits(planName: string): PlanLimits | null {
    return this.PLAN_LIMITS[planName] || null;
  }

  getAllPlans(): Record<string, PlanLimits> {
    return this.PLAN_LIMITS;
  }
}

export const monetizationService = new MonetizationService();
