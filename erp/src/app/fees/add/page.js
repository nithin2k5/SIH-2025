'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES } from '../../../types';
import Layout from '../../../components/layout/Layout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import { apiService } from '../../../services/apiService';
import {
  ArrowLeft,
  DollarSign,
  Calculator,
  Save,
  X
} from 'lucide-react';

// Validation schema
const schema = yup.object().shape({
  course: yup.string().required('Course is required'),
  semester: yup.number().min(1).max(8).required('Semester is required'),
  academicYear: yup.string().required('Academic year is required'),
  tuitionFee: yup.number().min(0).required('Tuition fee is required'),
  hostelFee: yup.number().min(0).required('Hostel fee is required'),
  examFee: yup.number().min(0).required('Exam fee is required'),
  labFee: yup.number().min(0).required('Lab fee is required'),
  libraryFee: yup.number().min(0).required('Library fee is required'),
  otherFees: yup.number().min(0).required('Other fees is required')
});

export default function AddFeeStructurePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [totalFee, setTotalFee] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      course: '',
      semester: 1,
      academicYear: '2024-25',
      tuitionFee: 0,
      hostelFee: 0,
      examFee: 0,
      labFee: 0,
      libraryFee: 0,
      otherFees: 0
    }
  });

  // Watch all fee fields to calculate total
  const tuitionFee = watch('tuitionFee');
  const hostelFee = watch('hostelFee');
  const examFee = watch('examFee');
  const labFee = watch('labFee');
  const libraryFee = watch('libraryFee');
  const otherFees = watch('otherFees');

  // Calculate total whenever fees change
  useEffect(() => {
    const total = (parseFloat(tuitionFee) || 0) +
                  (parseFloat(hostelFee) || 0) +
                  (parseFloat(examFee) || 0) +
                  (parseFloat(labFee) || 0) +
                  (parseFloat(libraryFee) || 0) +
                  (parseFloat(otherFees) || 0);
    setTotalFee(total);
  }, [tuitionFee, hostelFee, examFee, labFee, libraryFee, otherFees]);

  // Check if user has permission
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isStaff = user?.role === USER_ROLES.STAFF;

  if (!isAdmin && !isStaff) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const feeStructureData = {
        ...data,
        totalFee: totalFee,
        createdBy: user.id,
        createdAt: new Date()
      };

      await apiService.createFeeStructure(feeStructureData);

      // Redirect back to fees page
      router.push('/fees');
    } catch (error) {
      console.error('Error creating fee structure:', error);
      alert('Failed to create fee structure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const courses = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Business Administration',
    'Civil Engineering',
    'Information Technology'
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Add Fee Structure</h1>
              <p className="text-slate-600 text-lg mt-1">
                Create a new fee structure for a course and semester
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Course *
                  </label>
                  <select
                    {...register('course')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  {errors.course && (
                    <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Semester *
                    </label>
                    <select
                      {...register('semester')}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                    {errors.semester && (
                      <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Academic Year *
                    </label>
                    <Input
                      {...register('academicYear')}
                      placeholder="2024-25"
                      error={errors.academicYear?.message}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card variant="elevated" className="animate-slide-up" style={{animationDelay: '100ms'}}>
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900">Fee Breakdown</h3>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tuition Fee (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('tuitionFee')}
                    placeholder="0"
                    error={errors.tuitionFee?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hostel Fee (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('hostelFee')}
                    placeholder="0"
                    error={errors.hostelFee?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Exam Fee (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('examFee')}
                    placeholder="0"
                    error={errors.examFee?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lab Fee (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('labFee')}
                    placeholder="0"
                    error={errors.labFee?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Library Fee (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('libraryFee')}
                    placeholder="0"
                    error={errors.libraryFee?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Other Fees (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('otherFees')}
                    placeholder="0"
                    error={errors.otherFees?.message}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Summary */}
        <Card variant="elevated" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Total Fee</h3>
                  <p className="text-sm text-slate-600">Auto-calculated from fee breakdown</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">₹{totalFee.toLocaleString()}</p>
                <p className="text-sm text-slate-600">per semester</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Fee Structure'}
          </Button>
        </div>
      </form>
    </Layout>
  );
}
