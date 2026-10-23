import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import type { StockSelection } from '@/lib/bikes/types';
import { DiagnosticReport } from '../DiagnosticReport';
import { buildStockAudit } from '../stock/buildStockAudit';
import { diagnosisOf, todayOf, useRecordDiagnosis } from '../stock/useRecordDiagnosis';

const canyonM: StockSelection = { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' };
const values = { ...DEFAULT_PROFILE, inseamMm: 840, acromionWidthMm: 380 };
const stockView = () => buildStockAudit(translations.en, 'en', canyonM, values)!;

describe('the day and the deltas of a report', () => {
  it('should write a local day as YYYY-MM-DD', () => {
    expect(todayOf(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05');
    expect(todayOf(new Date(2026, 0, 31, 0, 1))).toBe('2026-01-31');
  });

  it('should take the saddle and spacer deltas from the audit, and nothing for a bike without factory setup', () => {
    const view = stockView();
    expect(diagnosisOf(view, '2026-10-23')).toEqual({ at: '2026-10-23', saddleDeltaMm: view.saddle.deltaMm, spacerDeltaMm: view.spacers.goalMm - view.spacers.nowMm });
    expect(diagnosisOf(null, '2026-10-23')).toEqual({ at: '2026-10-23', saddleDeltaMm: null, spacerDeltaMm: null });
  });
});

describe('useRecordDiagnosis', () => {
  const today = todayOf();

  it('should store what the report shows once, and not again while it is the same', () => {
    const record = vi.fn();
    const view = stockView();
    const { rerender } = renderHook(({ stored }) => useRecordDiagnosis(view, stored, record), { initialProps: { stored: null as ReturnType<typeof diagnosisOf> | null } });
    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(diagnosisOf(view, today));
    rerender({ stored: diagnosisOf(view, today) });
    expect(record).toHaveBeenCalledTimes(1);
  });

  it('should store again for a new day or for other numbers', () => {
    const record = vi.fn();
    const view = stockView();
    renderHook(() => useRecordDiagnosis(view, { ...diagnosisOf(view, '2020-01-01') }, record));
    expect(record).toHaveBeenCalledTimes(1);
    renderHook(() => useRecordDiagnosis(view, { ...diagnosisOf(view, today), saddleDeltaMm: 99 }, record));
    expect(record).toHaveBeenCalledTimes(2);
  });

  it('should do nothing without a place to store it', () => {
    expect(() => renderHook(() => useRecordDiagnosis(stockView(), null, undefined))).not.toThrow();
  });
});

describe('the report records its diagnosis', () => {
  const props = { t: translations.en, locale: 'en' as const, ...values, coordinates: deriveCoordinates(values), onOpenCadStudio: vi.fn(), onEditMeasurements: vi.fn() };

  it('should hand the factory audit deltas to the garage when the bike has its factory setup', () => {
    const onDiagnosis = vi.fn();
    render(<DiagnosticReport {...props} stockBike={canyonM} onDiagnosis={onDiagnosis} />);
    expect(onDiagnosis).toHaveBeenCalledTimes(1);
    expect(onDiagnosis.mock.calls[0][0]).toMatchObject({ at: todayOf(), saddleDeltaMm: expect.any(Number), spacerDeltaMm: expect.any(Number) });
  });

  it('should hand over only the day for a bike without factory setup, and nothing when it is stored already', () => {
    const onDiagnosis = vi.fn();
    const { unmount } = render(<DiagnosticReport {...props} onDiagnosis={onDiagnosis} />);
    expect(onDiagnosis).toHaveBeenCalledWith({ at: todayOf(), saddleDeltaMm: null, spacerDeltaMm: null });
    unmount();
    const again = vi.fn();
    render(<DiagnosticReport {...props} lastDiagnosis={{ at: todayOf(), saddleDeltaMm: null, spacerDeltaMm: null }} onDiagnosis={again} />);
    expect(again).not.toHaveBeenCalled();
  });
});
