import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/expenses')) return 'Expenses';
    if (location.pathname.startsWith('/approvals')) return 'Approvals';
    if (location.pathname.startsWith('/reports')) return 'Reports';
    if (location.pathname.startsWith('/users')) return 'Users';
    return 'ExpenseFlow';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getTitle()} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}