'use client';
import { Printer } from 'lucide-react';
export function PrintButton() {
  return <button type="button" className="vc-btn-ghost vc-noprint" onClick={() => window.print()}><Printer aria-hidden="true" /> Print or save as PDF</button>;
}
