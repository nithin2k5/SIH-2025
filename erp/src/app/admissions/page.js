'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { apiService } from '../../services/apiService';
import { ADMISSION_STATUS } from '../../types';
import AdmissionModal from '../../components/admissions/AdmissionModal';
import { ConfirmModal } from '../../components/ui/Modal';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Trash2
} from 'lucide-react';
import ApiStatusNotification from '../../components/ui/ApiStatusNotification';

export default function AdmissionsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [apiError, setApiError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Modal states
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAdmission, setCurrentAdmission] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      console.log('Loading admissions data...');
      const admissions = await apiService.getAdmissions();
      console.log('Received normalized admissions:', admissions);
      
      if (admissions && Array.isArray(admissions)) {
        // Map admission data to student format for display
        const mappedStudents = admissions.map(admission => ({
          id: admission.admission_id,
          registrationNumber: admission.application_ref,
          name: admission.applicant_name || `${admission.first_name} ${admission.last_name}`,
          email: admission.email,
          phone: admission.phone,
          course: admission.programme_applied,
          department: admission.programme_applied,
          semester: 1, // Default for new admissions
          admissionDate: admission.applied_on,
          hostelAllocated: false,
          roomNumber: null,
          feesPaid: 0,
          totalFees: 50000,
          status: admission.status === ADMISSION_STATUS.ADMITTED ? 'active' : admission.status,
          gpa: null,
          documents: admission.documents ? admission.documents.split(',') : [],
          guardian: '',
          address: '',
          bloodGroup: '',
          emergencyContact: '',
          // Store the original admission data for reference
          admissionData: admission
        }));
        setStudents(mappedStudents);
        setApiError(null);
        setUsingMockData(false);
      } else {
        setStudents([]);
        setApiError('No admissions data received from API');
        setUsingMockData(false);
      }
    } catch (error) {
      console.error('API call failed:', error);
      setApiError(error.message);
      setUsingMockData(false);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.course || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || (student.status === filterStatus);

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case ADMISSION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ADMISSION_STATUS.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800';
      case ADMISSION_STATUS.APPROVED:
        return 'bg-green-100 text-green-800';
      case ADMISSION_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      case ADMISSION_STATUS.ADMITTED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handler for opening the create admission modal
  const handleCreateAdmission = () => {
    setCurrentAdmission(null);
    setModalMode('create');
    setIsAdmissionModalOpen(true);
  };
  
  // Handler for opening the edit admission modal
  const handleEditAdmission = (student) => {
    setCurrentAdmission(student.admissionData);
    setModalMode('edit');
    setIsAdmissionModalOpen(true);
  };
  
  // Handler for opening the delete confirmation modal
  const handleDeleteClick = (student) => {
    setCurrentAdmission(student.admissionData);
    setIsDeleteModalOpen(true);
  };
  
  // Handler for successful admission creation/update
  const handleAdmissionSuccess = (admission) => {
    // Refresh the student list
    loadStudents();
  };
  
  // Handler for admission deletion
  const handleDeleteConfirm = async () => {
    if (!currentAdmission) return;
    
    try {
      setIsDeleting(true);
      await apiService.deleteAdmission(currentAdmission.admission_id);
      loadStudents();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting admission:', error);
      setApiError(error.message || 'Failed to delete admission');
    } finally {
      setIsDeleting(false);
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

  return (
    <Layout>
      <ApiStatusNotification 
        isConnected={!apiError}
        error={apiError}
        onDismiss={() => setApiError(null)}
      />
      <Breadcrumb items={[{ label: 'Admissions' }]} />

      {/* Header */}
      <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admissions Management</h1>
              <p className="text-gray-600 mt-2">
                View and manage student admissions
              </p>
            </div>
            <Button onClick={handleCreateAdmission}>
              <Plus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Semester</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.filter(s => s.semester === 3).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hostel Allocated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.filter(s => s.hostelAllocated).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, registration number, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Student Records</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {(student.name || 'N A').split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.registrationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleEditAdmission(student)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(student)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search criteria.'
                    : 'No student records available.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admission Modal */}
        <AdmissionModal
          isOpen={isAdmissionModalOpen}
          onClose={() => setIsAdmissionModalOpen(false)}
          onSuccess={handleAdmissionSuccess}
          admission={currentAdmission}
          mode={modalMode}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Admission"
          message={`Are you sure you want to delete the admission for ${currentAdmission?.applicant_name || 'this student'}? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={isDeleting}
        />
    </Layout>
  );
}
