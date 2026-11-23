import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ExpenseForm } from '../../../components/forms/ExpenseForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { Plus, Search, Eye, Edit, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '../../../hooks/useDebounce';
import type { Expense, Pagination } from '../../../types';
import { CATEGORIES, STATUS } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status }),
        ...(category && { category }),
      });
      const res = await apiClient.get(`/expenses?${params.toString()}`);
      setExpenses(res.data.data.expenses);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status, category]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setPage(1);
  };

  const handleCreateOrUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await apiClient.patch(`/expenses/${editingExpense._id}`, { ...data, version: editingExpense.version });
        toast.success('Expense updated');
      } else {
        await apiClient.post('/expenses', data);
        toast.success('Expense created');
      }
      setIsFormOpen(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/expenses/${deleteId}`);
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = search || status || category;

  return (
    <div className="space-y-6">
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <Input 
              placeholder="Search expenses..." 
              className="pl-9 w-full" 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-36">
              <option value="">All Statuses</option>
              {Object.values(STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-full sm:w-40">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleResetFilters} className="text-surface-500 hover:text-surface-900 px-3">
                <RotateCcw size={16} />
              </Button>
            )}
          </div>
        </div>
        <Button onClick={() => { setEditingExpense(null); setIsFormOpen(true); }} className="w-full sm:w-auto shrink-0">
          <Plus size={16} className="mr-2" /> Add Expense
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-surface-500">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-surface-500">No expenses found.</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900">{exp.title}</p>
                      <p className="text-xs text-surface-500">{exp.category}</p>
                    </td>
                    <td className="px-6 py-4 text-surface-600">{formatDate(exp.date)}</td>
                    <td className="px-6 py-4 font-medium text-surface-900">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4"><Badge status={exp.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/expenses/${exp._id}`}>
                          <Button variant="ghost" className="p-2"><Eye size={16} /></Button>
                        </Link>
                        {/* Admin can edit/delete ANY expense. User can only edit/delete their own pending/rejected expenses */}
                      {(user?.role === 'admin' || (exp.createdBy._id === user?.id && exp.status !== 'approved'))  && (
                          <>
                            <Button variant="ghost" className="p-2" onClick={() => { setEditingExpense(exp); setIsFormOpen(true); }}>
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" className="p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleteId(exp._id)}>
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 bg-surface-50">
            <span className="text-sm text-surface-600">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
            <ExpenseForm
              initialData={editingExpense || undefined}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        isLoading={isDeleting}
        confirmText="Delete"
        isDanger
      />
    </div>
  );
}