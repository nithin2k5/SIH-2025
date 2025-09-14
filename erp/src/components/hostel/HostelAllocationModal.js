'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { apiService } from '../../services/apiService';
import { HostelAllocation } from '../../types';

// Validation schema
const allocationSchema = yup.object({
  student_id: yup.string().required('Student ID is required'),
  room_id: yup.string().required('Room ID is required'),
  allocated_by: yup.string().required('Allocated by is required'),
  reason: yup.string().nullable()
});

export default function HostelAllocationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  allocation = null,
  room = null, 
  mode = 'create' // 'create' or 'edit'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const isEditMode = mode === 'edit' && allocation;
  const title = isEditMode ? 'Edit Room Allocation' : 'Allocate Room';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(allocationSchema),
    mode: 'onChange'
  });

  // Initialize form with allocation data if in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && allocation) {
        setValue('alloc_id', allocation.alloc_id);
        setValue('student_id', allocation.student_id);
        setValue('room_id', allocation.room_id);
        setValue('allocated_by', allocation.allocated_by);
        setValue('reason', allocation.reason);
      } else if (room) {
        reset({
          ...HostelAllocation,
          room_id: room.room_id,
          allocated_on: new Date(),
          status: 'active'
        });
      } else {
        reset({
          ...HostelAllocation,
          allocated_on: new Date(),
          status: 'active'
        });
      }
      setError(null);
    }
  }, [isOpen, isEditMode, allocation, room, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format the data
      const formattedData = {
        ...data,
        allocated_on: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      if (isEditMode) {
        // Update existing allocation
        const response = await apiService.updateHostelAllocation(
          allocation.alloc_id, 
          formattedData
        );
        
        if (response) {
          onSuccess(response);
          onClose();
        }
      } else {
        // Create new allocation
        const response = await apiService.allocateHostelRoom(
          data.student_id, 
          data.room_id, 
          {
            allocated_by: data.allocated_by,
            reason: data.reason
          }
        );
        
        if (response) {
          onSuccess(response);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting hostel allocation:', error);
      setError(error.message || 'Failed to save hostel allocation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="allocation-form"
            loading={isSubmitting}
          >
            {isEditMode ? 'Update' : 'Allocate'} Room
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form id="allocation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Student ID"
            {...register('student_id')}
            error={errors.student_id?.message}
            placeholder="Enter student ID"
          />
          
          <Input
            label="Room ID"
            {...register('room_id')}
            error={errors.room_id?.message}
            placeholder="Enter room ID"
            disabled={!!room}
          />
          
          <Input
            label="Allocated By"
            {...register('allocated_by')}
            error={errors.allocated_by?.message}
            placeholder="Enter name of person allocating the room"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
            <textarea
              {...register('reason')}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              rows={3}
              placeholder="Enter reason for allocation (optional)"
            ></textarea>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>
        </div>
      </form>

      {room && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Room Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Room Number:</span>
              <span className="ml-2 font-medium">{room.room_no}</span>
            </div>
            <div>
              <span className="text-gray-600">Block:</span>
              <span className="ml-2 font-medium">{room.block}</span>
            </div>
            <div>
              <span className="text-gray-600">Floor:</span>
              <span className="ml-2 font-medium">{room.floor}</span>
            </div>
            <div>
              <span className="text-gray-600">Capacity:</span>
              <span className="ml-2 font-medium">{room.capacity}</span>
            </div>
            <div>
              <span className="text-gray-600">Available Spaces:</span>
              <span className="ml-2 font-medium">{room.capacity - (room.occupied || 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Monthly Rent:</span>
              <span className="ml-2 font-medium">₹{room.rent_per_month?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
