import { useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, STATUS } from '../../../constants';

export default function Reports() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    category: '',
  });

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      const res = await apiClient.get(`/reports/expenses/export?${params.toString()}`, {
        responseType: 'blob', // Important for file downloads
      });

      // Create a temporary link to trigger the download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Export Reports</h2>
        <p className="text-surface-500">Download expense data as a CSV file for external analysis.</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Start Date" 
            type="date" 
            value={filters.startDate} 
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
          />
          <Input 
            label="End Date" 
            type="date" 
            value={filters.endDate} 
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Status" 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {Object.values(STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          
          <Select 
            label="Category" 
            value={filters.category} 
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <div className="pt-4 border-t border-surface-200">
          <Button onClick={handleExport} isLoading={isDownloading} className="w-full">
            <Download size={16} className="mr-2" /> Export to CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}