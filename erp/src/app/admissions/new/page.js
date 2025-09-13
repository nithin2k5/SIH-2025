'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { CheckCircle, Upload } from 'lucide-react';
import { apiService } from '../../../services/apiService';

// Validation schema - Only fields stored in Admissions model
const admissionSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').required('Phone is required'),
  programmeApplied: yup.string().required('Programme selection is required'),
  documents: yup.string().optional()
});

const courses = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Business Administration',
  'Commerce',
  'Arts'
];

const departments = [
  'Computer Science',
  'Engineering',
  'Business Studies',
  'Arts & Humanities',
  'Science',
  'Commerce'
];

export default function NewAdmission() {
  const [submitted, setSubmitted] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger
  } = useForm({
    resolver: yupResolver(admissionSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    try {
      console.log('Submitting admission data:', data);

      // Map form data to API format (matching Admissions model fields)
      const admissionData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        programme_applied: data.programmeApplied,
        documents: data.documents || ''
      };

      // Submit to actual API
      const response = await apiService.createAdmission(admissionData);
      console.log('Create admission response:', response);

      // Handle Google Apps Script response format: { success: true, admission: {...} }
      const admission = response.admission || response;

      if (admission && admission.admission_id) {
        // Use the admission_id as registration number or generate one based on it
        const regNum = admission.application_ref || `ADM${new Date().getFullYear()}${admission.admission_id.slice(-3)}`;
        setRegistrationNumber(regNum);
        setSubmitted(true);
      } else {
        throw new Error('Failed to create admission - no admission data received');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
      alert('Failed to submit admission. Please try again.');
    }
  };

  // Simplified form - no steps needed for basic admission fields

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admission Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your application has been received and is being processed.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="text-xl font-bold text-gray-900">{registrationNumber}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Please save this registration number for future reference.
                </p>
                <p className="text-sm text-gray-600">
                  You will receive an email confirmation shortly with further instructions.
                </p>
              </div>
              <div className="mt-6 space-x-4">
                <Button onClick={() => router.push('/admissions')}>
                  View All Admissions
                </Button>
                <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={[
        { label: 'Admissions', href: '/admissions' },
        { label: 'New Admission' }
      ]} />

      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Student Admission</h1>
          <p className="text-gray-600 mt-2">Fill out the admission form to register a new student.</p>
        </div>

        {/* Simplified Header */}
        <div className="mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Admission Application</h2>
            <p className="text-gray-600 mt-2">Please fill in your basic information to start the admission process</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Admission Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  placeholder="Enter first name"
                />
                <Input
                  label="Last Name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  placeholder="Enter last name"
                />
                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  placeholder="Enter email address"
                />
                <Input
                  label="Phone Number"
                  {...register('phone')}
                  error={errors.phone?.message}
                  placeholder="Enter phone number"
                />
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Programme Applied</label>
                  <select
                    {...register('programmeApplied')}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  >
                    <option value="">Select programme</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  {errors.programmeApplied && (
                    <p className="text-sm text-red-600">{errors.programmeApplied.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Documents (Optional)"
                    {...register('documents')}
                    error={errors.documents?.message}
                    placeholder="Enter document references (optional)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button type="submit" loading={isSubmitting}>
                  Submit Admission Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </Layout>
  );
}
