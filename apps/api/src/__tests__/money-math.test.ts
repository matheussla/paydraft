import { describe, it, expect } from 'vitest';

describe('Money Math', () => {
  describe('Integer Unit String Arithmetic', () => {
    it('should handle addition of integer unit strings', () => {
      const amount1 = '100000000';
      const amount2 = '50000000'; 
      
      const result = (BigInt(amount1) + BigInt(amount2)).toString();
      
      expect(result).toBe('150000000');
    });

    it('should handle subtraction of integer unit strings', () => {
      const amount1 = '800000000';
      const amount2 = '300000000';
      
      const result = (BigInt(amount1) - BigInt(amount2)).toString();
      
      expect(result).toBe('500000000');
    });

    it('should handle multiplication for quantity calculations', () => {
      const unitPrice = '30000000';
      const quantity = 20;
      
      const result = (BigInt(unitPrice) * BigInt(quantity)).toString();
      
      expect(result).toBe('600000000');
    });

    it('should maintain precision for large amounts', () => {
      const largeAmount = '999999999999999999';
      const smallAmount = '1';
      
      const result = (BigInt(largeAmount) + BigInt(smallAmount)).toString();
      
      expect(result).toBe('1000000000000000000');
    });

    it('should compare amounts correctly', () => {
      const paid = '800000000';
      const expected = '800000000';
      
      expect(BigInt(paid) === BigInt(expected)).toBe(true);
      expect(BigInt(paid) >= BigInt(expected)).toBe(true);
      expect(BigInt(paid) > BigInt('700000000')).toBe(true);
      expect(BigInt(paid) < BigInt('900000000')).toBe(true);
    });

    it('should handle zero amounts', () => {
      const zero = '0';
      const amount = '100000000';
      
      expect((BigInt(zero) + BigInt(amount)).toString()).toBe('100000000');
      expect((BigInt(amount) - BigInt(amount)).toString()).toBe('0');
    });

    it('should format amounts to human-readable USDC', () => {
      const testCases = [
        { amount: '800000000', expected: '800.000000' },
        { amount: '1000000', expected: '1.000000' },
        { amount: '500', expected: '0.000500' },
        { amount: '1', expected: '0.000001' },
        { amount: '123456789', expected: '123.456789' },
      ];

      testCases.forEach(({ amount, expected }) => {
        const tokens = (BigInt(amount) / BigInt(1_000_000)).toString();
        const decimals = (BigInt(amount) % BigInt(1_000_000)).toString().padStart(6, '0');
        const formatted = `${tokens}.${decimals}`;
        
        expect(formatted).toBe(expected);
      });
    });

    it('should validate non-negative amounts', () => {
      const validAmounts = ['0', '1', '1000000', '999999999'];
      const invalidAmounts = ['-1', '-1000000'];

      validAmounts.forEach(amount => {
        expect(BigInt(amount) >= BigInt(0)).toBe(true);
      });

      invalidAmounts.forEach(amount => {
        expect(BigInt(amount) >= BigInt(0)).toBe(false);
      });
    });

    it('should calculate line item totals correctly', () => {
      const lineItems = [
        { quantity: 20, unitPrice: '30000000' },
        { quantity: 10, unitPrice: '20000000' },
        { quantity: 5, unitPrice: '15000000' },
      ];

      const total = lineItems.reduce((sum, item) => {
        return sum + (BigInt(item.unitPrice) * BigInt(item.quantity));
      }, BigInt(0));

      expect(total.toString()).toBe('875000000');
    });

    it('should handle invoice total calculation', () => {
      const subtotal = '800000000';
      
      const tax = BigInt(0);
      const total = BigInt(subtotal) + tax;
      
      expect(total.toString()).toBe('800000000');
    });
  });

  describe('Token Decimals Handling', () => {
    it('should convert USDC amount to token units (6 decimals)', () => {
      const usdcAmount = 800;
      const decimals = 6;
      const tokenUnits = (BigInt(usdcAmount) * BigInt(10 ** decimals)).toString();
      
      expect(tokenUnits).toBe('800000000');
    });

    it('should convert token units back to USDC amount', () => {
      const tokenUnits = '800000000';
      const decimals = 6;
      const usdcAmount = Number(BigInt(tokenUnits) / BigInt(10 ** decimals));
      
      expect(usdcAmount).toBe(800);
    });

    it('should preserve fractional tokens', () => {
      const tokenUnits = '123456789';
      const tokens = (BigInt(tokenUnits) / BigInt(1_000_000)).toString();
      const fractional = (BigInt(tokenUnits) % BigInt(1_000_000)).toString();
      
      expect(tokens).toBe('123');
      expect(fractional).toBe('456789');
    });
  });
});
