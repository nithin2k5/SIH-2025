'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { apiService } from '../../services/apiService';
import HostelRoomModal from '../../components/hostel/HostelRoomModal';
import HostelAllocationModal from '../../components/hostel/HostelAllocationModal';
import { ConfirmModal } from '../../components/ui/Modal';
import {
  Building,
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  Eye,
  Edit,
  Bed,
  Wifi,
  Car,
  Zap,
  Trash2,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  X
} from 'lucide-react';

export default function HostelPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBlock, setFilterBlock] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [isDeleting, setIsDeleting] = useState(false);

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isHostelWarden = user?.role === USER_ROLES.HOSTEL_WARDEN;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const canManageHostel = isHostelWarden || isAdmin;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiService.getHostelRooms();
      setRooms(response.rooms || []);
    } catch (error) {
      console.error('Error fetching hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Room CRUD handlers
  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setModalMode('create');
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setModalMode('edit');
    setShowRoomModal(true);
  };

  const handleDeleteRoomClick = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const handleRoomSuccess = (room) => {
    fetchData();
  };

  const handleDeleteRoomConfirm = async () => {
    if (!selectedRoom) return;
    
    try {
      setIsDeleting(true);
      await apiService.deleteHostelRoom(selectedRoom.room_id || selectedRoom.id);
      fetchData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting hostel room:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Allocation handlers
  const handleRoomAllocation = async (studentId, roomId) => {
    try {
      await apiService.allocateHostelRoom(studentId, roomId);
      fetchData();
      setShowAllocationModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error allocating room:', error);
    }
  };

  const handleRoomDeallocation = async (studentId) => {
    try {
      await apiService.deallocateHostelRoom(studentId);
      fetchData();
    } catch (error) {
      console.error('Error deallocating room:', error);
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

  const availableRooms = rooms.filter(room => room.occupied < room.capacity);
  const occupiedRooms = rooms.filter(room => room.occupied >= room.capacity);
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance');
  const totalOccupancy = rooms.reduce((sum, room) => sum + room.occupied, 0);
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  const blocks = [...new Set(rooms.map(room => room.block))];

  const filteredRooms = rooms.filter(room => {
    // Use room_no as fallback if roomNumber is not available
    const roomNumber = room.roomNumber || room.room_no || '';
    const matchesSearch = roomNumber.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && room.status === 'available') ||
                         (filterStatus === 'occupied' && room.status === 'occupied') ||
                         (filterStatus === 'maintenance' && room.status === 'maintenance');
    const matchesBlock = filterBlock === 'all' || (room.block || '').toString() === filterBlock;
    return matchesSearch && matchesStatus && matchesBlock;
  });

  // Student View
  if (isStudent) {
    const studentRoom = rooms.find(room => room.students?.some(s => s.id === user.id));

  return (
    <Layout>
        {/* Student Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Hostel Information</h1>
              <p className="text-slate-600 text-lg mt-1">
                View your room allocation and hostel details
              </p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
        </div>

        {/* Student Room Info */}
        {studentRoom ? (
          <Card variant="elevated" className="mb-8">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Bed className="h-6 w-6 mr-3" />
                Your Room Allocation
              </h3>
            </CardHeader>
            <CardContent padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Room Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Room Number:</span>
                        <span className="font-semibold">{studentRoom.roomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Block:</span>
                        <span className="font-semibold">{studentRoom.block}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Floor:</span>
                        <span className="font-semibold">{studentRoom.floor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Occupancy:</span>
                        <span className="font-semibold">{studentRoom.occupied}/{studentRoom.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Rent:</span>
                        <span className="font-semibold text-green-600">₹{studentRoom.monthlyRent.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {studentRoom.amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Roommates</h4>
                  <div className="space-y-3">
                    {studentRoom.students?.filter(s => s.id !== user.id).map((roommate, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{roommate.name}</p>
                          <p className="text-sm text-slate-600">{roommate.course} • Sem {roommate.semester}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-slate-500 text-center py-4">No roommates assigned yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="outline" className="mb-8 text-center py-12">
            <CardContent>
              <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Room Allocated</h3>
              <p className="text-slate-600 mb-6">
                You haven't been allocated a hostel room yet. Please contact the hostel warden for assistance.
              </p>
              <Button variant="primary">
                <Phone className="h-5 w-5 mr-2" />
                Contact Hostel Office
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hostel Rules & Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900">Hostel Rules</h3>
            </CardHeader>
            <CardContent padding="lg">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Maintain cleanliness in your room and common areas
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  No visitors allowed after 10:00 PM
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Report any maintenance issues immediately
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Respect fellow students and maintain discipline
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Pay hostel fees on time
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900">Contact Information</h3>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Hostel Warden</p>
                    <p className="text-sm text-slate-600">Mr. Rajesh Kumar</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <p className="text-sm text-slate-600">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-sm text-slate-600">hostel@college.edu</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Office Hours</p>
                    <p className="text-sm text-slate-600">9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Admin/Hostel Warden View
  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="h-7 w-7 text-white" />
                </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Hostel Management</h1>
              <p className="text-slate-600 text-lg mt-1">
                Manage room allocations and hostel operations
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={handleCreateRoom}>
            <Plus className="h-5 w-5 mr-2" />
            Add Room
          </Button>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mt-4"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient" className="animate-slide-up">
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Rooms</p>
                <p className="text-3xl font-bold text-slate-900">{rooms.length}</p>
              </div>
              <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <Building className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
              </div>
              <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Available Rooms</p>
                <p className="text-3xl font-bold text-blue-600">{availableRooms.length}</p>
              </div>
              <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Maintenance</p>
                <p className="text-3xl font-bold text-orange-600">{maintenanceRooms.length}</p>
                </div>
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                <Settings className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Filters */}
      <Card variant="outline" className="mb-8">
        <CardContent padding="lg">
          <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
                />
              </div>
            <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              <select
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Blocks</option>
                {blocks.map(block => (
                  <option key={block} value={block}>Block {block}</option>
                ))}
              </select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room, index) => (
          <Card key={room.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 50}ms`}}>
            <CardHeader variant="gradient" className="pb-4">
              <div className="flex items-center justify-between">
                    <div>
                  <h3 className="text-lg font-bold text-slate-900">{room.roomNumber}</h3>
                  <p className="text-sm text-slate-600">Block {room.block} • Floor {room.floor}</p>
                    </div>
                <div className="flex space-x-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    room.occupied < room.capacity ? 'bg-green-100 text-green-800' :
                    room.occupied >= room.capacity ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {room.occupied < room.capacity ? 'Available' : 
                     room.status === 'maintenance' ? 'Maintenance' : 'Occupied'}
                    </span>
                </div>
                  </div>
                </CardHeader>
            
            <CardContent padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Occupancy:</span>
                  <span className="font-semibold">{room.occupied}/{room.capacity}</span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Monthly Rent:</span>
                  <span className="font-semibold text-green-600">₹{room.monthlyRent.toLocaleString()}</span>
                    </div>

                <div className="text-sm">
                  <p className="text-slate-600 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                    </div>
                    </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                    {room.occupied < room.capacity && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowAllocationModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Allocate
                          </Button>
                        )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteRoomClick(room)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

      {filteredRooms.length === 0 && (
        <Card variant="outline" className="text-center py-12">
          <CardContent>
            <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No rooms found</h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Room Allocation Modal */}
      <HostelAllocationModal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        onSuccess={handleRoomSuccess}
        allocation={selectedAllocation}
        room={selectedRoom}
        mode="create"
      />

      {/* Room Modal */}
      <HostelRoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSuccess={handleRoomSuccess}
        room={selectedRoom}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRoomConfirm}
        title="Delete Hostel Room"
        message={`Are you sure you want to delete room ${selectedRoom?.room_no || selectedRoom?.roomNumber || 'this room'}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </Layout>
  );
}