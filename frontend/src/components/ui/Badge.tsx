import { cn } from '../../utils/cn';

export function Badge({ status, children, className }: { status?: string; children?: React.ReactNode; className?: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };
  const style = status ? styles[status.toLowerCase()] || 'bg-surface-100 text-surface-700 border-surface-200' : '';
  
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize', style, className)}>
      {children || status}
    </span>
  );
}