'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { apiService } from '../../services/apiService';
import {
  Search,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Receipt,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Eye,
  Users,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';

export default function FeesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [fees, setFees] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isStaff = user?.role === USER_ROLES.STAFF;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (isStudent) {
        // Student view - load their fees only
        const feesData = await apiService.getFees(user.id);
        setFees(feesData);
      } else {
        // Admin/Staff view - load all data
        const [feesData, structuresData, paymentsData] = await Promise.all([
          apiService.getFees(),
          apiService.getFeeStructures(),
          apiService.getPayments()
        ]);
        setFees(feesData);
        setFeeStructures(structuresData);
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error('Error fetching fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeId, paymentData) => {
    try {
      await apiService.createPayment({
        feeId,
        studentId: user.id,
        ...paymentData
      });
      fetchData();
      setShowPaymentModal(false);
      setSelectedFee(null);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Student View
  if (isStudent) {
    const pendingFees = fees.filter(fee => fee.status === 'pending');
    const paidFees = fees.filter(fee => fee.status === 'paid');
    const totalPending = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = paidFees.reduce((sum, fee) => sum + fee.amount, 0);

    return (
      <Layout>
        {/* Student Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Fee Management</h1>
              <p className="text-slate-600 text-lg mt-1">
                View and pay your fees • Registration: {user.registrationNumber}
              </p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" className="animate-slide-up">
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Pending Fees</p>
                  <p className="text-3xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-500 rounded-2xl shadow-lg">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Paid Fees</p>
                  <p className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Fees</p>
                  <p className="text-3xl font-bold text-slate-900">₹{(totalPending + totalPaid).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                  <Receipt className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Due This Month</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{pendingFees.filter(fee => new Date(fee.dueDate) <= new Date(Date.now() + 30*24*60*60*1000)).reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Fees */}
        {pendingFees.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Pending Fees</h2>
            <div className="space-y-4">
              {pendingFees.map((fee, index) => (
                <Card key={fee.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent padding="lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{fee.description}</h3>
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            {fee.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Amount:</span>
                            <span className="font-semibold ml-2 text-red-600">₹{fee.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Type:</span>
                            <span className="font-semibold ml-2 capitalize">{fee.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Due Date:</span>
                            <span className="font-semibold ml-2">{new Date(fee.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="primary"
                          onClick={() => {
                            setSelectedFee(fee);
                            setShowPaymentModal(true);
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        {paidFees.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment History</h2>
            <div className="space-y-4">
              {paidFees.map((fee, index) => (
                <Card key={fee.id} variant="outline" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent padding="lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{fee.description}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            Paid
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Amount:</span>
                            <span className="font-semibold ml-2 text-green-600">₹{fee.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Type:</span>
                            <span className="font-semibold ml-2 capitalize">{fee.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Paid Date:</span>
                            <span className="font-semibold ml-2">{new Date(fee.paidDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Receipt:</span>
                            <span className="font-semibold ml-2">#{fee.receiptNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // Admin/Staff View
  const totalFeesCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPendingFees = fees.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const totalStudentsWithPendingFees = new Set(fees.filter(fee => fee.status === 'pending').map(fee => fee.studentId)).size;

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      {/* Admin/Staff Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Fee Management</h1>
              <p className="text-slate-600 text-lg mt-1">
                Manage fee structures, payments, and collections
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Export
            </Button>
            <Button variant="primary">
              <Plus className="h-5 w-5 mr-2" />
              Add Fee Structure
            </Button>
          </div>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-4"></div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient" className="animate-slide-up">
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Collected</p>
                <p className="text-3xl font-bold text-green-600">₹{totalFeesCollected.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Pending Amount</p>
                <p className="text-3xl font-bold text-red-600">₹{totalPendingFees.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-500 rounded-2xl shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Students with Pending</p>
                <p className="text-3xl font-bold text-orange-600">{totalStudentsWithPendingFees}</p>
              </div>
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Payments</p>
                <p className="text-3xl font-bold text-blue-600">{payments.length}</p>
              </div>
              <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <Receipt className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'payments', label: 'Payments', icon: Receipt },
            { id: 'structures', label: 'Fee Structures', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card variant="outline">
            <CardContent padding="lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900">Recent Payments</h3>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Method</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Receipt</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{payment.studentName}</div>
                          <div className="text-sm text-slate-600">ID: {payment.studentId}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 capitalize">{payment.paymentMethod}</td>
                        <td className="px-6 py-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{payment.receiptNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fee Structures Tab */}
      {activeTab === 'structures' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feeStructures.map((structure, index) => (
              <Card key={structure.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader variant="gradient">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{structure.course}</h3>
                      <p className="text-sm text-slate-600">Semester {structure.semester} • {structure.academicYear}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent padding="lg">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tuition Fee:</span>
                        <span className="font-semibold">₹{structure.tuitionFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hostel Fee:</span>
                        <span className="font-semibold">₹{structure.hostelFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Exam Fee:</span>
                        <span className="font-semibold">₹{structure.examFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Lab Fee:</span>
                        <span className="font-semibold">₹{structure.labFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Library Fee:</span>
                        <span className="font-semibold">₹{structure.libraryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Other Fees:</span>
                        <span className="font-semibold">₹{structure.otherFees.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Fee:</span>
                        <span className="text-blue-600">₹{structure.totalFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="w-full max-w-md mx-4">
            <CardHeader variant="gradient">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Process Payment</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedFee(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900">{selectedFee.description}</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{selectedFee.amount.toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="online">Online Payment</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedFee(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handlePayment(selectedFee.id, { amount: selectedFee.amount, paymentMethod: 'online' })}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}