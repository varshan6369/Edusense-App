import React, { useState } from 'react';
import { FileDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export interface DownloadPdfButtonProps {
  targetElementId?: string;
  filename?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconOnly?: boolean;
  title?: string;
  reportTitle?: string;
  reportSubtitle?: string;
  orientation?: 'portrait' | 'landscape';
  onBeforeDownload?: () => void;
  onAfterDownload?: (success: boolean) => void;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
  targetElementId = 'active-dashboard-view',
  filename,
  label = 'Download PDF Report',
  variant = 'outline',
  size = 'md',
  className = '',
  iconOnly = false,
  title = 'Generate and download standalone printable PDF report of current dashboard',
  reportTitle = 'EduSense AI Academic Analytics Report',
  reportSubtitle = 'Standalone Evaluation & Kaggle Benchmark Predictions',
  orientation = 'portrait',
  onBeforeDownload,
  onAfterDownload,
}) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === 'generating') return;

    try {
      setStatus('generating');
      if (onBeforeDownload) {
        onBeforeDownload();
      }

      // 1. Locate the source target element in the DOM
      let sourceElement: HTMLElement | null = null;
      if (targetElementId) {
        sourceElement = document.getElementById(targetElementId);
      }
      if (!sourceElement) {
        sourceElement =
          document.getElementById('teacher-dashboard-view') ||
          document.getElementById('student-dashboard-view') ||
          document.getElementById('active-dashboard-view') ||
          document.querySelector('main');
      }

      if (!sourceElement) {
        throw new Error('Target dashboard container not found.');
      }

      // 2. Prepare a standalone, printable clone container
      const printWrapper = document.createElement('div');
      printWrapper.id = 'standalone-pdf-export-container';
      printWrapper.style.position = 'fixed';
      printWrapper.style.left = '-9999px';
      printWrapper.style.top = '0';
      printWrapper.style.width = orientation === 'landscape' ? '1400px' : '1080px';
      printWrapper.style.padding = '32px 36px';
      printWrapper.style.backgroundColor = '#ffffff';
      printWrapper.style.color = '#0f172a';
      printWrapper.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      printWrapper.style.zIndex = '-9999';
      printWrapper.style.boxSizing = 'border-box';

      // 3. Official Printable Header
      const headerDiv = document.createElement('div');
      headerDiv.style.borderBottom = '2px solid #e2e8f0';
      headerDiv.style.paddingBottom = '16px';
      headerDiv.style.marginBottom = '24px';

      const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const timeStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      headerDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: #4f46e5; border-radius: 50%;"></span>
              <span style="font-size: 11px; font-weight: 800; color: #4f46e5; letter-spacing: 0.12em; text-transform: uppercase;">EduSense AI · Academic Learning Analytics</span>
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">${reportTitle}</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 500; color: #64748b;">${reportSubtitle}</p>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; padding: 4px 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 10px; font-weight: 700; color: #334155; margin-bottom: 4px;">
              STANDALONE REPORT
            </div>
            <div style="font-size: 10px; font-weight: 600; color: #64748b;">Generated: ${dateStr} • ${timeStr}</div>
            <div style="font-size: 9px; font-weight: 600; color: #94a3b8;">Deterministic Heuristic Model (Kaggle Benchmark)</div>
          </div>
        </div>
      `;
      printWrapper.appendChild(headerDiv);

      // 4. Clone source element content
      const clonedNode = sourceElement.cloneNode(true) as HTMLElement;

      // 5. Strip interactive elements (tabs, search inputs, action buttons, modals)
      const unwanted = clonedNode.querySelectorAll(
        '.no-print, button, input, select, textarea, [aria-haspopup="true"], [role="tablist"]'
      );
      unwanted.forEach((el) => {
        if (!el.classList.contains('keep-in-pdf')) {
          el.remove();
        }
      });

      // Expand any clipped or scrollable areas in the clone
      clonedNode.querySelectorAll('*').forEach((el) => {
        const elem = el as HTMLElement;
        if (elem.style) {
          if (elem.style.maxHeight) elem.style.maxHeight = 'none';
          if (elem.style.overflow === 'auto' || elem.style.overflow === 'hidden' || elem.style.overflowY === 'auto') {
            elem.style.overflow = 'visible';
          }
        }
      });

      printWrapper.appendChild(clonedNode);

      // 6. Printable Footer
      const footerDiv = document.createElement('div');
      footerDiv.style.borderTop = '1px solid #e2e8f0';
      footerDiv.style.paddingTop = '14px';
      footerDiv.style.marginTop = '28px';
      footerDiv.style.display = 'flex';
      footerDiv.style.justifyContent = 'space-between';
      footerDiv.style.alignItems = 'center';
      footerDiv.style.fontSize = '9px';
      footerDiv.style.color = '#94a3b8';
      footerDiv.style.fontWeight = '500';

      footerDiv.innerHTML = `
        <div>
          <span>EduSense / LUCIFER Academic Analytics Platform</span> • 
          <span>Privacy Guaranteed: No External Student PII Transmitted</span>
        </div>
        <div>
          <span>Principal / Faculty Endorsement: _________________________</span>
        </div>
      `;
      printWrapper.appendChild(footerDiv);

      document.body.appendChild(printWrapper);

      // 7. Resolve clean filename
      const finalFilename = filename
        ? (filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
        : `EduSense-Dashboard-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

      // 8. Render using html2canvas-pro which natively supports Tailwind 4 oklab/oklch colors
      const canvas = await html2canvas(printWrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: orientation === 'landscape' ? 1400 : 1080,
        backgroundColor: '#ffffff',
      });

      // Clean up temporary DOM element immediately after canvas capture
      if (document.body.contains(printWrapper)) {
        document.body.removeChild(printWrapper);
      }

      // 9. Convert canvas to standalone multi-page A4 PDF using jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: orientation as 'portrait' | 'landscape',
        unit: 'mm' as const,
        format: 'a4',
        compress: true,
      });

      const pageWidth = orientation === 'landscape' ? 297 : 210;
      const pageHeight = orientation === 'landscape' ? 210 : 297;
      const margin = 8;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // First page
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= printableHeight;

      // Additional pages if content exceeds A4 height
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= printableHeight;
      }

      pdf.save(finalFilename);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);

      if (onAfterDownload) {
        onAfterDownload(true);
      }
    } catch (err) {
      console.error('PDF generation error with html2canvas-pro/jsPDF:', err);

      const orphan = document.getElementById('standalone-pdf-export-container');
      if (orphan && document.body.contains(orphan)) {
        document.body.removeChild(orphan);
      }

      setStatus('error');
      if (onAfterDownload) {
        onAfterDownload(false);
      }

      // Smooth fallback: open native print-to-PDF
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.print();
        }
        setStatus('idle');
      }, 1000);
    }
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 border border-indigo-500/30',
    secondary:
      'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 shadow-xs',
    outline:
      'bg-white hover:bg-slate-50 text-[#3D3D5C] hover:text-indigo-600 border border-slate-200/90 hover:border-indigo-300 shadow-xs',
    ghost:
      'bg-transparent hover:bg-slate-100 text-[#4A4A6A] hover:text-[#1A1A2E]',
    gradient:
      'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30',
  };

  const sizeStyles = {
    sm: iconOnly ? 'p-1.5 rounded-lg' : 'px-3 py-1.5 text-[11px] rounded-lg gap-1.5',
    md: iconOnly ? 'p-2 rounded-xl' : 'px-3.5 py-2 text-xs rounded-xl gap-2',
    lg: iconOnly ? 'p-2.5 rounded-2xl' : 'px-4 py-2.5 text-sm rounded-2xl gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={status === 'generating'}
      title={title}
      aria-label={iconOnly ? label : undefined}
      className={`no-print inline-flex items-center justify-center font-bold tracking-tight transition-all cursor-pointer focus-ring select-none shrink-0 btn-bounce disabled:opacity-75 disabled:cursor-wait ${
        status === 'success'
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
          : status === 'error'
          ? 'bg-amber-600 text-white border-amber-500'
          : variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {status === 'generating' ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin text-current shrink-0`} />
          {!iconOnly && <span>Generating PDF...</span>}
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle2 className={`${iconSizes[size]} text-white shrink-0`} />
          {!iconOnly && <span>PDF Downloaded!</span>}
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className={`${iconSizes[size]} text-white shrink-0`} />
          {!iconOnly && <span>Opening Print...</span>}
        </>
      ) : (
        <>
          <FileDown className={`${iconSizes[size]} text-current shrink-0`} />
          {!iconOnly && <span>{label}</span>}
        </>
      )}
    </button>
  );
};

// Also export as DownloadPDFReportButton alias for maximum convenience
export const DownloadPDFReportButton = DownloadPdfButton;
export type DownloadPDFReportButtonProps = DownloadPdfButtonProps;
