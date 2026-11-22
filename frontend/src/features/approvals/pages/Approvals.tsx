import { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Approvals() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPending = async () => {
    try {
      const res = await apiClient.get('/expenses?status=pending&limit=50');
      setExpenses(res.data.data.expenses);
    } catch {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id: string, version: number) => {
    setProcessingId(id);
    try {
      await apiClient.post(`/expenses/${id}/approve`, { version });
      toast.success('Expense approved');
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) return;
    setProcessingId(rejectId);
    try {
      await apiClient.post(`/expenses/${rejectId}/reject`, { rejectionReason });
      toast.success('Expense rejected');
      setExpenses(prev => prev.filter(e => e._id !== rejectId));
      setRejectId(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center p-8">Loading pending approvals...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Pending Approvals</h2>
        <p className="text-surface-500">Review and process employee expense claims.</p>
      </div>

      {expenses.length === 0 ? (
        <Card className="p-12 text-center text-surface-500">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
          <p className="text-lg">All caught up! No pending expenses.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {expenses.map((exp) => (
            <Card key={exp._id} className="p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-surface-900">{exp.title}</h3>
                  <p className="text-sm text-surface-500">{exp.createdBy?.name} • {formatDate(exp.date)}</p>
                </div>
                <span className="text-xl font-bold text-brand-600">{formatCurrency(exp.amount)}</span>
              </div>
              
              <p className="text-sm text-surface-600 mb-4 flex-1 line-clamp-2">{exp.description || 'No description'}</p>
              
              <div className="flex gap-3 pt-4 border-t border-surface-200">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => setRejectId(exp._id)}
                  disabled={processingId === exp._id}
                >
                  <XCircle size={16} className="mr-2" /> Reject
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => handleApprove(exp._id, exp.version)}
                  isLoading={processingId === exp._id}
                >
                  <CheckCircle size={16} className="mr-2" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Reject Expense</h3>
            <p className="text-sm text-surface-600 mb-4">Please provide a reason for rejection. This will be visible to the employee.</p>
            <Input 
              placeholder="Reason (e.g., Missing receipt)" 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)} 
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleReject} isLoading={processingId === rejectId} disabled={!rejectionReason.trim()}>
                Confirm Reject
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}