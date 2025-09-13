'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '../../../services/apiService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  useEffect(() => {
    // In a real app, validate the reset token
    if (!token) {
      setTokenValid(false);
    }
    // TODO: Validate token with backend when ready
    // validateResetToken(token);
  }, [token]);

  const onSubmit = async (data) => {
    try {
      setError('');
      
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // In a real app, this would reset the password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // TODO: Replace with actual API call when backend is ready
      // await apiService.resetPassword(token, data.password);
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center animate-slide-up">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/25 animate-scale-in">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold gradient-text">Invalid Reset Link</h2>
            <p className="mt-3 text-slate-600 text-lg">
              This password reset link is invalid or has expired
            </p>
          </div>

          <Card variant="elevated" className="backdrop-blur-sm animate-slide-up">
            <CardContent padding="lg" className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Reset Link Expired
                </h3>
                <p className="text-slate-600">
                  Password reset links expire after 24 hours for security reasons. 
                  Please request a new reset link to continue.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button variant="primary" className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center animate-slide-up">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/25 animate-scale-in">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold gradient-text">Password Reset Successful</h2>
            <p className="mt-3 text-slate-600 text-lg">
              Your password has been successfully updated
            </p>
          </div>

          <Card variant="elevated" className="backdrop-blur-sm animate-slide-up">
            <CardContent padding="lg" className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  You're All Set!
                </h3>
                <p className="text-slate-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>

              <Link href="/auth/login">
                <Button variant="primary" className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-slide-up">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 animate-scale-in">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold gradient-text">Reset Password</h2>
          <p className="mt-3 text-slate-600 text-lg">
            Enter your new password below
          </p>
        </div>

        <Card variant="elevated" className="backdrop-blur-sm animate-slide-up">
          <CardHeader variant="gradient">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Create New Password
            </h3>
          </CardHeader>
          <CardContent padding="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm animate-slide-down">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                variant="filled"
                size="lg"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
                error={errors.password?.message}
                placeholder="Enter new password"
              />

              <Input
                label="Confirm New Password"
                type="password"
                variant="filled"
                size="lg"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match'
                })}
                error={errors.confirmPassword?.message}
                placeholder="Confirm new password"
              />

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">Password Strength:</div>
                  <div className="flex space-x-1">
                    <div className={`h-2 w-full rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-2 w-full rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-2 w-full rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-2 w-full rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p className={password.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</p>
                    <p className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• One uppercase letter</p>
                    <p className={/[a-z]/.test(password) ? 'text-green-600' : ''}>• One lowercase letter</p>
                    <p className={/\d/.test(password) ? 'text-green-600' : ''}>• One number</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={isSubmitting}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isSubmitting ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
