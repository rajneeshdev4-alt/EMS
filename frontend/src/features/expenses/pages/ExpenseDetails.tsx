import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpenseDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/expenses/${id}`);
        setData(res.data.data);
      } catch {
        toast.error('Failed to load expense details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!data) return <div className="p-8 text-center">Expense not found.</div>;

  const { expense, history } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/expenses">
          <Button variant="ghost" className="p-2"><ArrowLeft size={20} /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 flex-1">Expense Details</h1>
        <Badge status={expense.status} className="text-sm px-3 py-1" />
      </div>

      <Card className="p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-surface-500 mb-1">Title</p>
            <p className="text-lg font-medium">{expense.title}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500 mb-1">Amount</p>
            <p className="text-lg font-medium text-brand-600">{formatCurrency(expense.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500 mb-1">Category</p>
            <p className="font-medium">{expense.category}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500 mb-1">Date</p>
            <p className="font-medium">{formatDate(expense.date)}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500 mb-1">Payment Method</p>
            <p className="font-medium">{expense.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500 mb-1">Created By</p>
            <p className="font-medium">{expense.createdBy?.name || 'Unknown'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-surface-500 mb-1">Description</p>
            <p className="text-surface-700 bg-surface-50 p-3 rounded-lg border border-surface-200">{expense.description || 'No description provided.'}</p>
          </div>
        </div>

        {expense.status === 'rejected' && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-semibold mb-1">Rejected By {expense.rejectedBy?.name}</p>
            <p className="text-sm">{expense.rejectionReason}</p>
          </div>
        )}

        {expense.status === 'approved' && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            <p className="font-semibold mb-1">Approved By {expense.approvedBy?.name}</p>
            <p className="text-sm">{formatDate(expense.approvedAt)}</p>
          </div>
        )}
      </Card>

      {/* Audit History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={18} /> Audit History</h3>
        <div className="space-y-4">
          {history.map((log: any) => (
            <div key={log._id} className="flex gap-4 items-start text-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 ring-4 ring-brand-50" />
              <div>
                <p className="text-surface-900">
                  <span className="font-medium">{log.performedBy?.name || 'System'}</span> {log.action} this expense.
                </p>
                <p className="text-xs text-surface-500">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}