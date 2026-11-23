import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatCurrency } from '../../../utils/formatCurrency';
import apiClient from '../../../services/apiClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Calendar, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await apiClient.get('/dashboard/summary');
        setData(res.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Format monthly trends for Recharts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendData = data?.monthlyTrends?.map((t: any) => ({
    name: monthNames[t.month - 1],
    total: t.total,
  })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Total Expenses</p>
              <p className="mt-2 text-3xl font-bold text-surface-900">{formatCurrency(data?.totalAmount)}</p>
            </div>
            <div className="rounded-full bg-brand-50 p-3 text-brand-600"><DollarSign size={24} /></div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">This Month</p>
              <p className="mt-2 text-3xl font-bold text-surface-900">{formatCurrency(data?.monthlyTotal)}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3 text-green-600"><Calendar size={24} /></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">This Year</p>
              <p className="mt-2 text-3xl font-bold text-surface-900">{formatCurrency(data?.yearlyTotal)}</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3 text-purple-600"><TrendingUp size={24} /></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Pending</p>
              <p className="mt-2 text-3xl font-bold text-surface-900">{data?.pendingExpenses || 0}</p>
            </div>
            <div className="rounded-full bg-amber-50 p-3 text-amber-600"><Clock size={24} /></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <Card className="col-span-2 p-6">
          <h3 className="mb-4 text-lg font-semibold text-surface-900">Monthly Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)} />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-surface-900">Category Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categorySummary}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {data?.categorySummary?.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}