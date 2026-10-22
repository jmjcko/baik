'use client';

import { useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Prints the page (the browser offers "Save as PDF"). The date of the print is rendered first, and the document title
 * (which browsers propose as the file name) carries the report name and the date while the dialog is open.
 */
export function usePrintReport(fileName: string) {
  const [printedOn, setPrintedOn] = useState<string | null>(null);

  const print = () => {
    const date = new Date().toISOString().slice(0, 10);
    flushSync(() => setPrintedOn(date));
    const previousTitle = document.title;
    document.title = `${fileName}-${date}`;
    try {
      window.print();
    } finally {
      document.title = previousTitle;
    }
  };

  return { printedOn, print };
}
