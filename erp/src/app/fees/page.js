'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { mockApi } from '../../services/mockData';
import {
  Search,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Receipt,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function FeesPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('lookup'); // lookup, review, payment, confirmation
  const [selectedFees, setSelectedFees] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [receiptData, setReceiptData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const isStudent = user?.role === USER_ROLES.STUDENT;

  // Auto-load student data for students
  useEffect(() => {
    if (isStudent) {
      loadStudentFees(user.registrationNumber);
    }
  }, [isStudent, user]);

  const loadStudentFees = async (registrationNumber) => {
    setLoading(true);
    try {
      const [studentData, feesData] = await Promise.all([
        mockApi.getStudentByRegistration(registrationNumber),
        mockApi.getFees(null) // In real app, filter by student ID
      ]);

      if (studentData) {
        setStudent(studentData);
        setFees(feesData.filter(fee => fee.studentId === studentData.id));
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onStudentLookup = async (data) => {
    await loadStudentFees(data.registrationNumber);
  };

  const handleFeeSelection = (feeId, checked) => {
    if (checked) {
      setSelectedFees([...selectedFees, feeId]);
    } else {
      setSelectedFees(selectedFees.filter(id => id !== feeId));
    }
  };

  const getSelectedFeesTotal = () => {
    return fees
      .filter(fee => selectedFees.includes(fee.id))
      .reduce((total, fee) => total + fee.amount, 0);
  };

  const proceedToPayment = () => {
    if (selectedFees.length > 0) {
      setPaymentStep('review');
    }
  };

  const processPayment = async () => {
    setPaymentStep('payment');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate receipt
    const receiptNumber = `RCP${Date.now()}`;
    const totalAmount = getSelectedFeesTotal();

    setReceiptData({
      receiptNumber,
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      amount: totalAmount,
      paymentMethod,
      date: new Date().toLocaleDateString(),
      paidFees: fees.filter(fee => selectedFees.includes(fee.id))
    });

    setPaymentStep('confirmation');
  };

  const resetPayment = () => {
    setStudent(null);
    setFees([]);
    setSelectedFees([]);
    setPaymentStep('lookup');
    setReceiptData(null);
    reset();
  };

  if (paymentStep === 'confirmation' && receiptData) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your fee payment has been processed successfully.
              </p>

              {/* Receipt */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Payment Receipt</h3>
                    <Receipt className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Receipt Number</p>
                      <p className="font-medium">{receiptData.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-medium">{receiptData.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Student Name</p>
                      <p className="font-medium">{receiptData.studentName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Registration No.</p>
                      <p className="font-medium">{receiptData.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount Paid</p>
                      <p className="font-medium">${receiptData.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">{receiptData.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">Paid Fees:</p>
                    {receiptData.paidFees.map(fee => (
                      <div key={fee.id} className="flex justify-between text-sm">
                        <span>{fee.type} Fee</span>
                        <span>${fee.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-x-4">
                <Button onClick={() => window.print()}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
                <Button variant="secondary" onClick={resetPayment}>
                  Make Another Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (paymentStep === 'payment') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
              <p className="text-gray-600">
                Please do not close this window while we process your payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Fee Payment' }]} />

      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Payment Portal</h1>
          <p className="text-gray-600 mt-2">
            {isStudent
              ? 'View and pay your outstanding fees'
              : 'Search for a student and process fee payments'
            }
          </p>
        </div>

        {/* Student Lookup (for staff/admin) */}
        {!isStudent && paymentStep === 'lookup' && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Student Lookup</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onStudentLookup)} className="flex gap-4">
                <Input
                  label="Registration Number"
                  {...register('registrationNumber', { required: 'Registration number is required' })}
                  error={errors.registrationNumber?.message}
                  placeholder="Enter student registration number"
                  className="flex-1"
                />
                <Button type="submit" loading={loading} className="mt-6">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Student Information */}
        {student && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Student Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration Number</p>
                  <p className="font-medium">{student.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{student.course}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Details */}
        {student && fees.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Outstanding Fees</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fees.map(fee => (
                  <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedFees.includes(fee.id)}
                        onChange={(e) => handleFeeSelection(fee.id, e.target.checked)}
                        disabled={fee.status === 'paid'}
                        className="rounded border-gray-300"
                      />
                      <div>
                        <p className="font-medium capitalize">{fee.type} Fee</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(fee.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${fee.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        fee.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : fee.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fee.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedFees.length > 0 && paymentStep === 'lookup' && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total Selected:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${getSelectedFeesTotal()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'online', label: 'Online Payment', icon: CreditCard },
                          { value: 'cash', label: 'Cash Payment', icon: DollarSign }
                        ].map(method => (
                          <label
                            key={method.value}
                            className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                              paymentMethod === method.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="sr-only"
                            />
                            <method.icon className="h-5 w-5 text-gray-600 mr-3" />
                            <span className="font-medium">{method.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button onClick={proceedToPayment} className="w-full">
                      Proceed to Payment Review
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Review */}
        {paymentStep === 'review' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Payment Review</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Payment Summary</h3>
                  <div className="space-y-2">
                    {fees
                      .filter(fee => selectedFees.includes(fee.id))
                      .map(fee => (
                        <div key={fee.id} className="flex justify-between text-sm">
                          <span>{fee.type} Fee</span>
                          <span>${fee.amount}</span>
                        </div>
                      ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>${getSelectedFeesTotal()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setPaymentStep('lookup')}>
                    Back
                  </Button>
                  <Button onClick={processPayment}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No fees message */}
        {student && fees.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Fees Paid</h3>
              <p className="text-gray-600">
                This student has no outstanding fees at this time.
              </p>
            </CardContent>
          </Card>
        )}
    </Layout>
  );
}
