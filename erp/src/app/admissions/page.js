'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { apiService } from '../../services/apiService';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  FileText
} from 'lucide-react';

export default function AdmissionsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // Enhanced demo student data
      const demoStudents = [
        {
          id: '1',
          registrationNumber: 'CS2024001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1-555-0123',
          course: 'Computer Science',
          department: 'Computer Science',
          semester: 3,
          admissionDate: '2024-01-15',
          hostelAllocated: true,
          roomNumber: 'A-101',
          feesPaid: 25000,
          totalFees: 50000,
          status: 'active',
          gpa: 3.8,
          documents: ['transcript.pdf', 'id_proof.pdf'],
          guardian: 'Michael Johnson',
          address: '123 Oak Street, Springfield',
          bloodGroup: 'O+',
          emergencyContact: '+1-555-0199'
        },
        {
          id: '2',
          registrationNumber: 'ME2024002',
          name: 'David Chen',
          email: 'david.chen@email.com',
          phone: '+1-555-0124',
          course: 'Mechanical Engineering',
          department: 'Engineering',
          semester: 2,
          admissionDate: '2024-02-01',
          hostelAllocated: false,
          feesPaid: 30000,
          totalFees: 55000,
          status: 'active',
          gpa: 3.6,
          documents: ['marksheet.pdf', 'certificate.pdf'],
          guardian: 'Lisa Chen',
          address: '456 Pine Avenue, Riverside',
          bloodGroup: 'A+',
          emergencyContact: '+1-555-0198'
        },
        {
          id: '3',
          registrationNumber: 'EE2024003',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@email.com',
          phone: '+1-555-0125',
          course: 'Electrical Engineering',
          department: 'Engineering',
          semester: 4,
          admissionDate: '2023-08-15',
          hostelAllocated: true,
          roomNumber: 'B-205',
          feesPaid: 45000,
          totalFees: 50000,
          status: 'active',
          gpa: 3.9,
          documents: ['diploma.pdf', 'photo.jpg'],
          guardian: 'Carlos Rodriguez',
          address: '789 Maple Drive, Westfield',
          bloodGroup: 'B+',
          emergencyContact: '+1-555-0197'
        },
        {
          id: '4',
          registrationNumber: 'BT2024004',
          name: 'Michael Thompson',
          email: 'michael.thompson@email.com',
          phone: '+1-555-0126',
          course: 'Biotechnology',
          department: 'Life Sciences',
          semester: 1,
          admissionDate: '2024-03-10',
          hostelAllocated: true,
          roomNumber: 'C-301',
          feesPaid: 15000,
          totalFees: 48000,
          status: 'active',
          gpa: 3.7,
          documents: ['certificates.pdf', 'medical.pdf'],
          guardian: 'Jennifer Thompson',
          address: '321 Cedar Lane, Hillcrest',
          bloodGroup: 'AB+',
          emergencyContact: '+1-555-0196'
        },
        {
          id: '5',
          registrationNumber: 'CS2024005',
          name: 'Priya Patel',
          email: 'priya.patel@email.com',
          phone: '+1-555-0127',
          course: 'Computer Science',
          department: 'Computer Science',
          semester: 2,
          admissionDate: '2024-01-20',
          hostelAllocated: false,
          feesPaid: 20000,
          totalFees: 50000,
          status: 'pending',
          gpa: 3.5,
          documents: ['transcript.pdf', 'recommendation.pdf'],
          guardian: 'Raj Patel',
          address: '654 Birch Street, Lakeside',
          bloodGroup: 'O-',
          emergencyContact: '+1-555-0195'
        }
      ];
      setStudents(demoStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <Link href="/admissions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Admission
              </Button>
            </Link>
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
                                {student.name.split(' ').map(n => n[0]).join('')}
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
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
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
    </Layout>
  );
}
