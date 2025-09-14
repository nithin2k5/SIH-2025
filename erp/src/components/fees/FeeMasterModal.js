'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { apiService } from '../../services/apiService';
import { FeeMaster } from '../../types';

// Validation schema
const feeMasterSchema = yup.object({
  programme_id: yup.string().required('Programme ID is required'),
  component: yup.string().required('Fee component name is required'),
  amount: yup.number().required('Amount is required').min(0, 'Amount must be positive'),
  currency: yup.string().required('Currency is required'),
  category: yup.string().required('Category is required'),
  effective_from: yup.date().required('Effective from date is required'),
  effective_to: yup.date().nullable()
});

export default function FeeMasterModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  feeMaster = null, 
  mode = 'create' // 'create' or 'edit'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const isEditMode = mode === 'edit' && feeMaster;
  const title = isEditMode ? 'Edit Fee Structure' : 'Add Fee Structure';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(feeMasterSchema),
    mode: 'onChange'
  });

  // Initialize form with fee data if in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && feeMaster) {
        setValue('fee_id', feeMaster.fee_id);
        setValue('programme_id', feeMaster.programme_id);
        setValue('component', feeMaster.component);
        setValue('amount', feeMaster.amount);
        setValue('currency', feeMaster.currency);
        setValue('category', feeMaster.category);
        setValue('effective_from', new Date(feeMaster.effective_from).toISOString().split('T')[0]);
        if (feeMaster.effective_to) {
          setValue('effective_to', new Date(feeMaster.effective_to).toISOString().split('T')[0]);
        }
      } else {
        reset({
          ...FeeMaster,
          currency: 'INR',
          effective_from: new Date().toISOString().split('T')[0]
        });
      }
      setError(null);
    }
  }, [isOpen, isEditMode, feeMaster, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format dates properly
      const formattedData = {
        ...data,
        amount: Number(data.amount),
        effective_from: new Date(data.effective_from),
        effective_to: data.effective_to ? new Date(data.effective_to) : null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Add compatibility fields for the backend
      formattedData.course = formattedData.programme_id;
      formattedData.semester = 1; // Default semester
      formattedData.academicYear = new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
      
      // Map fee components to the structure expected by the backend
      formattedData.tuitionFee = formattedData.component === 'Tuition' ? formattedData.amount : 0;
      formattedData.hostelFee = formattedData.component === 'Hostel' ? formattedData.amount : 0;
      formattedData.examFee = formattedData.component === 'Exam' ? formattedData.amount : 0;
      formattedData.labFee = formattedData.component === 'Laboratory' ? formattedData.amount : 0;
      formattedData.libraryFee = formattedData.component === 'Library' ? formattedData.amount : 0;
      formattedData.otherFees = ['Sports', 'Development', 'Transport', 'Other'].includes(formattedData.component) ? formattedData.amount : 0;
      formattedData.totalFee = formattedData.amount;

      if (isEditMode) {
        // Update existing fee structure
        const response = await apiService.updateFeeStructure(
          feeMaster.fee_id, 
          formattedData
        );
        
        if (response) {
          onSuccess(response);
          onClose();
        }
      } else {
        // Create new fee structure
        const response = await apiService.createFeeStructure(formattedData);
        
        if (response) {
          onSuccess(response);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting fee structure:', error);
      setError(error.message || 'Failed to save fee structure. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feeCategories = [
    'Tuition',
    'Hostel',
    'Exam',
    'Library',
    'Laboratory',
    'Sports',
    'Development',
    'Transport',
    'Other'
  ];

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
            form="fee-form"
            loading={isSubmitting}
          >
            {isEditMode ? 'Update' : 'Create'} Fee Structure
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form id="fee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Programme ID"
            {...register('programme_id')}
            error={errors.programme_id?.message}
            placeholder="Enter programme ID"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Fee Category</label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            >
              <option value="">Select category</option>
              {feeCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          
          <Input
            label="Component Name"
            {...register('component')}
            error={errors.component?.message}
            placeholder="Enter component name"
          />
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                {...register('amount')}
                error={errors.amount?.message}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="w-24">
              <Input
                label="Currency"
                {...register('currency')}
                error={errors.currency?.message}
                placeholder="INR"
                defaultValue="INR"
              />
            </div>
          </div>
          
          <Input
            label="Effective From"
            type="date"
            {...register('effective_from')}
            error={errors.effective_from?.message}
          />
          
          <Input
            label="Effective To (Optional)"
            type="date"
            {...register('effective_to')}
            error={errors.effective_to?.message}
          />
        </div>
      </form>
    </Modal>
  );
}
