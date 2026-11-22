import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, CheckSquare, FileSpreadsheet, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants';
import { cn } from '../utils/cn';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Expenses', to: '/expenses', icon: Receipt },
    { label: 'Approvals', to: '/approvals', icon: CheckSquare, roles: [ROLES.ADMIN] },
    { label: 'Reports', to: '/reports', icon: FileSpreadsheet },
    { label: 'Users', to: '/users', icon: Users, roles: [ROLES.ADMIN] },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-surface-200 bg-white transition-transform lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-surface-200">
          <span className="text-xl font-bold text-brand-600">ExpenseFlow</span>
          <button onClick={onClose} className="lg:hidden text-surface-500 hover:text-surface-900"><X size={20} /></button>
        </div>
        
        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.roles && user && !item.roles.some((role) => role === user.role)) return null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-brand-50 text-brand-700" : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          
          <div className="border-t border-surface-200 pt-4">
            <div className="mb-4 px-3">
              <p className="text-sm font-medium text-surface-900">{user?.name}</p>
              <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}