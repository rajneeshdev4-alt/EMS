import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Header({ onMenuClick, title }: { onMenuClick: () => void; title: string }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-surface-900">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-surface-900">{user?.name}</p>
          <p className="text-xs text-surface-500">{user?.email}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}