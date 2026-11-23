import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';
import type { Expense } from '../../types';

const expenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  // In Zod v4, use 'error' instead of 'invalid_type_error'
  amount: z.coerce.number({ error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  // In Zod v4, use the 'error' property for enums
  category: z.enum(CATEGORIES, {
    error: 'Category is required',
  }),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: 'Payment method is required',
  }),
  description: z.string().max(2000).optional().default(''),
});
type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ExpenseForm({ initialData, onSubmit, onCancel, isSubmitting }: ExpenseFormProps) {
  const defaultValues = initialData
    ? {
        title: initialData.title,
        amount: initialData.amount,
        category: initialData.category as any,
        date: initialData.date.split('T')[0], // Format for <input type="date">
        paymentMethod: initialData.paymentMethod as any,
        description: initialData.description,
      }
    : { date: new Date().toISOString().split('T')[0] };

  const { register, handleSubmit, formState: { errors } } = useForm<
    z.input<typeof expenseSchema>,
    any,
    ExpenseFormData
  >({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" placeholder="E.g., Client dinner" {...register('title')} error={errors.title?.message} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Amount ($)" type="number" step="0.01" placeholder="0.00" {...register('amount')} error={errors.amount?.message} />
        <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Category" {...register('category')} error={errors.category?.message}>
          <option value="">Select category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select label="Payment Method" {...register('paymentMethod')} error={errors.paymentMethod?.message}>
          <option value="">Select method</option>
          {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-surface-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-1 ${
            errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-surface-300 focus:border-brand-500 focus:ring-brand-500'
          }`}
          placeholder="Optional details..."
        />
        {errors.description && <p className="mt-1.5 text-xs text-red-600 break-words leading-tight">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Save Changes' : 'Create Expense'}
        </Button>
      </div>
    </form>
  );
}