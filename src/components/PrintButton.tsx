import React from 'react';
import { Printer } from 'lucide-react';

export interface PrintButtonProps {
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  title?: string;
  onBeforePrint?: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  label = 'Print View',
  className = '',
  variant = 'outline',
  size = 'md',
  iconOnly = false,
  title = 'Print or export this view (Ctrl/Cmd + P)',
  onBeforePrint,
}) => {
  const handlePrint = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBeforePrint) {
      onBeforePrint();
    }
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const variantStyles = {
    primary:
      'btn-primary text-white shadow-md shadow-indigo-500/20 hover:shadow-lg',
    secondary:
      'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 shadow-xs',
    outline:
      'bg-white hover:bg-slate-50 text-[#3D3D5C] hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-200 shadow-xs',
    ghost:
      'bg-transparent hover:bg-slate-100 text-[#4A4A6A] hover:text-[#1A1A2E]',
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
      onClick={handlePrint}
      title={title}
      aria-label={iconOnly ? label : undefined}
      className={`no-print inline-flex items-center justify-center font-bold tracking-tight transition-all cursor-pointer focus-ring select-none shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <Printer className={`${iconSizes[size]} shrink-0 text-current`} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};
