'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { apiService } from '../../services/apiService';
import { HostelRoom, HOSTEL_STATUS } from '../../types';

// Validation schema
const hostelRoomSchema = yup.object({
  hostel: yup.string().required('Hostel name is required'),
  block: yup.string().required('Block is required'),
  floor: yup.number().required('Floor is required').integer('Floor must be an integer'),
  room_no: yup.string().required('Room number is required'),
  bed_no: yup.string().nullable(),
  capacity: yup.number().required('Capacity is required').min(1, 'Capacity must be at least 1'),
  status: yup.string().required('Status is required'),
  amenities: yup.string().nullable(),
  rent_per_month: yup.number().required('Monthly rent is required').min(0, 'Rent must be positive')
});

export default function HostelRoomModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  room = null, 
  mode = 'create' // 'create' or 'edit'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const isEditMode = mode === 'edit' && room;
  const title = isEditMode ? 'Edit Hostel Room' : 'Add Hostel Room';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(hostelRoomSchema),
    mode: 'onChange'
  });

  // Initialize form with room data if in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && room) {
        setValue('room_id', room.room_id);
        setValue('hostel', room.hostel);
        setValue('block', room.block);
        setValue('floor', room.floor);
        setValue('room_no', room.room_no);
        setValue('bed_no', room.bed_no);
        setValue('capacity', room.capacity);
        setValue('status', room.status);
        setValue('amenities', Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities);
        setValue('rent_per_month', room.rent_per_month);
      } else {
        reset({
          ...HostelRoom,
          status: HOSTEL_STATUS.AVAILABLE,
          capacity: 1,
          rent_per_month: 0
        });
      }
      setError(null);
    }
  }, [isOpen, isEditMode, room, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format the data
      const formattedData = {
        ...data,
        floor: Number(data.floor),
        capacity: Number(data.capacity),
        rent_per_month: Number(data.rent_per_month),
        amenities: data.amenities ? data.amenities.split(',').map(item => item.trim()) : [],
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Convert room_no to roomNumber for backend compatibility
      formattedData.roomNumber = formattedData.room_no;
      formattedData.monthlyRent = formattedData.rent_per_month;

      if (isEditMode) {
        // Update existing room
        const response = await apiService.updateHostelRoom(
          room.room_id, 
          formattedData
        );
        
        if (response) {
          onSuccess(response);
          onClose();
        }
      } else {
        // Create new room
        const response = await apiService.createHostelRoom(formattedData);
        
        if (response) {
          onSuccess(response);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting hostel room:', error);
      setError(error.message || 'Failed to save hostel room. Please try again.');
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
            form="room-form"
            loading={isSubmitting}
          >
            {isEditMode ? 'Update' : 'Create'} Room
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form id="room-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Hostel Name"
            {...register('hostel')}
            error={errors.hostel?.message}
            placeholder="Enter hostel name"
          />
          
          <Input
            label="Block"
            {...register('block')}
            error={errors.block?.message}
            placeholder="Enter block (e.g., A, B, C)"
          />
          
          <Input
            label="Floor"
            type="number"
            {...register('floor')}
            error={errors.floor?.message}
            placeholder="Enter floor number"
          />
          
          <Input
            label="Room Number"
            {...register('room_no')}
            error={errors.room_no?.message}
            placeholder="Enter room number"
          />
          
          <Input
            label="Bed Number (Optional)"
            {...register('bed_no')}
            error={errors.bed_no?.message}
            placeholder="Enter bed number if applicable"
          />
          
          <Input
            label="Capacity"
            type="number"
            {...register('capacity')}
            error={errors.capacity?.message}
            placeholder="Enter room capacity"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Room Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            >
              <option value={HOSTEL_STATUS.AVAILABLE}>Available</option>
              <option value={HOSTEL_STATUS.OCCUPIED}>Occupied</option>
              <option value={HOSTEL_STATUS.MAINTENANCE}>Maintenance</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
          
          <Input
            label="Monthly Rent"
            type="number"
            {...register('rent_per_month')}
            error={errors.rent_per_month?.message}
            placeholder="Enter monthly rent"
          />
          
          <div className="md:col-span-2">
            <Input
              label="Amenities (comma separated)"
              {...register('amenities')}
              error={errors.amenities?.message}
              placeholder="WiFi, AC, Attached Bathroom, etc."
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
