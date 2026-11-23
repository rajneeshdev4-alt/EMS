import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { ROLES } from '../constants';

import Login from '../features/auth/pages/Login';
import Dashboard from '../features/dashboard/pages/Dashboard';
import ExpenseList from '../features/expenses/pages/ExpenseList';
import ExpenseDetails from '../features/expenses/pages/ExpenseDetails';
import Approvals from '../features/approvals/pages/Approvals';
import Reports from '../features/reports/pages/Reports';
import Users from '../features/users/pages/Users';
import Register from '@/features/auth/pages/Register';

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> }
    ],
  },
  {
    element: <ProtectedRoute />, // Any logged-in user
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/expenses', element: <ExpenseList /> },
          { path: '/expenses/:id', element: <ExpenseDetails /> },
          { path: '/reports', element: <Reports /> },
          // Admin only routes
          {
            element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [
              { path: '/approvals', element: <Approvals /> },
              { path: '/users', element: <Users /> },
            ]
          }
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}