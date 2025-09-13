// Hostel management functions

/**
 * Get all hostel rooms with filters
 */
function getHostelRooms(filters = {}) {
  const roomsSheet = getSheet('HostelRooms');
  if (!roomsSheet) {
    return { success: false, error: 'HostelRooms sheet not found' };
  }

  const data = roomsSheet.getDataRange().getValues();
  const headers = data[0];

  let rooms = [];

  for (let i = 1; i < data.length; i++) {
    const room = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.hostel && room.hostel !== filters.hostel) continue;
    if (filters.status && room.status !== filters.status) continue;
    if (filters.floor && room.floor != filters.floor) continue;

    rooms.push(room);
  }

  return { success: true, rooms };
}

/**
 * Get hostel room by ID
 */
function getHostelRoom(roomId) {
  const roomsSheet = getSheet('HostelRooms');
  if (!roomsSheet) {
    return { success: false, error: 'HostelRooms sheet not found' };
  }

  const result = findRowById(roomsSheet, 'room_id', roomId);
  if (!result) {
    return { success: false, error: 'Room not found' };
  }

  const headers = roomsSheet.getRange(1, 1, 1, roomsSheet.getLastColumn()).getValues()[0];
  const room = rowToObject(headers, result.rowData);

  return { success: true, room };
}

/**
 * Allocate room to student
 */
function allocateRoom(studentId, roomId, allocationData = {}) {
  const roomsSheet = getSheet('HostelRooms');
  const allocationsSheet = getSheet('HostelAllocations');

  if (!roomsSheet || !allocationsSheet) {
    return { success: false, error: 'Required sheets not found' };
  }

  // Check if room exists and is available
  const roomResult = findRowById(roomsSheet, 'room_id', roomId);
  if (!roomResult) {
    return { success: false, error: 'Room not found' };
  }

  const headers = roomsSheet.getRange(1, 1, 1, roomsSheet.getLastColumn()).getValues()[0];
  const room = rowToObject(headers, roomResult.rowData);

  if (room.status !== 'available') {
    return { success: false, error: 'Room is not available for allocation' };
  }

  // Check if student already has a room allocation
  const existingAllocation = getStudentAllocation(studentId);
  if (existingAllocation.success && existingAllocation.allocation) {
    return { success: false, error: 'Student already has a room allocation' };
  }

  // Create allocation
  const allocId = generateId('ALLOC');
  const now = getCurrentTimestamp();

  const newAllocation = {
    alloc_id: allocId,
    student_id: studentId,
    room_id: roomId,
    allocated_by: allocationData.allocated_by || 'system',
    allocated_on: now,
    released_on: '',
    reason: allocationData.reason || 'Regular allocation',
    status: 'active',
    created_at: now,
    updated_at: now
  };

  // Add allocation to sheet
  const allocHeaders = allocationsSheet.getRange(1, 1, 1, allocationsSheet.getLastColumn()).getValues()[0];
  const allocRowData = allocHeaders.map(header => newAllocation[header] || '');
  allocationsSheet.appendRow(allocRowData);

  // Update room status and current student
  roomsSheet.getRange(roomResult.rowIndex, headers.indexOf('current_student_id') + 1).setValue(studentId);
  roomsSheet.getRange(roomResult.rowIndex, headers.indexOf('status') + 1).setValue('occupied');
  roomsSheet.getRange(roomResult.rowIndex, headers.indexOf('allocated_on') + 1).setValue(now);

  // Update student record with hostel allocation ID
  updateStudentHostelAlloc(studentId, allocId);

  // Log audit
  logAudit('HostelAllocations', allocId, 'create', null, newAllocation);

  return { success: true, allocation: newAllocation, room };
}

/**
 * Deallocate room from student
 */
function deallocateRoom(studentId, reason = '') {
  const roomsSheet = getSheet('HostelRooms');
  const allocationsSheet = getSheet('HostelAllocations');

  if (!roomsSheet || !allocationsSheet) {
    return { success: false, error: 'Required sheets not found' };
  }

  // Find active allocation for student
  const allocation = getStudentAllocation(studentId);
  if (!allocation.success || !allocation.allocation) {
    return { success: false, error: 'No active room allocation found for student' };
  }

  const allocData = allocation.allocation;
  const roomId = allocData.room_id;

  // Update allocation
  const allocResult = findRowById(allocationsSheet, 'alloc_id', allocData.alloc_id);
  if (allocResult) {
    const allocHeaders = allocationsSheet.getRange(1, 1, 1, allocationsSheet.getLastColumn()).getValues()[0];
    const now = getCurrentTimestamp();

    allocationsSheet.getRange(allocResult.rowIndex, allocHeaders.indexOf('released_on') + 1).setValue(now);
    allocationsSheet.getRange(allocResult.rowIndex, allocHeaders.indexOf('reason') + 1).setValue(reason || 'Deallocated');
    allocationsSheet.getRange(allocResult.rowIndex, allocHeaders.indexOf('status') + 1).setValue('inactive');
    allocationsSheet.getRange(allocResult.rowIndex, allocHeaders.indexOf('updated_at') + 1).setValue(now);
  }

  // Update room status
  const roomResult = findRowById(roomsSheet, 'room_id', roomId);
  if (roomResult) {
    const roomHeaders = roomsSheet.getRange(1, 1, 1, roomsSheet.getLastColumn()).getValues()[0];

    roomsSheet.getRange(roomResult.rowIndex, roomHeaders.indexOf('current_student_id') + 1).setValue('');
    roomsSheet.getRange(roomResult.rowIndex, roomHeaders.indexOf('status') + 1).setValue('available');
    roomsSheet.getRange(roomResult.rowIndex, roomHeaders.indexOf('released_on') + 1).setValue(getCurrentTimestamp());
  }

  // Update student record
  updateStudentHostelAlloc(studentId, '');

  // Log audit
  logAudit('HostelAllocations', allocData.alloc_id, 'deallocate', allocData, { ...allocData, status: 'inactive', released_on: getCurrentTimestamp() });

  return { success: true };
}

/**
 * Get student room allocation
 */
function getStudentAllocation(studentId) {
  const allocationsSheet = getSheet('HostelAllocations');
  if (!allocationsSheet) {
    return { success: false, error: 'HostelAllocations sheet not found' };
  }

  const data = allocationsSheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    const allocation = rowToObject(headers, data[i]);
    if (allocation.student_id === studentId && allocation.status === 'active') {
      return { success: true, allocation };
    }
  }

  return { success: true, allocation: null };
}

/**
 * Get all hostel allocations with filters
 */
function getHostelAllocations(filters = {}) {
  const allocationsSheet = getSheet('HostelAllocations');
  if (!allocationsSheet) {
    return { success: false, error: 'HostelAllocations sheet not found' };
  }

  const data = allocationsSheet.getDataRange().getValues();
  const headers = data[0];

  let allocations = [];

  for (let i = 1; i < data.length; i++) {
    const allocation = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.student_id && allocation.student_id !== filters.student_id) continue;
    if (filters.room_id && allocation.room_id !== filters.room_id) continue;
    if (filters.status && allocation.status !== filters.status) continue;

    allocations.push(allocation);
  }

  return { success: true, allocations };
}

/**
 * Update student hostel allocation ID
 */
function updateStudentHostelAlloc(studentId, allocId) {
  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return;
  }

  const result = findRowById(studentsSheet, 'student_id', studentId);
  if (result) {
    const headers = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
    studentsSheet.getRange(result.rowIndex, headers.indexOf('hostel_alloc_id') + 1).setValue(allocId);
  }
}

/**
 * Create new hostel room
 */
function createHostelRoom(roomData) {
  // Validate required fields
  const required = ['room_id', 'hostel', 'block', 'floor', 'room_no'];
  const missing = validateRequired(roomData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const roomsSheet = getSheet('HostelRooms');
  if (!roomsSheet) {
    return { success: false, error: 'HostelRooms sheet not found' };
  }

  // Check if room already exists
  const existingRoom = findRowById(roomsSheet, 'room_id', roomData.room_id);
  if (existingRoom) {
    return { success: false, error: 'Room with this ID already exists' };
  }

  // Create new room
  const now = getCurrentTimestamp();
  const newRoom = {
    room_id: roomData.room_id,
    hostel: roomData.hostel,
    block: roomData.block,
    floor: roomData.floor,
    room_no: roomData.room_no,
    bed_no: roomData.bed_no || '',
    capacity: roomData.capacity || 1,
    current_student_id: '',
    status: 'available',
    allocated_on: '',
    released_on: '',
    amenities: roomData.amenities || '',
    rent_per_month: roomData.rent_per_month || 0,
    created_at: now,
    updated_at: now
  };

  // Add to sheet
  const headers = roomsSheet.getRange(1, 1, 1, roomsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newRoom[header] || '');

  roomsSheet.appendRow(rowData);

  // Log audit
  logAudit('HostelRooms', newRoom.room_id, 'create', null, newRoom);

  return { success: true, room: newRoom };
}

/**
 * Update hostel room
 */
function updateHostelRoom(roomId, updateData) {
  const roomsSheet = getSheet('HostelRooms');
  if (!roomsSheet) {
    return { success: false, error: 'HostelRooms sheet not found' };
  }

  const result = findRowById(roomsSheet, 'room_id', roomId);
  if (!result) {
    return { success: false, error: 'Room not found' };
  }

  const headers = roomsSheet.getRange(1, 1, 1, roomsSheet.getLastColumn()).getValues()[0];
  const currentRoom = rowToObject(headers, result.rowData);

  // Update fields
  const updatedRoom = {
    ...currentRoom,
    ...updateData,
    updated_at: getCurrentTimestamp()
  };

  // Update row
  const rowData = headers.map(header => updatedRoom[header] || '');
  roomsSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('HostelRooms', roomId, 'update', currentRoom, updatedRoom);

  return { success: true, room: updatedRoom };
}

/**
 * Get hostel statistics
 */
function getHostelStats() {
  const rooms = getHostelRooms();
  const allocations = getHostelAllocations();

  if (!rooms.success || !allocations.success) {
    return { success: false, error: 'Failed to fetch hostel data' };
  }

  let stats = {
    totalRooms: rooms.rooms.length,
    availableRooms: 0,
    occupiedRooms: 0,
    totalAllocations: allocations.allocations.length,
    activeAllocations: 0,
    occupancyRate: 0,
    byHostel: {},
    byBlock: {}
  };

  // Count room status
  rooms.rooms.forEach(room => {
    if (room.status === 'available') {
      stats.availableRooms++;
    } else if (room.status === 'occupied') {
      stats.occupiedRooms++;
    }

    // Count by hostel
    const hostel = room.hostel || 'Unknown';
    if (!stats.byHostel[hostel]) {
      stats.byHostel[hostel] = { total: 0, available: 0, occupied: 0 };
    }
    stats.byHostel[hostel].total++;
    if (room.status === 'available') stats.byHostel[hostel].available++;
    if (room.status === 'occupied') stats.byHostel[hostel].occupied++;

    // Count by block
    const block = room.block || 'Unknown';
    if (!stats.byBlock[block]) {
      stats.byBlock[block] = { total: 0, available: 0, occupied: 0 };
    }
    stats.byBlock[block].total++;
    if (room.status === 'available') stats.byBlock[block].available++;
    if (room.status === 'occupied') stats.byBlock[block].occupied++;
  });

  // Count active allocations
  allocations.allocations.forEach(allocation => {
    if (allocation.status === 'active') {
      stats.activeAllocations++;
    }
  });

  // Calculate occupancy rate
  if (stats.totalRooms > 0) {
    stats.occupancyRate = ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1);
  }

  return { success: true, stats };
}
