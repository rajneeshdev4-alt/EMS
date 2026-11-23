import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { toast } from 'sonner';
import apiClient from '../../../services/apiClient';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

 const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/auth/register', data);
      if (res.data.success) {
        // Pass a success flag to the login page
         toast.success('Account created successfully! Please log in.');
        navigate('/login', { state: { registered: true } });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-surface-900">Create an Account</h2>
        <p className="mt-2 text-sm text-surface-500">Sign up to start managing expenses</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" {...register('name')} error={errors.name?.message as string} />
        <Input label="Email" type="email" placeholder="john@example.com" {...register('email')} error={errors.email?.message as string} />
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message as string} />
        <Button type="submit" className="w-full mt-6" isLoading={isSubmitting}>Sign Up</Button>
      </form>
      <div className="mt-6 text-center text-sm text-surface-600">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
      </div>
    </Card>
  );
}