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

// Validation schema
const admissionSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').required('Phone is required'),
  dateOfBirth: yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future'),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Please select a valid gender').required('Gender is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().matches(/^\d{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
  course: yup.string().required('Course selection is required'),
  department: yup.string().required('Department is required'),
  semester: yup.number().min(1).max(8).required('Semester is required'),
  guardianName: yup.string().required('Guardian name is required'),
  guardianPhone: yup.string().matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').required('Guardian phone is required'),
  guardianRelation: yup.string().required('Relationship is required'),
  previousInstitution: yup.string().required('Previous institution is required'),
  qualification: yup.string().required('Qualification is required'),
  marksObtained: yup.number().min(0).max(100).required('Marks obtained is required'),
  totalMarks: yup.number().min(0).required('Total marks is required'),
  yearOfPassing: yup.number().min(2000).max(new Date().getFullYear()).required('Year of passing is required')
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
  const [step, setStep] = useState(1);
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

      // Submit to actual API
      const response = await apiService.createAdmission(data);
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

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const getFieldsForStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'];
      case 2:
        return ['address', 'city', 'state', 'pincode'];
      case 3:
        return ['course', 'department', 'semester'];
      case 4:
        return ['guardianName', 'guardianPhone', 'guardianRelation'];
      case 5:
        return ['previousInstitution', 'qualification', 'marksObtained', 'totalMarks', 'yearOfPassing'];
      default:
        return [];
    }
  };

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

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Personal Info', 'Address', 'Academic', 'Guardian', 'Documents'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === index + 1 ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {index < 4 && (
                  <div className={`w-12 h-1 mx-4 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Step {step} of 5: {
                step === 1 ? 'Personal Information' :
                step === 2 ? 'Address Details' :
                step === 3 ? 'Academic Information' :
                step === 4 ? 'Guardian Details' :
                'Previous Education'
              }
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
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
                  <Input
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    error={errors.dateOfBirth?.message}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      {...register('gender')}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Address Details */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="Enter full address"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <Input
                    label="City"
                    {...register('city')}
                    error={errors.city?.message}
                    placeholder="Enter city"
                  />
                  <Input
                    label="State"
                    {...register('state')}
                    error={errors.state?.message}
                    placeholder="Enter state"
                  />
                  <Input
                    label="Pincode"
                    {...register('pincode')}
                    error={errors.pincode?.message}
                    placeholder="Enter 6-digit pincode"
                  />
                </div>
              )}

              {/* Step 3: Academic Information */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <select
                      {...register('course')}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    >
                      <option value="">Select course</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                    {errors.course && (
                      <p className="text-sm text-red-600">{errors.course.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      {...register('department')}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>
                  <Input
                    label="Semester"
                    type="number"
                    min="1"
                    max="8"
                    {...register('semester')}
                    error={errors.semester?.message}
                    placeholder="Enter semester (1-8)"
                  />
                </div>
              )}

              {/* Step 4: Guardian Details */}
              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Guardian Name"
                    {...register('guardianName')}
                    error={errors.guardianName?.message}
                    placeholder="Enter guardian's full name"
                  />
                  <Input
                    label="Guardian Phone"
                    {...register('guardianPhone')}
                    error={errors.guardianPhone?.message}
                    placeholder="Enter guardian's phone number"
                  />
                  <Input
                    label="Relationship"
                    {...register('guardianRelation')}
                    error={errors.guardianRelation?.message}
                    placeholder="e.g., Father, Mother, Guardian"
                  />
                </div>
              )}

              {/* Step 5: Previous Education */}
              {step === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Previous Institution"
                    {...register('previousInstitution')}
                    error={errors.previousInstitution?.message}
                    placeholder="Enter school/college name"
                  />
                  <Input
                    label="Qualification"
                    {...register('qualification')}
                    error={errors.qualification?.message}
                    placeholder="e.g., 12th Grade, Diploma"
                  />
                  <Input
                    label="Marks Obtained"
                    type="number"
                    min="0"
                    max="100"
                    {...register('marksObtained')}
                    error={errors.marksObtained?.message}
                    placeholder="Enter marks obtained"
                  />
                  <Input
                    label="Total Marks"
                    type="number"
                    min="0"
                    {...register('totalMarks')}
                    error={errors.totalMarks?.message}
                    placeholder="Enter total marks"
                  />
                  <Input
                    label="Year of Passing"
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    {...register('yearOfPassing')}
                    error={errors.yearOfPassing?.message}
                    placeholder="Enter year of passing"
                  />

                  {/* Document Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Document Upload (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Photo', 'ID Proof', 'Marksheet'].map((doc) => (
                        <div key={doc} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">{doc}</p>
                          <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Previous
                </Button>

                {step < 5 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" loading={isSubmitting}>
                    Submit Admission
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
    </Layout>
  );
}
