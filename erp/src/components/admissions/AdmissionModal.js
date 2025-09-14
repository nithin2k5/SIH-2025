'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { apiService } from '../../services/apiService';
import { Admission, ADMISSION_STATUS } from '../../types';

// Validation schema - Only fields stored in Admissions model
const admissionSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').required('Phone is required'),
  programme_applied: yup.string().required('Programme selection is required'),
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

export default function AdmissionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  admission = null, 
  mode = 'create' // 'create' or 'edit'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const isEditMode = mode === 'edit' && admission;
  const title = isEditMode ? 'Edit Admission' : 'New Admission';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(admissionSchema),
    mode: 'onChange'
  });

  // Initialize form with admission data if in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && admission) {
        setValue('first_name', admission.first_name);
        setValue('last_name', admission.last_name);
        setValue('email', admission.email);
        setValue('phone', admission.phone);
        setValue('programme_applied', admission.programme_applied);
        setValue('documents', admission.documents || '');
      } else {
        reset();
      }
      setError(null);
    }
  }, [isOpen, isEditMode, admission, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode) {
        // Update existing admission
        const updatedAdmission = {
          ...admission,
          ...data,
          updated_at: new Date()
        };

        const response = await apiService.updateAdmission(
          admission.admission_id, 
          updatedAdmission
        );
        
        if (response) {
          onSuccess(apiService.normalizeAdmissionData(response));
          onClose();
        }
      } else {
        // Create new admission
        const newAdmission = {
          ...Admission,
          ...data,
          applicant_name: `${data.first_name} ${data.last_name}`,
          status: ADMISSION_STATUS.PENDING,
          applied_on: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        };

        const response = await apiService.createAdmission(newAdmission);
        
        if (response) {
          const normalizedAdmission = apiService.normalizeAdmissionData(
            response.admission || response
          );
          onSuccess(normalizedAdmission);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting admission:', error);
      setError(error.message || 'Failed to save admission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="admission-form"
            loading={isSubmitting}
          >
            {isEditMode ? 'Update' : 'Create'} Admission
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form id="admission-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            {...register('first_name')}
            error={errors.first_name?.message}
            placeholder="Enter first name"
          />
          <Input
            label="Last Name"
            {...register('last_name')}
            error={errors.last_name?.message}
            placeholder="Enter last name"
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter email address"
            disabled={isEditMode} // Email can't be changed in edit mode
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
              {...register('programme_applied')}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            >
              <option value="">Select programme</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            {errors.programme_applied && (
              <p className="text-sm text-red-600">{errors.programme_applied.message}</p>
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
      </form>
    </Modal>
  );
}
