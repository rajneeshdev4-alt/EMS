import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { toast } from 'sonner';
import { Card } from '../../../components/ui/Card.tsx';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Logged in successfully');
      navigate(from, { replace: true });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      setError('root', { message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-surface-900">Welcome back</h2>
        <p className="mt-2 text-sm text-surface-500">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="admin@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        {errors.root && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {errors.root.message}
          </div>
        )}

        <Button type="submit" className="w-full mt-6" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-surface-50 p-4 text-sm text-surface-600 border border-surface-200">
        <p className="font-medium mb-1">Demo Credentials:</p>
        <p>Admin: admin@example.com / Admin@123</p>
        <p>User: user@example.com / User@123</p>
      </div>
    </Card>
  );
}