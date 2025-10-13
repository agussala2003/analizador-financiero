// src/utils/type-guards.test.ts

import { describe, it, expect } from 'vitest';
import { 
  isErrorWithMessage, 
  errorToString, 
  isNewsItem, 
  isDividend 
} from './type-guards';

describe('type-guards', () => {
  describe('isErrorWithMessage', () => {
    it('should return true for Error objects', () => {
      const error = new Error('Test error');
      expect(isErrorWithMessage(error)).toBe(true);
    });

    it('should return true for objects with message property', () => {
      const error = { message: 'Custom error' };
      expect(isErrorWithMessage(error)).toBe(true);
    });

    it('should return false for objects without message', () => {
      const notError = { code: 404 };
      expect(isErrorWithMessage(notError)).toBe(false);
    });

    it('should return false for objects with non-string message', () => {
      const notError = { message: 123 };
      expect(isErrorWithMessage(notError)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isErrorWithMessage('string')).toBe(false);
      expect(isErrorWithMessage(123)).toBe(false);
      expect(isErrorWithMessage(true)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isErrorWithMessage(null)).toBe(false);
      expect(isErrorWithMessage(undefined)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isErrorWithMessage([])).toBe(false);
      expect(isErrorWithMessage(['message'])).toBe(false);
    });
  });

  describe('errorToString', () => {
    it('should extract message from Error objects', () => {
      const error = new Error('Test error');
      expect(errorToString(error)).toBe('Test error');
    });

    it('should extract message from objects with message property', () => {
      const error = { message: 'Custom error' };
      expect(errorToString(error)).toBe('Custom error');
    });

    it('should return string as-is', () => {
      expect(errorToString('Simple error')).toBe('Simple error');
    });

    it('should stringify objects without message', () => {
      const error = { code: 404, details: 'Not found' };
      expect(errorToString(error)).toBe('{"code":404,"details":"Not found"}');
    });

    it('should handle numbers', () => {
      expect(errorToString(404)).toBe('404');
    });

    it('should handle boolean', () => {
      expect(errorToString(false)).toBe('false');
    });

    it('should handle null', () => {
      expect(errorToString(null)).toBe('null');
    });

    it('should handle undefined', () => {
      expect(errorToString(undefined)).toBe('Ocurrió un error desconocido e inserializable.');
    });

    it('should handle circular references gracefully', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      expect(errorToString(circular)).toBe('Ocurrió un error desconocido e inserializable.');
    });

    it('should handle arrays', () => {
      expect(errorToString([1, 2, 3])).toBe('[1,2,3]');
    });
  });

  describe('isNewsItem', () => {
    it('should return true for valid NewsItem', () => {
      const newsItem = {
        newsURL: 'https://example.com/news',
        newsTitle: 'Breaking News',
        publishedDate: '2024-10-12',
        symbol: 'AAPL',
      };
      expect(isNewsItem(newsItem)).toBe(true);
    });

    it('should return true for NewsItem with extra properties', () => {
      const newsItem = {
        newsURL: 'https://example.com/news',
        newsTitle: 'Breaking News',
        publishedDate: '2024-10-12',
        symbol: 'AAPL',
        author: 'John Doe',
        category: 'Technology',
      };
      expect(isNewsItem(newsItem)).toBe(true);
    });

    it('should return false for objects missing required properties', () => {
      const incomplete = {
        newsURL: 'https://example.com/news',
        newsTitle: 'Breaking News',
        // missing publishedDate and symbol
      };
      expect(isNewsItem(incomplete)).toBe(false);
    });

    it('should return false for objects with wrong property types', () => {
      const invalidTypes = {
        newsURL: 123, // should be string
        newsTitle: 'Breaking News',
        publishedDate: '2024-10-12',
        symbol: 'AAPL',
      };
      expect(isNewsItem(invalidTypes)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isNewsItem({})).toBe(false);
    });

    it('should return false for null', () => {
      expect(isNewsItem(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isNewsItem(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isNewsItem('string')).toBe(false);
      expect(isNewsItem(123)).toBe(false);
      expect(isNewsItem(true)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isNewsItem([])).toBe(false);
    });
  });

  describe('isDividend', () => {
    it('should return true for valid Dividend', () => {
      const dividend = {
        symbol: 'AAPL',
        paymentDate: '2024-10-12',
        frequency: 'Quarterly',
      };
      expect(isDividend(dividend)).toBe(true);
    });

    it('should return true for Dividend with extra properties', () => {
      const dividend = {
        symbol: 'AAPL',
        paymentDate: '2024-10-12',
        frequency: 'Quarterly',
        amount: 0.25,
        currency: 'USD',
      };
      expect(isDividend(dividend)).toBe(true);
    });

    it('should return false for objects missing required properties', () => {
      const incomplete = {
        symbol: 'AAPL',
        paymentDate: '2024-10-12',
        // missing frequency
      };
      expect(isDividend(incomplete)).toBe(false);
    });

    it('should return false for objects with wrong property types', () => {
      const invalidTypes = {
        symbol: 123, // should be string
        paymentDate: '2024-10-12',
        frequency: 'Quarterly',
      };
      expect(isDividend(invalidTypes)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isDividend({})).toBe(false);
    });

    it('should return false for null', () => {
      expect(isDividend(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isDividend(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isDividend('string')).toBe(false);
      expect(isDividend(123)).toBe(false);
      expect(isDividend(true)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isDividend([])).toBe(false);
    });
  });
});
