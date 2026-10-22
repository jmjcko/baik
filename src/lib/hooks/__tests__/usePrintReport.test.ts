import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrintReport } from '../usePrintReport';

describe('usePrintReport', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should print with the report name and the date as the document title and restore the title afterwards', () => {
    document.title = 'bAIk';
    let titleWhilePrinting = '';
    vi.spyOn(window, 'print').mockImplementation(() => {
      titleWhilePrinting = document.title;
    });
    const { result } = renderHook(() => usePrintReport('bAIk-fit-summary'));
    expect(result.current.printedOn).toBeNull();
    act(() => result.current.print());
    expect(titleWhilePrinting).toMatch(/^bAIk-fit-summary-\d{4}-\d{2}-\d{2}$/);
    expect(document.title).toBe('bAIk');
    expect(result.current.printedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should restore the title even when printing fails', () => {
    document.title = 'bAIk';
    vi.spyOn(window, 'print').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => usePrintReport('x'));
    expect(() => act(() => result.current.print())).toThrow('blocked');
    expect(document.title).toBe('bAIk');
  });
});
