import { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card } from '../../../components/ui/Card.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { formatDate } from '../../../utils/formatDate';
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get('/users');
        setUsers(res.data.data.users);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center p-8">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Users</h2>
        <p className="text-surface-500">Manage system users and view their roles.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-50 border-b border-surface-200 text-surface-600">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-surface-50">
                <td className="px-6 py-4 font-medium text-surface-900">{u.name}</td>
                <td className="px-6 py-4 text-surface-600">{u.email}</td>
                <td className="px-6 py-4">
                  <Badge status={u.role === 'admin' ? 'approved' : 'pending'}>{u.role}</Badge>
                </td>
                <td className="px-6 py-4">
                  <span className={u.isActive ? 'text-green-600' : 'text-red-600'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-surface-600">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}