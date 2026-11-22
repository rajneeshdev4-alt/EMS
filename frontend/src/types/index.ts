export type Role = 'admin' | 'user';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  description: string;
  status: ExpenseStatus;
  createdBy: { _id: string; name: string; email: string };
  approvedBy?: { _id: string; name: string; email: string };
  approvedAt?: string;
  rejectedBy?: { _id: string; name: string; email: string };
  rejectedAt?: string;
  rejectionReason?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: { field: string; message: string }[];
}