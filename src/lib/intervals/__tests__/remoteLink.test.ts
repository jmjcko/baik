import { describe, it, expect } from 'vitest';
import { deleteMyConnections, type LinkTable } from '../remoteLink';

const table = (error: { code?: string } | null) => {
  const deleted: string[] = [];
  const db = { from: () => ({ delete: () => ({ eq: async (_column: string, value: string) => (deleted.push(value), { error }) }) }) } as unknown as LinkTable;
  return { db, deleted };
};

describe('erasing the stored Intervals.icu keys of a rider', () => {
  it('should delete the rows of the rider', async () => {
    const { db, deleted } = table(null);
    expect(await deleteMyConnections(db, 'u1')).toBe(true);
    expect(deleted).toEqual(['u1']);
  });

  it('should call a table that does not exist yet nothing to delete, and report a real failure', async () => {
    expect(await deleteMyConnections(table({ code: '42P01' }).db, 'u1')).toBe(true);
    expect(await deleteMyConnections(table({ code: 'PGRST205' }).db, 'u1')).toBe(true);
    expect(await deleteMyConnections(table({ code: '500' }).db, 'u1')).toBe(false);
    expect(await deleteMyConnections({ from: () => { throw new Error('down'); } } as unknown as LinkTable, 'u1')).toBe(false);
  });
});
