import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock FormData
global.FormData = vi.fn(() => ({
  append: vi.fn(),
}));